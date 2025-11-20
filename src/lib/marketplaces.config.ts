export type MarketplaceSource =
    | { type: 'local'; path: string }
    | { type: 'github'; owner: string; repo: string; branch?: string };

export interface MarketplaceConfig {
    id: string;
    name: string;
    source: MarketplaceSource;
    enabled: boolean;
    cacheRevalidate?: number; // Revalidation time in seconds
}

export const MARKETPLACES: MarketplaceConfig[] = [
    {
        id: 'jnlei-claude-tools',
        name: 'ClaudeSmith Marketplace',
        source: {
            type: 'local',
            path: './tools'
        },
        enabled: true,
    },
    {
        id: 'anthropic-skills',
        name: 'Anthropic Skills',
        source: {
            type: 'github',
            owner: 'anthropics',
            repo: 'skills',
            branch: 'main'
        },
        enabled: true,
        cacheRevalidate: 3600, // 1 hour
    },
];
