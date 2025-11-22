import { loadAllToolsMetadata, loadToolContent } from './actions/marketplace-actions';
import type { ToolWithContent, ToolWithInstallation } from './types';

/**
 * Load all tools metadata (with installation data but without file content)
 * This is optimized to only fetch marketplace.json files and the registry
 */
export async function loadTools(): Promise<ToolWithInstallation[]> {
  return loadAllToolsMetadata();
}

/**
 * Load a single tool with full content - for detail page
 */
export async function loadTool(category: string, id: string): Promise<ToolWithContent | null> {
  return loadToolContent(category, id);
}
