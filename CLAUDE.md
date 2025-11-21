# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ClaudeSmith Directory is a Next.js 16 application that serves as a directory website for Claude Code tools (plugins, skills, agents, hooks, commands, and MCPs). The project uses the App Router architecture with React 19 and TypeScript, with dynamic GitHub-based data fetching.

## Development Commands

```bash
# Start development server (runs on port 3000 with Turbopack)
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run linter
npm run lint
```

## Architecture

### Data Fetching System

The application uses a **dynamic GitHub fetching architecture** (no git submodules):

1. **Marketplace Configuration** (`src/lib/marketplaces.config.ts`)
   - Defines marketplace sources (GitHub repos)
   - Configurable cache revalidation times
   - Supports multiple marketplaces simultaneously

2. **Fetchers** (`src/lib/fetchers/`)
   - `GitHubFetcher`: Fetches from GitHub API with Next.js caching
   - `NonPluginToolFetcher`: Handles community tools with custom installation
   - `LocalFetcher`: For local development/testing
   - All implement `MarketplaceFetcher` interface

3. **Data Loading** (`src/lib/actions/marketplace-actions.ts`)
   - Server actions that fetch tools at build time
   - Caches results using Next.js `unstable_cache`
   - Merges marketplace plugins and community tools

4. **Tools Registry** (`src/data/tools-registry.json`)
   - Contains metadata for non-plugin tools
   - Supports rich markdown installation instructions
   - Flexible file inclusion patterns

### Data Model

Core types defined in `src/lib/types.ts`:

- `Tool`: Base tool information (id, name, category, description, author, version, tags, etc.)
- `ToolWithContent`: Extended tool with files and installation instructions
- `ToolCategory`: 'hooks' | 'skills' | 'agents' | 'slash-commands' | 'commands' | 'mcp' | 'plugin'
- `InstallationStep`: Markdown-based installation steps
- `ToolInstallation`: Supports both marketplace plugins and custom installations

### Client-Side State Management

The main page (`src/app/page.tsx`) is a client component that manages:
- Search query state for filtering tools by name, description, or tags
- Category selection state for filtering by tool type
- Memoized filtering logic using `useMemo`

### Component Structure

- **Presentational components**: `Header`, `SearchBar`, `CategoryFilter`, `ToolCard`
- **Smart components**: `page.tsx`, `FlexibleInstallation.tsx`
- **File display**: `FileTree.tsx` - Interactive file tree with collapsible folders
- **UI primitives**: Located in `src/components/ui/` (shadcn/ui components)

### Tool Detail Pages

Dynamic routes at `/tools/[category]/[id]`:
- Fetches tool data server-side
- Displays file trees for all tool files
- Shows dynamic installation UI via `FlexibleInstallation` component
- Supports both marketplace plugins and community tools

### Installation UI

`FlexibleInstallation.tsx` component handles two types of tools:

1. **Marketplace Plugins**: Standard Claude Code plugin installation
   - Project-level: `.claude/settings.json` configuration
   - Global-level: `/plugin marketplace add` commands

2. **Community Tools**: Custom installation methods
   - Markdown-based instructions with syntax highlighting
   - Automatic code block detection with copy buttons
   - Support for prerequisites and multi-step guides

### Styling System

- Uses Tailwind CSS with custom dark theme (CSS variables in `src/app/globals.css`)
- Custom animations: pulse-glow, scan, flicker, glitch
- Dark mode hardcoded via `className="dark"` in root layout
- Orbitron for headings, Azeret Mono for body text
- Custom scrollbar styling

### Key Design Patterns

1. **Dynamic Fetching**: Tools fetched from GitHub at build time with ISR
2. **Server Actions**: Data loading happens server-side with caching
3. **Type Safety**: Full TypeScript coverage with strict mode
4. **Caching Strategy**: Next.js fetch caching with configurable revalidation
5. **Path Aliases**: `@/*` maps to `src/*`
6. **GitHub API**: Supports GITHUB_TOKEN for higher rate limits (5000/hour vs 60/hour)

## Adding New Tools

### Adding Marketplace Plugins

1. Edit `src/lib/marketplaces.config.ts`
2. Add or modify marketplace configuration:
   ```typescript
   {
     id: 'marketplace-id',
     name: 'Marketplace Name',
     source: {
       type: 'github',
       owner: 'github-owner',
       repo: 'repo-name',
       branch: 'main'
     },
     enabled: true,
     cacheRevalidate: 3600
   }
   ```
3. Rebuild the application

### Adding Community Tools (Non-Plugin)

1. Edit `src/data/tools-registry.json`
2. Add tool entry following the schema in `src/lib/schemas/tools-registry.schema.ts`
3. Include markdown installation instructions in `installation.steps[].content`
4. Rebuild the application

## Environment Variables

Optional but recommended for development:

```bash
# .env.local
GITHUB_TOKEN=ghp_your_token_here  # Increases API rate limit to 5000/hour
```

Get token at: https://github.com/settings/tokens/new (requires `public_repo` scope)

## Caching Strategy

- Marketplace data: 1 hour revalidation
- Anthropic Skills: 2 hours revalidation  
- Tool files: Per-marketplace configuration
- Cache tags: `all-tools`, `github:{owner}/{repo}`, `github:{owner}/{repo}:contents`

## File Organization

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
├── data/             # Static data (tools-registry.json)
├── lib/
│   ├── actions/      # Server actions
│   ├── fetchers/     # Data fetching classes
│   └── schemas/      # TypeScript schemas
```

## Development Notes

- Tools update automatically based on cache revalidation times
- No manual sync required - everything fetched dynamically
- Use `GITHUB_TOKEN` to avoid rate limiting during development
- Test locally with `npm run dev` before deploying
- All tool pages use ISR (Incremental Static Regeneration)
