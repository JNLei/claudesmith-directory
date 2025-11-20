'use server';

import { unstable_cache } from 'next/cache';
import path from 'path';
import { MARKETPLACES, MarketplaceConfig } from '../marketplaces.config';
import { GitHubFetcher } from '../fetchers/github-fetcher';
import { LocalFetcher } from '../fetchers/local-fetcher';
import { ToolWithContent } from '../types';
import type { MarketplaceFetcher } from '../fetchers/marketplace-fetcher.interface';

/**
 * Load all tools from all enabled marketplaces
 * Cached with Next.js unstable_cache
 */
export const loadAllTools = unstable_cache(
    async (): Promise<ToolWithContent[]> => {
        const allTools: ToolWithContent[] = [];

        for (const marketplace of MARKETPLACES) {
            if (!marketplace.enabled) continue;

            try {
                const tools = await loadMarketplaceTools(marketplace);
                allTools.push(...tools);
                console.log(`✓ Loaded ${tools.length} tools from ${marketplace.name}`);
            } catch (error) {
                console.error(`✗ Failed to load marketplace: ${marketplace.name}`, error);
            }
        }

        return allTools;
    },
    ['all-marketplace-tools'],
    {
        revalidate: 3600, // Revalidate every hour
        tags: ['marketplace-tools']
    }
);

/**
 * Load tools from a single marketplace
 */
async function loadMarketplaceTools(
    marketplace: MarketplaceConfig
): Promise<ToolWithContent[]> {

    // Create appropriate fetcher
    const fetcher = marketplace.source.type === 'local'
        ? new LocalFetcher(marketplace.source.path)
        : new GitHubFetcher({
            owner: marketplace.source.owner,
            repo: marketplace.source.repo,
            branch: marketplace.source.branch,
            cacheRevalidate: marketplace.cacheRevalidate
        });

    // Fetch marketplace.json
    const marketplaceData = await fetcher.fetchMarketplace();

    // Load each plugin
    const tools: ToolWithContent[] = [];

    for (const plugin of marketplaceData.plugins) {
        const pluginTools = await loadPlugin(
            plugin,
            fetcher,
            marketplace,
            marketplaceData
        );
        tools.push(...pluginTools);
    }

    return tools;
}

/**
 * Load a single plugin (may expand to multiple tools)
 */
async function loadPlugin(
    plugin: any,
    fetcher: MarketplaceFetcher,
    marketplace: MarketplaceConfig,
    marketplaceData: any
): Promise<ToolWithContent[]> {

    const tools: ToolWithContent[] = [];

    // Get plugin metadata (if strict mode and relative path source)
    let pluginMetadata = null;
    const pluginSource = typeof plugin.source === 'string' ? plugin.source : plugin.source?.path || './';

    if (plugin.strict !== false) {
        try {
            const pluginJsonPath = `${pluginSource}/.claude-plugin/plugin.json`;
            const content = await fetcher.fetchFile(pluginJsonPath);
            pluginMetadata = JSON.parse(content);
        } catch {
            // No plugin.json
        }
    }

    // Expand skills array
    if (plugin.skills && plugin.skills.length > 0) {
        for (const skillPath of plugin.skills) {
            const tool = await createSkillTool(
                skillPath,
                plugin,
                pluginMetadata,
                fetcher,
                marketplace,
                marketplaceData
            );
            if (tool) tools.push(tool);
        }
    }

    // Expand commands array
    if (plugin.commands && plugin.commands.length > 0) {
        for (const commandPath of plugin.commands) {
            const tool = await createCommandTool(
                commandPath,
                plugin,
                pluginMetadata,
                fetcher,
                marketplace,
                marketplaceData
            );
            if (tool) tools.push(tool);
        }
    }

    // Expand agents array
    if (plugin.agents && plugin.agents.length > 0) {
        for (const agentPath of plugin.agents) {
            const tool = await createAgentTool(
                agentPath,
                plugin,
                pluginMetadata,
                fetcher,
                marketplace,
                marketplaceData
            );
            if (tool) tools.push(tool);
        }
    }

    // If no component arrays, treat as single plugin
    if (tools.length === 0) {
        const tool = await createGenericTool(
            pluginSource,
            plugin,
            pluginMetadata,
            fetcher,
            marketplace,
            marketplaceData
        );
        if (tool) tools.push(tool);
    }

    return tools;
}

