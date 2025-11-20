import fs from 'fs/promises';
import path from 'path';
import { MarketplaceFetcher } from './marketplace-fetcher.interface';

export class LocalFetcher implements MarketplaceFetcher {
    constructor(private basePath: string) { }

    async fetchMarketplace() {
        const marketplacePath = path.join(
            process.cwd(),
            this.basePath,
            '.claude-plugin',
            'marketplace.json'
        );
        const content = await fs.readFile(marketplacePath, 'utf-8');
        return JSON.parse(content);
    }

    async fetchFile(filePath: string): Promise<string> {
        const fullPath = path.join(process.cwd(), this.basePath, filePath);
        return fs.readFile(fullPath, 'utf-8');
    }

    async listFiles(dirPath: string, extensions?: string[]): Promise<string[]> {
        const fullPath = path.join(process.cwd(), this.basePath, dirPath);
        const basePathFull = path.join(process.cwd(), this.basePath);
        return this._listFilesRecursive(fullPath, extensions, basePathFull);
    }

    private async _listFilesRecursive(
        dir: string,
        extensions?: string[],
        baseDir: string = dir
    ): Promise<string[]> {
        const files: string[] = [];

        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory() &&
                    entry.name !== 'node_modules' &&
                    entry.name !== '.git' &&
                    entry.name !== '.next') {
                    files.push(...await this._listFilesRecursive(fullPath, extensions, baseDir));
                } else if (entry.isFile()) {
                    if (!extensions || extensions.some(ext => entry.name.endsWith(ext))) {
                        files.push(path.relative(baseDir, fullPath));
                    }
                }
            }
        } catch (error) {
            // Directory doesn't exist or can't be accessed
            console.warn(`Could not read directory: ${dir}`);
        }

        return files;
    }

    getPluginUrl(pluginPath: string): string {
        // For local, return GitHub URL (assumes it's from JNLei/claude-tools)
        return `https://github.com/JNLei/claude-tools/tree/main/${pluginPath.replace(/^\.\//, '')}`;
    }
}
