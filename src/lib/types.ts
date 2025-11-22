export type ToolCategory = 'hooks' | 'skills' | 'agents' | 'slash-commands' | 'commands' | 'mcp' | 'plugin';

export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  author: string;
  version: string;
  tags: string[];
  downloads: number;
  rating: number;
  lastUpdated: string;
  featured?: boolean;
  marketplace: {
    id: string;
    name: string;
  };
  repository?: {
    url?: string;
  };
}

export interface HookConfig {
  event: string; // Hook event type (UserPromptSubmit, PreToolUse, PostToolUse, etc.)
  matcher: string | null; // Matcher pattern (null for events that don't use matchers)
  command: string; // Command to execute
  type: 'command' | 'prompt'; // Hook type
  timeout: number | null; // Timeout in seconds (null for default)
}

export interface HookRequirements {
  runtime: string[]; // Runtime dependencies (e.g., ["Node.js 18+", "tsx"])
  files: string[]; // Required files (e.g., [".claude/skills/skill-rules.json"])
  env: string[]; // Required environment variables
}

export interface HookSetup {
  script?: string; // Setup script filename (e.g., "setup.sh")
  description?: string; // Description of what the setup script does
}

export interface InstallationStep {
  content: string; // Full markdown content for the step
  file?: string; // Optional: path to a file from repo to display after the content
}

export interface ToolInstallation {
  // For marketplace plugins
  targetDir?: string; // Some categories (e.g., MCP) may only provide an install command
  instructions?: string;

  // For non-plugin tools
  isNonPlugin?: boolean;
  prerequisites?: InstallationStep[];
  steps?: InstallationStep[];
}

export interface ToolWithInstallation extends Tool {
  installation?: ToolInstallation;
}

export interface ToolWithContent extends Tool {
  files?: {
    main: string;
    additional?: string[];
  } | null;
  content: {
    main: string;
    additional?: Record<string, string>;
  };
  installation: ToolInstallation;
  repository?: {
    url?: string;
    stars?: number;
    forks?: number;
  };
  marketplace: {
    id: string;
    name: string;
  };
  // Hook-specific fields (only present for hooks)
  hookConfig?: HookConfig;
  settingsJson?: Record<string, any>; // Ready-to-use settings.json configuration
  requirements?: HookRequirements;
  setup?: HookSetup;
}

export type BlogCategory = 'tutorials' | 'insights' | 'case-studies' | 'announcements';

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    role: string;
  };
  publishedDate: string;
  readingTime: number; // in minutes
  category: BlogCategory;
  tags: string[];
  featured?: boolean;
  coverGradient: string; // CSS gradient string
}