/**
 * Create a skill tool from a skill path
 */
async function createSkillTool(
    skillPath: string,
    plugin: any,
    pluginMetadata: any,
    fetcher: MarketplaceFetcher,
    marketplace: MarketplaceConfig,
    marketplaceData: any
): Promise<ToolWithContent | null> {

    try {
        const skillName = skillPath.split('/').pop() || skillPath;

        // Fetch SKILL.md
        const skillMdPath = `${skillPath}/SKILL.md`;
        const skillContent = await fetcher.fetchFile(skillMdPath);

        // For GitHub sources, skip listing additional files to avoid API rate limits
        // Additional files can be loaded on-demand when viewing the tool details
        const additionalContent: Record<string, string> = {};

        if (marketplace.source.type === 'local') {
            // Only list additional files for local sources
            const additionalFiles = await fetcher.listFiles(skillPath, ['.md', '.json', '.txt']);

            for (const file of additionalFiles) {
                if (file.endsWith('SKILL.md')) continue;
                try {
                    const content = await fetcher.fetchFile(file);
                    const relativePath = file.replace(`${skillPath}/`, '');
                    additionalContent[relativePath] = content;
                } catch {
                    // Skip files that can't be fetched
                }
            }
        }

        return {
            id: skillName,
            name: pluginMetadata?.name || skillName.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            category: 'skills',
            description: plugin.description || pluginMetadata?.description || `Skill: ${skillName}`,
            author: plugin.author?.name || pluginMetadata?.author?.name || marketplaceData.owner.name,
            version: plugin.version || pluginMetadata?.version || '1.0.0',
            tags: plugin.tags || plugin.keywords || pluginMetadata?.keywords || [skillName],
            downloads: 0,
            rating: 5,
            lastUpdated: new Date().toISOString(),
            files: {
                main: 'SKILL.md',
                additional: Object.keys(additionalContent).length > 0
                    ? Object.keys(additionalContent)
                    : undefined
            },
            content: {
                main: skillContent,
                additional: Object.keys(additionalContent).length > 0
                    ? additionalContent
                    : undefined
            },
            installation: {
                targetDir: `.claude/skills/${skillName}`,
                instructions: marketplace.source.type === 'github'
                    ? `claude skill add https://github.com/${marketplace.source.owner}/${marketplace.source.repo}/tree/${marketplace.source.branch || 'main'}/${skillPath}`
                    : undefined
            },
            repository: {
                url: fetcher.getPluginUrl(skillPath)
            },
            marketplace: {
                id: marketplace.id,
                name: marketplace.name
            }
        };
    } catch (error) {
        console.warn(`Failed to load skill: ${skillPath}`, error);
        return null;
    }
}

/**
 * Create a command tool from a command path
 */
async function createCommandTool(
    commandPath: string,
    plugin: any,
    pluginMetadata: any,
    fetcher: MarketplaceFetcher,
    marketplace: MarketplaceConfig,
    marketplaceData: any
): Promise<ToolWithContent | null> {

    try {
        const commandName = commandPath.split('/').pop()?.replace('.md', '') || commandPath;

        // Determine if it's a file or directory
        const isDirectory = !commandPath.endsWith('.md');
        let mainContent = '';
        let mainFile = '';

        if (isDirectory) {
            // List command files in directory
            const commandFiles = await fetcher.listFiles(commandPath, ['.md']);
            if (commandFiles.length > 0) {
                mainFile = commandFiles[0];
                mainContent = await fetcher.fetchFile(mainFile);
            }
        } else {
            mainFile = commandPath;
            mainContent = await fetcher.fetchFile(commandPath);
        }

        return {
            id: commandName,
            name: pluginMetadata?.name || commandName.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            category: 'slash-commands',
            description: plugin.description || pluginMetadata?.description || `Command: ${commandName}`,
            author: plugin.author?.name || pluginMetadata?.author?.name || marketplaceData.owner.name,
            version: plugin.version || pluginMetadata?.version || '1.0.0',
            tags: plugin.tags || plugin.keywords || pluginMetadata?.keywords || [commandName],
            downloads: 0,
            rating: 5,
            lastUpdated: new Date().toISOString(),
            files: {
                main: path.basename(mainFile),
                additional: undefined
            },
            content: {
                main: mainContent,
                additional: undefined
            },
            installation: {
                targetDir: `.claude/commands`,
                instructions: undefined
            },
            repository: {
                url: fetcher.getPluginUrl(commandPath)
            },
            marketplace: {
                id: marketplace.id,
                name: marketplace.name
            }
        };
    } catch (error) {
        console.warn(`Failed to load command: ${commandPath}`, error);
        return null;
    }
}

