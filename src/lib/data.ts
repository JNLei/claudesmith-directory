import fs from 'fs/promises';
import path from 'path';
import { ToolWithContent, ToolCategory } from './types';

const TOOLS_ROOT = path.join(process.cwd(), 'tools');
const MARKETPLACE_PATH = path.join(TOOLS_ROOT, '.claude-plugin', 'marketplace.json');

interface MarketplacePlugin {
  name: string;
  source: string;
  description: string;
  category: 'hooks' | 'skills' | 'agents' | 'commands' | 'mcp' | 'plugin';
  tags: string[];
}

interface Marketplace {
  name: string;
  owner: { name: string };
  metadata: {
    description: string;
    pluginRoot: string;
    version: string;
  };
  plugins: MarketplacePlugin[];
}

interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  author: { name: string };
  license: string;
  keywords: string[];
}

/**
 * Read file content from plugin directory
 */
async function readPluginFile(pluginPath: string, relativePath: string): Promise<string> {
  try {
    const filePath = path.join(pluginPath, relativePath);
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return '';
  }
}

/**
 * Get all files in a directory recursively matching extensions
 */
async function getRecursiveFiles(dir: string, extensions: string[] = ['.md'], baseDir: string = dir): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== '.claude-plugin') {
        files.push(...await getRecursiveFiles(fullPath, extensions, baseDir));
      } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
        files.push(path.relative(baseDir, fullPath));
      }
    }
  } catch {
    // Directory doesn't exist
  }

  return files;
}

/**
 * Map marketplace category to our ToolCategory type
 */
function mapCategory(category: string): ToolCategory {
  if (category === 'commands') return 'slash-commands';
  if (category === 'plugin') return 'plugin';
  return category as ToolCategory;
}

/**
 * Determine main file and additional files for a plugin
 */
async function determinePluginFiles(
  pluginPath: string,
  category: ToolCategory,
  metadata: PluginMetadata
): Promise<{ main: string; additional: string[] }> {
  let main = '';
  const additional: string[] = [];

  if (category === 'skills') {
    // Skills: Look for SKILL.md in skills/ subdirectory
    const skillsDir = path.join(pluginPath, 'skills', metadata.name);
    try {
      const skillMdPath = path.join(skillsDir, 'SKILL.md');
      await fs.access(skillMdPath);
      main = path.relative(pluginPath, skillMdPath);

      const allMdFiles = await getRecursiveFiles(skillsDir, ['.md'], pluginPath);
      additional.push(...allMdFiles.filter(f => path.basename(f) !== 'SKILL.md'));
    } catch {
      const mdFiles = await getRecursiveFiles(pluginPath, ['.md']);
      main = mdFiles.find(f => f.toUpperCase().includes('SKILL')) || mdFiles[0] || '';
      additional.push(...mdFiles.filter(f => f !== main));
    }
  } else if (category === 'agents') {
    const agentsDir = path.join(pluginPath, 'agents');
    const mdFiles = await getRecursiveFiles(agentsDir, ['.md'], pluginPath);
    main = mdFiles[0] || '';
    additional.push(...mdFiles.slice(1));
  } else if (category === 'slash-commands') {
    const commandsDir = path.join(pluginPath, 'commands');
    const mdFiles = await getRecursiveFiles(commandsDir, ['.md'], pluginPath);
    main = mdFiles[0] || '';
    additional.push(...mdFiles.slice(1));
  } else if (category === 'hooks') {
    main = 'README.md';
    const allFiles = await getRecursiveFiles(pluginPath, ['.md', '.json']);
    additional.push(...allFiles.filter(f => f !== 'README.md'));
  } else if (category === 'mcp') {
    try {
      await fs.access(path.join(pluginPath, 'README.md'));
      main = 'README.md';
    } catch {
      main = '';
    }
  } else if (category === 'plugin') {
    // Plugin bundles: Get .md and .sh files
    const allFiles = await getRecursiveFiles(pluginPath, ['.md', '.sh']);

    // Try to find README.md as main
    if (allFiles.includes('README.md')) {
      main = 'README.md';
    }

    additional.push(...allFiles.filter(f => f !== main));
  }

  return { main, additional };
}

