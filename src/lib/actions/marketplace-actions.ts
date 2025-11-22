'use server';

import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import path from 'path';
import fs from 'fs/promises';
import { MARKETPLACES, MarketplaceConfig } from '../marketplaces.config';
import { GitHubFetcher } from '../fetchers/github-fetcher';
import { LocalFetcher } from '../fetchers/local-fetcher';
import { NonPluginToolFetcher } from '../fetchers/non-plugin-fetcher';
import { Tool, ToolWithContent, ToolCategory } from '../types';
import type { MarketplaceFetcher } from '../fetchers/marketplace-fetcher.interface';
import type { NonPluginTool, ToolsRegistry } from '../schemas/tools-registry.schema';

/**
 * Load all tools from all enabled marketplaces and non-plugin registry
 * Cached with Next.js unstable_cache
 * @deprecated Use loadAllToolsMetadata for listing and loadToolContent for details
 */
export const loadAllTools = unstable_cache(
    async (): Promise<ToolWithContent[]> => {
        const allTools: ToolWithContent[] = [];

        // Load marketplace plugins
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

        // Load non-plugin tools from registry
        try {
            const nonPluginTools = await loadNonPluginTools();
            allTools.push(...nonPluginTools);
            console.log(`✓ Loaded ${nonPluginTools.length} non-plugin tools`);
        } catch (error) {
            console.error(`✗ Failed to load non-plugin tools:`, error);
        }

        return allTools;
    },
    ['all-tools'],
    {
        revalidate: 3600, // Revalidate every hour
        tags: ['all-tools']
    }
);

/**
 * OPTIMIZED: Load only metadata for all tools (without fetching file contents)
 * This is used for the listing page
 */
export const loadAllToolsMetadata = unstable_cache(
    async (): Promise<Tool[]> => {
        const allTools: Tool[] = [];

        // Load marketplace plugins metadata
        for (const marketplace of MARKETPLACES) {
            if (!marketplace.enabled) continue;

            try {
                const tools = await loadMarketplaceMetadata(marketplace);
                allTools.push(...tools);
                console.log(`✓ Loaded metadata for ${tools.length} tools from ${marketplace.name}`);
            } catch (error) {
                console.error(`✗ Failed to load marketplace metadata: ${marketplace.name}`, error);
            }
        }

        // Load non-plugin tools metadata
        try {
            const nonPluginTools = await loadNonPluginToolsMetadata();
            allTools.push(...nonPluginTools);
            console.log(`✓ Loaded metadata for ${nonPluginTools.length} non-plugin tools`);
        } catch (error) {
            console.error(`✗ Failed to load non-plugin tools metadata:`, error);
        }

        return allTools;
    },
    ['all-tools-metadata'],
    {
        revalidate: 3600,
        tags: ['all-tools-metadata']
    }
);

/**
 * OPTIMIZED: Load a single tool with full content
 * This is used for the detail page
 * 
 * Caching strategy:
 * 1. React cache() - Deduplicates within a single request (both components can call this)
 * 2. unstable_cache - Caches across requests for 1 hour
 */
