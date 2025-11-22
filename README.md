# ClaudeSmith Directory

A dark-themed, technology-aesthetic directory website for Claude Code tools (plugins, skills, agents, hooks, commands, and MCPs). Built with Next.js 16 App Router and styled with Tailwind CSS.

**Architecture:** This is a **private repository** that dynamically fetches and displays tools from various public GitHub marketplaces and a curated registry of community tools.

## Features

- **Dynamic GitHub Fetching**: No git submodules - all tools are fetched dynamically from GitHub at build time
- **Dual Tool Support**:
  - **Marketplace Plugins**: Claude Code plugins with proper plugin.json format
  - **Community Tools**: Tools with custom installation methods (scripts, CLIs, etc.)
- **Flexible Installation UI**: Supports multiple installation methods:
  - Claude Code marketplace-based plugin installation
  - Single-command installations
  - Multi-step installation guides with rich markdown support
  - Prerequisites and setup instructions
- **Smart Caching**: Next.js fetch caching with configurable revalidation times
- **GitHub API Rate Limiting**: Support for GITHUB_TOKEN to increase rate limits (60/hour → 5000/hour)
- **Tool Detail Pages**: Full-featured pages with file trees and copy-to-clipboard functionality
- **Dark Technology Aesthetic**: Cyberpunk-inspired design with glowing effects, animated grid background
- **Search & Filter**: Real-time search functionality and category filtering
- **Tool Categories**:
  - Skills
  - Agents
  - Hooks
  - Commands
  - MCPs (Model Context Protocol)
  - Plugins
- **Featured Tools**: Highlighted tools with special visual treatment
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Tech Stack

- **Next.js 16**: Latest version with App Router and Turbopack
- **React 19**: Latest React version
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling with custom animations
- **React Markdown**: Rich markdown rendering for installation guides
- **Syntax Highlighting**: Code blocks with copy buttons
- **Custom CSS Effects**: Grid animation, scanlines, noise overlay, glowing effects

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- (Optional) GitHub Personal Access Token for higher API rate limits

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/JNLei/claudesmith-directory.git
cd claudesmith-directory

# Install dependencies
npm install

# (Optional) Set up environment variables for GitHub API
cp env.example .env.local
# Edit .env.local and add your GITHUB_TOKEN

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# GitHub Personal Access Token (optional but recommended)
# Get yours at: https://github.com/settings/tokens/new
# Required scopes: public_repo (for public repositories)
# This increases GitHub API rate limit from 60/hour to 5,000/hour
GITHUB_TOKEN=ghp_your_token_here
```

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
claudesmith-directory/
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout with background effects
│   │   ├── page.tsx               # Main directory page
│   │   ├── globals.css            # Global styles and animations
│   │   ├── tools/
│   │   │   └── [category]/
│   │   │       └── [id]/
│   │   │           └── page.tsx   # Tool detail page
│   │   └── blog/                  # Blog section
│   ├── components/
│   │   ├── Header.tsx             # Navigation header
│   │   ├── SearchBar.tsx          # Search input component
│   │   ├── CategoryFilter.tsx     # Category filter buttons
│   │   ├── ToolCard.tsx           # Individual tool card
│   │   ├── CopyButton.tsx         # Copy-to-clipboard component
│   │   ├── FileTree.tsx           # File tree viewer with collapsible folders
│   │   ├── FlexibleInstallation.tsx  # Dynamic installation UI
│   │   └── ui/                    # shadcn/ui components
│   ├── lib/
│   │   ├── types.ts               # TypeScript type definitions
│   │   ├── data.ts                # Data loading entry point
│   │   ├── marketplaces.config.ts # Marketplace configurations
│   │   ├── actions/
│   │   │   └── marketplace-actions.ts  # Server actions for loading tools
│   │   ├── fetchers/
│   │   │   ├── github-fetcher.ts       # GitHub API fetcher with caching
│   │   │   ├── local-fetcher.ts        # Local file fetcher (dev)
│   │   │   ├── non-plugin-fetcher.ts   # Fetcher for community tools
│   │   │   └── marketplace-fetcher.interface.ts
│   │   └── schemas/
│   │       └── tools-registry.schema.ts  # Non-plugin tools schema
│   └── data/
│       └── tools-registry.json    # Community tools registry
├── env.example                    # Environment variables template
└── package.json
```

## Architecture

### Dynamic Fetching System

This project fetches tools dynamically from GitHub repositories at build time (and periodically refreshes based on cache settings):

```
Claude Code Marketplaces (GitHub)
         ↓ (GitHub API + fetch cache)
  MarketplaceFetcher
         ↓
  marketplace-actions.ts
         ↓
  Tool data with content
         ↓
  Website displays tools
```

**Key Components:**

1. **Marketplace Configuration** (`src/lib/marketplaces.config.ts`)
   - Defines all marketplace sources (GitHub repos)
   - Configurable cache revalidation times
   - Purpose-based categorization

2. **Fetchers** (`src/lib/fetchers/`)
   - `GitHubFetcher`: Fetches from GitHub with API caching
   - `NonPluginToolFetcher`: Handles community tools with custom installation
   - All fetchers implement `MarketplaceFetcher` interface

3. **Tools Registry** (`src/data/tools-registry.json`)
   - Contains metadata for non-plugin tools
   - Supports rich markdown installation instructions
   - Flexible file inclusion patterns

