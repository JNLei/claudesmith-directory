import { unstable_cache } from 'next/cache';
import { MarketplaceFetcher } from './marketplace-fetcher.interface';

export interface GitHubFetcherConfig {
    owner: string;
    repo: string;
    branch?: string;
    cacheRevalidate?: number;
}

export class GitHubFetcher implements MarketplaceFetcher {
    private baseUrl: string;
    private apiUrl: string;
    private cacheRevalidate: number;

    constructor(private config: GitHubFetcherConfig) {
        const branch = config.branch || 'main';
        this.baseUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${branch}`;
        this.apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}`;
        this.cacheRevalidate = config.cacheRevalidate || 3600; // Default: 1 hour
    }

    /**
     * Fetch marketplace.json using Next.js cache
     */
    async fetchMarketplace() {
        return this.fetchAndCacheJSON('.claude-plugin/marketplace.json');
    }

    /**
     * Fetch a file using Next.js fetch cache
     */
    async fetchFile(path: string): Promise<string> {
        const url = `${this.baseUrl}/${path}`;

        const response = await fetch(url, {
            next: {
                revalidate: this.cacheRevalidate,
                tags: [`github:${this.config.owner}/${this.config.repo}`]
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
        }

        return response.text();
    }

    /**
     * Fetch and parse JSON file with caching
     */
    private async fetchAndCacheJSON(path: string): Promise<any> {
        const content = await this.fetchFile(path);
        return JSON.parse(content);
    }

    /**
   * List files in a directory using GitHub API with unstable_cache
   * Note: This is expensive for GitHub API. Use sparingly.
   */
    async listFiles(dirPath: string, extensions?: string[]): Promise<string[]> {
        // For skills, we typically only need SKILL.md and a few extra files
        // Try common file patterns first to avoid expensive tree traversal
        const commonFiles = ['SKILL.md', 'README.md', 'LICENSE.txt', 'templates/'];
        const foundFiles: string[] = [];

        for (const file of commonFiles) {
            const filePath = `${dirPath}/${file}`;
            try {
                await this.fetchFile(filePath);
                if (!extensions || extensions.some(ext => file.endsWith(ext))) {
                    foundFiles.push(filePath);
                }
            } catch {
                // File doesn't exist, skip
            }
        }

        // If we found files, return them without expensive tree traversal
        if (foundFiles.length > 0) {
            return foundFiles;
        }

        // Fallback: use cached recursive listing only if needed
        const listFilesCached = unstable_cache(
            async (dir: string, exts?: string[]) => {
                return this._listFilesRecursive(dir, exts);
            },
            [`list-files-${this.config.owner}-${this.config.repo}-${dirPath}-${extensions?.join(',') || 'all'}`],
            {
                revalidate: this.cacheRevalidate,
                tags: [`github:${this.config.owner}/${this.config.repo}:tree`]
            }
        );

        return listFilesCached(dirPath, extensions);
    }

    /**
     * Internal recursive file listing using GitHub API
     */
    private async _listFilesRecursive(
        dirPath: string,
        extensions?: string[]
    ): Promise<string[]> {
        const branch = this.config.branch || 'main';
        const url = `${this.apiUrl}/contents/${dirPath}?ref=${branch}`;

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                // Add GITHUB_TOKEN if available (optional)
                ...(process.env.GITHUB_TOKEN && {
                    'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
                })
            },
            next: {
                revalidate: this.cacheRevalidate,
                tags: [`github:${this.config.owner}/${this.config.repo}:contents`]
            }
        });

        if (!response.ok) {
            console.warn(`Failed to list files in ${dirPath}: ${response.statusText}`);
            return [];
        }

        const items = await response.json();

        // Handle case where items is not an array (single file)
        if (!Array.isArray(items)) {
            return [];
        }

        const files: string[] = [];

        for (const item of items) {
            if (item.type === 'file') {
                if (!extensions || extensions.some(ext => item.name.endsWith(ext))) {
                    files.push(item.path);
                }
            } else if (item.type === 'dir') {
                // Recursively list subdirectory
                const subFiles = await this._listFilesRecursive(item.path, extensions);
                files.push(...subFiles);
            }
        }

        return files;
    }

    /**
     * Get repository URL for a plugin
     */
    getPluginUrl(pluginPath: string): string {
        const branch = this.config.branch || 'main';
        return `https://github.com/${this.config.owner}/${this.config.repo}/tree/${branch}/${pluginPath}`;
    }
}