export const loadToolContent = cache(
    async (category: string, id: string): Promise<ToolWithContent | null> => {
        // Use unstable_cache for cross-request caching
        const getCachedTool = unstable_cache(
            async () => {
                // Try each marketplace
                for (const marketplace of MARKETPLACES) {
                    if (!marketplace.enabled) continue;

                    try {
                        const tool = await loadSingleTool(marketplace, category, id);
                        if (tool) return tool;
                    } catch (error) {
                        console.warn(`Failed to load tool ${category}/${id} from ${marketplace.name}:`, error);
                    }
                }

                // Try non-plugin registry
                try {
                    const tool = await loadSingleNonPluginTool(id);
                    if (tool) return tool;
                } catch (error) {
                    console.warn(`Failed to load non-plugin tool ${id}:`, error);
                }

                return null;
            },
            [`tool-${category}-${id}`], // Unique cache key per tool
            {
                revalidate: 3600, // 1 hour
                tags: [`tool-${category}-${id}`, 'tool-content']
            }
        );

        return getCachedTool();
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
 * OPTIMIZED: Load only metadata from a marketplace (no file fetching)
 */
async function loadMarketplaceMetadata(
    marketplace: MarketplaceConfig
): Promise<Tool[]> {
    // Create appropriate fetcher
    const fetcher = marketplace.source.type === 'local'
        ? new LocalFetcher(marketplace.source.path)
        : new GitHubFetcher({
            owner: marketplace.source.owner,
            repo: marketplace.source.repo,
            branch: marketplace.source.branch,
            cacheRevalidate: marketplace.cacheRevalidate
        });

    // Fetch marketplace.json only
    const marketplaceData = await fetcher.fetchMarketplace();

    // Extract metadata from each plugin
    const tools: Tool[] = [];

    for (const plugin of marketplaceData.plugins) {
        const pluginMetadata = extractPluginMetadata(plugin, marketplace, marketplaceData);
        tools.push(...pluginMetadata);
    }

    return tools;
}

/**
 * OPTIMIZED: Load a single tool with full content from a marketplace
 */
async function loadSingleTool(
    marketplace: MarketplaceConfig,
    category: string,
    id: string
): Promise<ToolWithContent | null> {
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

    // Find the plugin that contains this tool
    for (const plugin of marketplaceData.plugins) {
        const pluginTools = await loadPlugin(plugin, fetcher, marketplace, marketplaceData);
        const tool = pluginTools.find(t => t.category === category && t.id === id);
        if (tool) return tool;
    }

    return null;
}

/**
 * Extract metadata from a plugin definition (without fetching files)
 */
function extractPluginMetadata(
    plugin: any,
    marketplace: MarketplaceConfig,
    marketplaceData: any
): Tool[] {
    const tools: Tool[] = [];
    
    // Generate repository URL helper
    const getRepositoryUrl = (itemPath?: string): string | undefined => {
        // Check if plugin has its own GitHub source
        if (plugin.source?.source === 'github') {
            const repoUrl = `https://github.com/${plugin.source.repo}`;
            return itemPath ? `${repoUrl}/tree/${plugin.source.branch || 'main'}/${itemPath}` : repoUrl;
        }
        
        // Use marketplace source
        if (marketplace.source.type === 'github') {
            const branch = marketplace.source.branch || 'main';
            const repoUrl = `https://github.com/${marketplace.source.owner}/${marketplace.source.repo}`;
            return itemPath ? `${repoUrl}/tree/${branch}/${itemPath}` : repoUrl;
        }
        
        return undefined;
    };
    
    const baseMetadata = {
        author: plugin.author?.name || marketplaceData.owner.name,
        version: plugin.version || '1.0.0',
        downloads: 0,
        rating: 5,
        lastUpdated: new Date().toISOString(),
        featured: plugin.featured || false,
        marketplace: {
            id: marketplace.id,
            name: marketplace.name,
        },
    };

    // Extract skills
    if (plugin.skills && plugin.skills.length > 0) {
        for (const skillPath of plugin.skills) {
            const skillName = skillPath.split('/').pop() || skillPath;
            tools.push({
                id: skillName,
                name: skillName.split('-').map((w: string) => 
                    w.charAt(0).toUpperCase() + w.slice(1)
                ).join(' '),
                category: 'skills' as ToolCategory,
                description: plugin.description || `Skill: ${skillName}`,
                tags: plugin.tags || plugin.keywords || [skillName],
                ...baseMetadata,
                repository: {
                    url: getRepositoryUrl(skillPath),
                },
            });
        }
    }

    // Extract commands
    if (plugin.commands && plugin.commands.length > 0) {
        for (const commandPath of plugin.commands) {
            const commandName = commandPath.split('/').pop()?.replace('.md', '') || commandPath;
            tools.push({
                id: commandName,
                name: commandName.split('-').map((w: string) => 
                    w.charAt(0).toUpperCase() + w.slice(1)
                ).join(' '),
                category: 'slash-commands' as ToolCategory,
                description: plugin.description || `Command: ${commandName}`,
                tags: plugin.tags || plugin.keywords || [commandName],
                ...baseMetadata,
                repository: {
                    url: getRepositoryUrl(commandPath),
                },
            });
        }
    }

    // Extract agents
    if (plugin.agents && plugin.agents.length > 0) {
        for (const agentPath of plugin.agents) {
            const agentName = agentPath.split('/').pop()?.replace('.md', '') || agentPath;
            tools.push({
                id: agentName,
                name: agentName.split('-').map((w: string) => 
                    w.charAt(0).toUpperCase() + w.slice(1)
                ).join(' '),
                category: 'agents' as ToolCategory,
                description: plugin.description || `Agent: ${agentName}`,
                tags: plugin.tags || plugin.keywords || [agentName],
                ...baseMetadata,
                repository: {
                    url: getRepositoryUrl(agentPath),
                },
            });
        }
    }

    // If no component arrays, treat as single plugin
    if (tools.length === 0 && plugin.name) {
        const pluginSource = typeof plugin.source === 'string' ? plugin.source : plugin.source?.path || './';
        tools.push({
            id: plugin.name,
            name: plugin.name.split('-').map((w: string) => 
                w.charAt(0).toUpperCase() + w.slice(1)
            ).join(' '),
            category: (plugin.category || 'plugin') as ToolCategory,
            description: plugin.description || '',
            tags: plugin.tags || plugin.keywords || [],
            ...baseMetadata,
            repository: {
                url: getRepositoryUrl(pluginSource),
            },
        });
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

    // Detect GitHub source and create dynamic fetcher
    let pluginSource: string;
    let actualFetcher = fetcher;

    if (plugin.source?.source === 'github') {
        // Third-party plugin with GitHub source
        const [owner, repo] = plugin.source.repo.split('/');
        actualFetcher = new GitHubFetcher({
            owner,
            repo,
            branch: plugin.source.branch || 'main',
            cacheRevalidate: marketplace.cacheRevalidate || 3600
        });
        pluginSource = './'; // Fetch from root of plugin's GitHub repo
    } else {
        // Local or marketplace-level GitHub source
        pluginSource = typeof plugin.source === 'string' ? plugin.source : plugin.source?.path || './';
    }

    // Get plugin metadata (if strict mode and relative path source)
    let pluginMetadata = null;

    if (plugin.strict !== false) {
        try {
            const pluginJsonPath = `${pluginSource}/.claude-plugin/plugin.json`;
            const content = await actualFetcher.fetchFile(pluginJsonPath);
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
                actualFetcher,
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
                actualFetcher,
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
                actualFetcher,
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
            actualFetcher,
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

        // Load additional files dynamically
        const additionalContent: Record<string, string> = {};

        // Get list of files in the skill directory
        const files = await fetcher.listFiles(skillPath, ['.md', '.json', '.txt']);

        for (const file of files) {
            // Skip the main SKILL.md file
            const fileName = file.split('/').pop() || '';
            if (fileName === 'SKILL.md') continue;

            try {
                const content = await fetcher.fetchFile(file);
                // Calculate relative path by removing the skillPath prefix
                // Handle both "./path" and "path" formats
                const normalizedSkillPath = skillPath.replace(/^\.\//, '');
                const relativePath = file.replace(new RegExp(`^${normalizedSkillPath}/`), '');
                additionalContent[relativePath] = content;
            } catch (error) {
                console.warn(`Could not fetch file ${file}:`, error);
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
                instructions: plugin.source?.source === 'github'
                    ? `claude skill add https://github.com/${plugin.source.repo}`
                    : marketplace.source.type === 'github'
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

        // Load additional files (for plugin bundles)
        const additionalContent: Record<string, string> = {};

        // Get list of all files in the plugin directory
        const files = await fetcher.listFiles(pluginSource, ['.md', '.json', '.txt', '.sh']);

        for (const file of files) {
            // Skip the main file
            const fileName = file.split('/').pop() || '';
            if (fileName === mainFile) continue;

            try {
                const content = await fetcher.fetchFile(file);
                // Calculate relative path
                const normalizedPluginSource = pluginSource.replace(/^\.\//, '');
                const relativePath = file.replace(new RegExp(`^${normalizedPluginSource}/`), '');
                additionalContent[relativePath] = content;
            } catch (error) {
                console.warn(`Could not fetch file ${file}:`, error);
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
                additional: Object.keys(additionalContent).length > 0
                    ? Object.keys(additionalContent)
                    : undefined
            },
            content: {
                main: mainContent,
                additional: Object.keys(additionalContent).length > 0
                    ? additionalContent
                    : undefined
            },
            installation: {
                targetDir: `.claude/${category}/${pluginName}`,
                instructions: plugin.source?.source === 'github'
                    ? `claude ${category === 'skills' ? 'skill' : category === 'agents' ? 'agent' : 'plugin'} add https://github.com/${plugin.source.repo}`
                    : plugin.installation?.instructions
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

/**
 * Load tools from non-plugin registry (tools with custom installation)
 */
async function loadNonPluginTools(): Promise<ToolWithContent[]> {
    const registryPath = path.join(process.cwd(), 'src/data/tools-registry.json');
    
    let registry: ToolsRegistry;
    try {
        const content = await fs.readFile(registryPath, 'utf-8');
        registry = JSON.parse(content);
    } catch (error) {
        console.warn('Could not load tools-registry.json:', error);
        return [];
    }

    const tools: ToolWithContent[] = [];

    for (const tool of registry.tools) {
        try {
            const toolWithContent = await loadNonPluginTool(tool);
            if (toolWithContent) {
                tools.push(toolWithContent);
            }
        } catch (error) {
            console.warn(`Failed to load non-plugin tool: ${tool.id}`, error);
        }
    }

    return tools;
}

/**
 * Load a single non-plugin tool
 */
async function loadNonPluginTool(tool: NonPluginTool): Promise<ToolWithContent | null> {
    // Only support GitHub for now
    if (tool.repository.type !== 'github' || !tool.repository.owner || !tool.repository.repo) {
        console.warn(`Non-plugin tool ${tool.id} requires GitHub repository info`);
        return null;
    }

    const fetcher = new NonPluginToolFetcher({
        owner: tool.repository.owner,
        repo: tool.repository.repo,
        branch: tool.repository.branch || 'main'
    });

    // Fetch files specified in tool config
    const files = await fetcher.fetchToolFiles(tool);

    // Extract main file (prefer README.md)
    let mainFile = 'README.md';
    let mainContent = files['README.md'] || '';
    
    // If no README, use first file
    if (!mainContent && Object.keys(files).length > 0) {
        mainFile = Object.keys(files)[0];
        mainContent = files[mainFile];
    }

    // Prepare additional files (exclude main)
    const additionalFiles = { ...files };
    delete additionalFiles[mainFile];

    return {
        id: tool.id,
        name: tool.name,
        category: tool.category,
        description: tool.description,
        author: tool.author,
        version: tool.version,
        tags: tool.tags,
        downloads: 0,
        rating: 5,
        lastUpdated: tool.lastUpdated,
        featured: tool.featured,
        files: {
            main: mainFile,
            additional: Object.keys(additionalFiles).length > 0 
                ? Object.keys(additionalFiles) 
                : undefined
        },
        content: {
            main: mainContent,
            additional: Object.keys(additionalFiles).length > 0 
                ? additionalFiles 
                : undefined
        },
        installation: {
            isNonPlugin: true,
            prerequisites: tool.installation.prerequisites,
            steps: tool.installation.steps
        },
        repository: {
            url: tool.repository.url
        },
        marketplace: {
            id: 'non-plugin-registry',
            name: 'Community Tools'
        }
    };
}

/**
 * OPTIMIZED: Load only metadata for non-plugin tools
 */
async function loadNonPluginToolsMetadata(): Promise<Tool[]> {
    const registryPath = path.join(process.cwd(), 'src/data/tools-registry.json');
    
    let registry: ToolsRegistry;
    try {
        const content = await fs.readFile(registryPath, 'utf-8');
        registry = JSON.parse(content);
    } catch (error) {
        console.warn('Could not load tools-registry.json:', error);
        return [];
    }

    // Just return the metadata without fetching files
    return registry.tools.map(tool => ({
        id: tool.id,
        name: tool.name,
        category: tool.category,
        description: tool.description,
        author: tool.author,
        version: tool.version,
        tags: tool.tags,
        downloads: 0,
        rating: 5,
        lastUpdated: tool.lastUpdated,
        featured: tool.featured,
        marketplace: {
            id: 'non-plugin-registry',
            name: 'Community Tools',
        },
        repository: {
            url: tool.repository.url,
        },
    }));
}

/**
 * OPTIMIZED: Load a single non-plugin tool with full content
 */
async function loadSingleNonPluginTool(id: string): Promise<ToolWithContent | null> {
    const registryPath = path.join(process.cwd(), 'src/data/tools-registry.json');
    
    let registry: ToolsRegistry;
    try {
        const content = await fs.readFile(registryPath, 'utf-8');
        registry = JSON.parse(content);
    } catch (error) {
        console.warn('Could not load tools-registry.json:', error);
        return null;
    }

    const tool = registry.tools.find(t => t.id === id);
    if (!tool) return null;

    return loadNonPluginTool(tool);
}
