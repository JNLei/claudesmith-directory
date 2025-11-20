import { loadAllTools } from './actions/marketplace-actions';
import type { ToolWithContent } from './types';

/**
 * Load all tools from all enabled marketplaces
 * This is the main entry point for getting tools
 */
export async function loadTools(): Promise<ToolWithContent[]> {
  return loadAllTools();
}