/**
 * Load a single plugin and convert to ToolWithContent
 */
async function loadPlugin(
  plugin: MarketplacePlugin,
  ownerName: string
): Promise<ToolWithContent | null> {
  // plugin.source already includes the full path from TOOLS_ROOT
  const pluginPath = path.join(TOOLS_ROOT, plugin.source);

  // Read plugin metadata
  let metadata: PluginMetadata;
  try {
    const metadataPath = path.join(pluginPath, '.claude-plugin', 'plugin.json');
    const content = await fs.readFile(metadataPath, 'utf-8');
    metadata = JSON.parse(content);
  } catch {
    console.warn(`Could not read plugin metadata for ${plugin.name}`);
    return null;
  }

  const category = mapCategory(plugin.category);

  // Determine files
  const { main, additional } = await determinePluginFiles(pluginPath, category, metadata);

  // Read main file content
  const mainContent = main ? await readPluginFile(pluginPath, main) : '';

  // Read additional files
  const additionalContent: Record<string, string> = {};
  for (const file of additional) {
    const content = await readPluginFile(pluginPath, file);
    if (content) {
      additionalContent[file] = content;
    }
  }

  // Get file stats for lastUpdated
  let lastUpdated = new Date().toISOString();
  try {
    const stats = await fs.stat(pluginPath);
    lastUpdated = stats.mtime.toISOString();
  } catch {
    // Use current date
  }

  // Determine installation target directory
  let targetDir = '';
  if (category === 'agents') targetDir = '.claude/agents';
  else if (category === 'slash-commands') targetDir = '.claude/commands';
  else if (category === 'skills') targetDir = `.claude/skills/${metadata.name}`;
  else if (category === 'hooks') targetDir = '.claude/hooks';
  else if (category === 'mcp') targetDir = '';
  else targetDir = `.claude/${category}/${metadata.name}`;

  // Build installation instructions for MCP
  let installInstructions = '';
  if (category === 'mcp') {
    installInstructions = `claude mcp add ${metadata.name}`;
  }

  const tool: ToolWithContent = {
    id: metadata.name,
    name: metadata.name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    category,
    description: plugin.description,
    author: metadata.author.name || ownerName,
    version: metadata.version,
    tags: metadata.keywords || plugin.tags,
    downloads: 0,
    rating: 5,
    lastUpdated,
    featured: false,
    files: main ? {
      main,
      additional: additional.length > 0 ? additional : undefined,
    } : null,
    content: {
      main: mainContent,
      additional: Object.keys(additionalContent).length > 0 ? additionalContent : undefined,
    },
    installation: {
      targetDir: targetDir || undefined,
      instructions: installInstructions || undefined,
    },
    repository: {
      url: `https://github.com/JNLei/claude-tools/tree/main/${plugin.source.replace(/^\.\//, '')}`,
    },
  };

  return tool;
}

/**
 * Load all tools from marketplace.json
 */
export async function loadTools(): Promise<ToolWithContent[]> {
  try {
    const marketplaceContent = await fs.readFile(MARKETPLACE_PATH, 'utf-8');
    const marketplace: Marketplace = JSON.parse(marketplaceContent);

    const tools: ToolWithContent[] = [];

    for (const plugin of marketplace.plugins) {
      const tool = await loadPlugin(
        plugin,
        marketplace.owner.name
      );

      if (tool) {
        tools.push(tool);
        console.log(`✓ Loaded ${tool.category}/${tool.id}`);
      }
    }

    return tools;
  } catch (error) {
    console.error('Error loading tools from marketplace:', error);
    throw error;
  }
}
