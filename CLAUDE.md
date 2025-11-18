# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ClaudeSmith Directory is a Next.js 16 application that serves as a directory website for Claude Code tools (hooks, skills, agents, and slash commands). The project uses the App Router architecture with React 19 and TypeScript.

## Development Commands

```bash
# Start development server (runs on port 3001 with Turbopack)
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run linter
npm lint
```

## Architecture

### Data Model
The application uses a centralized data model defined in `src/lib/types.ts`:
- `Tool` interface: Core data structure with id, name, category, description, author, version, tags, downloads, rating, lastUpdated, and optional featured flag
- `ToolCategory` type: Union type of 'hooks' | 'skills' | 'agents' | 'slash-commands'

All tool data is stored in `src/lib/data.ts` as a static array and imported throughout the application.

### Client-Side State Management
The main page (`src/app/page.tsx`) is a client component that manages:
- Search query state for filtering tools by name, description, or tags
- Category selection state for filtering by tool type
- Memoized filtering logic using `useMemo` to derive filtered tools from search and category state

### Component Structure
- **Presentational components**: `Header`, `SearchBar`, `CategoryFilter`, `ToolCard` - receive props and render UI
- **Smart component**: `page.tsx` - manages state and filtering logic
- **UI primitives**: Located in `src/components/ui/` - shadcn/ui-based components (Button, Card, Input, Badge, Separator)

### Styling System
- Uses Tailwind CSS with a custom dark theme defined via CSS variables in `src/app/globals.css`
- Custom animations defined in `tailwind.config.ts`: pulse-glow, scan, flicker, glitch
- Dark mode is hardcoded via `className="dark"` in root layout
- Inter font family for clean, modern typography
- Custom scrollbar styling for consistent dark theme appearance

### Key Design Patterns
1. **Static Data**: All tools are stored in a static array, not fetched from an API
2. **Client-Side Filtering**: Search and filter happen in-browser using React state
3. **Memoization**: `useMemo` prevents unnecessary recalculation of filtered results
4. **Type Safety**: Full TypeScript coverage with strict mode enabled
5. **Path Aliases**: `@/*` maps to `src/*` for cleaner imports

## Adding New Tools

To add tools to the directory, edit `src/lib/data.ts` and add new entries to the `tools` array following the `Tool` interface structure. The UI will automatically update to display new tools.