/**
 * Create an agent tool from an agent path
 */
async function createAgentTool(
    agentPath: string,
    plugin: any,
    pluginMetadata: any,
    fetcher: MarketplaceFetcher,
    marketplace: MarketplaceConfig,
    marketplaceData: any
): Promise<ToolWithContent | null> {

    try {
        const agentName = agentPath.split('/').pop()?.replace('.md', '') || agentPath;
        const agentContent = await fetcher.fetchFile(agentPath);

        return {
            id: agentName,
            name: pluginMetadata?.name || agentName.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            category: 'agents',
            description: plugin.description || pluginMetadata?.description || `Agent: ${agentName}`,
            author: plugin.author?.name || pluginMetadata?.author?.name || marketplaceData.owner.name,
            version: plugin.version || pluginMetadata?.version || '1.0.0',
            tags: plugin.tags || plugin.keywords || pluginMetadata?.keywords || [agentName],
            downloads: 0,
            rating: 5,
            lastUpdated: new Date().toISOString(),
            files: {
                main: path.basename(agentPath),
                additional: undefined
            },
            content: {
                main: agentContent,
                additional: undefined
            },
            installation: {
                targetDir: `.claude/agents`,
                instructions: undefined
            },
            repository: {
                url: fetcher.getPluginUrl(agentPath)
            },
            marketplace: {
                id: marketplace.id,
                name: marketplace.name
            }
        };
    } catch (error) {
        console.warn(`Failed to load agent: ${agentPath}`, error);
        return null;
    }
}

/**
 * Create a generic tool (for plugins without component arrays)
 */
async function createGenericTool(
    pluginSource: string,
    plugin: any,
    pluginMetadata: any,
    fetcher: MarketplaceFetcher,
    marketplace: MarketplaceConfig,
    marketplaceData: any
): Promise<ToolWithContent | null> {

    try {
        const pluginName = pluginMetadata?.name || plugin.name;
        const category = (plugin.category || 'plugin') as any;

        // Try to find main content file
        let mainContent = '';
        let mainFile = 'README.md';

        try {
            mainContent = await fetcher.fetchFile(`${pluginSource}/README.md`);
        } catch {
            // Try other common files
            try {
                mainContent = await fetcher.fetchFile(`${pluginSource}/${pluginName}.md`);
                mainFile = `${pluginName}.md`;
            } catch {
                mainContent = plugin.description || '';
            }
        }

        return {
            id: pluginName,
            name: pluginName.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            category,
            description: plugin.description || pluginMetadata?.description || '',
            author: plugin.author?.name || pluginMetadata?.author?.name || marketplaceData.owner.name,
            version: plugin.version || pluginMetadata?.version || '1.0.0',
            tags: plugin.tags || plugin.keywords || pluginMetadata?.keywords || [],
            downloads: 0,
            rating: 5,
            lastUpdated: new Date().toISOString(),
            files: {
                main: mainFile,
                additional: undefined
            },
            content: {
                main: mainContent,
                additional: undefined
            },
            installation: {
                targetDir: `.claude/${category}/${pluginName}`,
                instructions: plugin.installation?.instructions
            },
            repository: {
                url: fetcher.getPluginUrl(pluginSource)
            },
            marketplace: {
                id: marketplace.id,
                name: marketplace.name
            }
        };
    } catch (error) {
        console.warn(`Failed to load generic plugin: ${plugin.name}`, error);
        return null;
    }
}
