import { loadAllToolsMetadata, loadToolContent } from './actions/marketplace-actions';
import type { Tool, ToolWithContent } from './types';

/**
 * Load all tools metadata (without content) - for listing page
 * This is optimized to only fetch marketplace.json files
 */
export async function loadTools(): Promise<Tool[]> {
  return loadAllToolsMetadata();
}

/**
 * Load a single tool with full content - for detail page
 */
export async function loadTool(category: string, id: string): Promise<ToolWithContent | null> {
  return loadToolContent(category, id);
}
