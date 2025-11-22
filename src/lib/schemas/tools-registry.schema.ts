/**
 * Schema for non-plugin tools registry
 * These tools don't use Claude Code's plugin format but have their own installation methods
 */

import { ToolCategory } from '../types';

export interface ToolInstallationStep {
  content: string; // Full markdown content for the step (supports rich formatting)
  file?: string; // Optional: path to a file from repo to display after the content
}

export interface NonPluginTool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  author: string;
  version: string;
  tags: string[];
  lastUpdated: string;
  featured?: boolean;
  repository: {
    type: 'github' | 'gitlab' | 'url';
    url: string;
    owner?: string;
    repo?: string;
    branch?: string;
  };
  installation: {
    prerequisites?: ToolInstallationStep[]; // Optional prerequisites section
    steps: ToolInstallationStep[]; // Main installation steps (single or multiple)
  };
  files?: {
    // Files to display to users
    include: string[]; // paths relative to repo root
    exclude?: string[]; // patterns to exclude
  };
}

export interface ToolsRegistry {
  version: string;
  lastUpdated: string;
  tools: NonPluginTool[];
}