### Tool Types

#### 1. Marketplace Plugins

Standard Claude Code plugins with `plugin.json` manifest:

```json
{
  "name": "my-plugin",
  "source": {
    "source": "github",
    "repo": "owner/plugin-repo"
  },
  "description": "Plugin description",
  "category": "skills",
  "tags": ["tag1", "tag2"]
}
```

Installation via Claude Code marketplace commands.

#### 2. Community Tools (Non-Plugin)

Tools with custom installation methods defined in `tools-registry.json`:

```json
{
  "id": "tool-id",
  "name": "Tool Name",
  "category": "commands",
  "repository": {
    "type": "github",
    "owner": "owner",
    "repo": "repo"
  },
  "installation": {
    "steps": [
      {
        "content": "Markdown instructions with **formatting** and code blocks"
      }
    ]
  }
}
```

## Managing Tools

### Adding Marketplace Plugins

1. Edit `src/lib/marketplaces.config.ts`
2. Add new marketplace or modify existing ones
3. Rebuild the website

### Adding Community Tools

1. Edit `src/data/tools-registry.json`
2. Add tool metadata following the schema:

```json
{
  "id": "unique-id",
  "name": "Tool Name",
  "category": "commands",
  "description": "Brief description",
  "author": "Author Name",
  "version": "1.0.0",
  "tags": ["tag1", "tag2"],
  "lastUpdated": "2025-11-21T00:00:00Z",
  "repository": {
    "type": "github",
    "url": "https://github.com/owner/repo",
    "owner": "owner",
    "repo": "repo",
    "branch": "main"
  },
  "installation": {
    "prerequisites": [
      {
        "content": "Markdown prerequisites if needed"
      }
    ],
    "steps": [
      {
        "content": "Full markdown with:\n\n```bash\ncurl -fsSL url | bash\n```\n\nSupports all markdown features!"
      }
    ]
  },
  "files": {
    "include": ["README.md", "install.sh", ".claude/**/*"],
    "exclude": [".git/**"]
  }
}
```

3. Rebuild the website

### Tools Registry Schema

See `src/lib/schemas/tools-registry.schema.ts` for complete type definitions.

**Key Features:**
- Rich markdown support in installation steps
- Automatic code block detection with copy buttons
- File inclusion patterns with glob support
- Flexible prerequisites section
- Multi-step installation guides

## Caching Strategy

The application uses Next.js fetch caching with the following strategy:

- **Marketplace data**: 1 hour (3600s) revalidation
- **Anthropic Skills**: 2 hours (7200s) revalidation
- **Tool files**: Per-marketplace configuration
- **GitHub API**: Automatic retry with exponential backoff
- **Rate Limiting**: 
  - Without token: 60 requests/hour
  - With GITHUB_TOKEN: 5,000 requests/hour

Cache tags enable selective revalidation:
- `all-tools`: Revalidate all tool data
- `github:{owner}/{repo}`: Revalidate specific repo
- `github:{owner}/{repo}:contents`: Revalidate directory listings

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variable:
   - `GITHUB_TOKEN`: Your GitHub Personal Access Token
3. Deploy

The build process will:
- Fetch all marketplaces from GitHub
- Load non-plugin tools from registry
- Generate static pages for all tools
- Enable ISR (Incremental Static Regeneration) for dynamic updates

### Other Platforms

Ensure your deployment platform:
- Supports Next.js 16 App Router
- Has Node.js 18+ runtime
- Can set environment variables
- Supports server-side rendering and API routes

## Contributing

### Adding a New Tool

Please submit tools by:
1. Creating a PR to the appropriate marketplace repository, OR
2. Opening an issue with your tool information for inclusion in `tools-registry.json`

### Contributing Guide

Coming soon: `CONTRIBUTING.md` with detailed contribution guidelines.

## Troubleshooting

### GitHub API Rate Limiting

**Problem**: Getting 403 errors or rate limit messages

**Solution**:
```bash
# Add GITHUB_TOKEN to .env.local
GITHUB_TOKEN=ghp_your_token_here
```

### Tools Not Updating

**Problem**: Tools show outdated information

**Solution**:
```bash
# Clear Next.js cache and rebuild
rm -rf .next
npm run build
```

### Build Failures

**Problem**: Build fails with fetch errors

**Solution**:
- Check internet connectivity
- Verify marketplace URLs in `marketplaces.config.ts`
- Ensure all GitHub repos are accessible
- Check GITHUB_TOKEN has correct permissions

## Custom Styling

The application includes several custom CSS effects:

- **Grid Background**: Animated grid that moves diagonally
- **Scanline**: Horizontal line creating a CRT monitor effect
- **Noise Overlay**: Subtle texture overlay for depth
- **Glow Effects**: Text and border glowing effects
- **Holographic Cards**: Cards with animated border gradients
- **Custom Scrollbar**: Styled scrollbar with cyan gradient

## License

**This repository (claudesmith-directory):** Private/Proprietary

**Tools:** Each tool has its own license as specified in its repository

## Links

- [Claude Code Documentation](https://code.claude.com/docs)
- [Plugin Marketplace Guide](https://code.claude.com/docs/en/plugin-marketplaces.md)
- [Anthropic Skills](https://github.com/anthropics/skills)
