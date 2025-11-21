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
            type: 'local',
            path: './external-marketplaces/anthropic-skills'
        },
        enabled: true,
    },
    {
        id: 'third-party-marketplace',
        name: 'Third-Party Plugins',
        source: {
            type: 'local',
            path: './third-party'
        },
        enabled: true,
        cacheRevalidate: 14400, // 4 hours - third-party content changes less frequently
    },
];
