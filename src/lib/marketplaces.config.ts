export type MarketplaceSource =
    | { type: 'local'; path: string }
    | { type: 'github'; owner: string; repo: string; branch?: string };

export interface MarketplaceConfig {
    id: string;
    name: string;
    source: MarketplaceSource;
    enabled: boolean;
    cacheRevalidate?: number; // Revalidation time in seconds
    purpose?: string; // Purpose/category of the marketplace (general, nextjs, react, workflow, etc.)
}

export const MARKETPLACES: MarketplaceConfig[] = [
    {
        id: 'claudesmith-general',
        name: 'ClaudeSmith General Tools',
        source: {
            type: 'github',
            owner: 'JNLei',
            repo: 'claude-tools',
            branch: 'main'
        },
        enabled: true,
        cacheRevalidate: 3600, // 1 hour
        purpose: 'general'
    },
    {
        id: 'anthropic-skills',
        name: 'Anthropic Official Skills',
        source: {
            type: 'github',
            owner: 'anthropics',
            repo: 'skills',
            branch: 'main'
        },
        enabled: true,
        cacheRevalidate: 7200, // 2 hours
        purpose: 'skills'
    },
    {
        id: 'third-party-plugins',
        name: 'Community Plugins',
        source: {
            type: 'local',
            path: 'third-party'
        },
        enabled: true,
        cacheRevalidate: 3600, // 1 hour
        purpose: 'community'
    },
];
