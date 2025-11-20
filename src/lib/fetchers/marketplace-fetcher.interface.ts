export interface FileContent {
    path: string;
    content: string;
}

export interface MarketplaceFetcher {
    /**
     * Fetch and parse marketplace.json
     */
    fetchMarketplace(): Promise<any>;

    /**
     * Fetch a file from the marketplace
     */
    fetchFile(path: string): Promise<string>;

    /**
     * List files in a directory matching optional extensions
     */
    listFiles(dirPath: string, extensions?: string[]): Promise<string[]>;

    /**
     * Get repository URL for a plugin
     */
    getPluginUrl(pluginPath: string): string;
}
