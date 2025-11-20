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
   * List files in a directory using GitHub Contents API
   * Recursively lists all files including subdirectories
   * Uses GITHUB_TOKEN env var for authentication (5,000 requests/hour vs 60/hour)
   */
    async listFiles(dirPath: string, extensions?: string[]): Promise<string[]> {
        return this._listFilesRecursive(dirPath, extensions);
    }

    /**
     * List files recursively using GitHub Contents API
     * Each API call is cached by Next.js fetch
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

        // Handle case where response is not an array (single file or error)
        if (!Array.isArray(items)) {
            return [];
        }

        const files: string[] = [];

        for (const item of items) {
            if (item.type === 'file') {
                // Check extension filter
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
