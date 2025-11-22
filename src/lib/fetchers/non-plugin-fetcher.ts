import { GitHubFetcher } from './github-fetcher';
import { NonPluginTool } from '../schemas/tools-registry.schema';

export class NonPluginToolFetcher {
  private githubFetcher: GitHubFetcher;

  constructor(repoConfig: { owner: string; repo: string; branch?: string }) {
    this.githubFetcher = new GitHubFetcher({
      ...repoConfig,
      cacheRevalidate: 3600
    });
  }

  /**
   * Fetch all files specified in tool's files config
   * Supports both single files and glob patterns (e.g., .claude/**\/* )
   */
  async fetchToolFiles(tool: NonPluginTool): Promise<Record<string, string>> {
    const files: Record<string, string> = {};
    
    // Fetch files based on include patterns
    for (const pattern of tool.files?.include || []) {
      if (pattern.includes('**/*')) {
        // Handle glob patterns - fetch all files in directory recursively
        const dirPath = pattern.split('/**')[0];
        try {
          const allFiles = await this.githubFetcher.listFiles(dirPath);
          
          for (const file of allFiles) {
            // Apply exclude filters if any
            if (this.shouldExcludeFile(file, tool.files?.exclude)) {
              continue;
            }
            
            try {
              const content = await this.githubFetcher.fetchFile(file);
              files[file] = content;
            } catch (error) {
              console.warn(`Could not fetch file ${file}:`, error);
            }
          }
        } catch (error) {
          console.warn(`Could not list files in ${dirPath}:`, error);
        }
      } else {
        // Single file
        try {
          const content = await this.githubFetcher.fetchFile(pattern);
          files[pattern] = content;
        } catch (error) {
          console.warn(`Could not fetch file ${pattern}:`, error);
        }
      }
    }

    return files;
  }

  /**
   * Check if a file should be excluded based on exclude patterns
   */
  private shouldExcludeFile(filePath: string, excludePatterns?: string[]): boolean {
    if (!excludePatterns || excludePatterns.length === 0) {
      return false;
    }

    return excludePatterns.some(pattern => {
      // Simple glob matching - convert pattern to regex
      const regexPattern = pattern
        .replace(/\*\*/g, '.*')  // ** matches any path
        .replace(/\*/g, '[^/]*') // * matches anything except /
        .replace(/\./g, '\\.');  // Escape dots
      
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(filePath);
    });
  }

  /**
   * Get repository URL for the tool
   */
  getToolUrl(): string {
    return this.githubFetcher.getPluginUrl('');
  }
}


