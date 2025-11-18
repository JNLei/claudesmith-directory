# ClaudeSmith Directory

A dark-themed, technology-aesthetic directory website for Claude Code tools (hooks, skills, agents, and slash commands). Built with Next.js 16 App Router and styled with Tailwind CSS.

**Architecture:** This is a **private repository** that displays tools from the public [claudesmith-tools](https://github.com/yourorg/claudesmith-tools) repository via git submodule. The tools repository is the single source of truth, and this website renders them.

## Features

- **Hybrid Repository Architecture**: Tools are open-sourced in a separate public repo, website remains private
- **Dynamic Tool Rendering**: Automatically syncs and displays tools from git submodule at build time
- **Tool Detail Pages**: Full-featured pages for each tool with copy-to-clipboard functionality
- **Dark Technology Aesthetic**: Cyberpunk-inspired design with glowing effects, animated grid background, scanlines, and noise overlays
- **Distinctive Typography**: Uses Orbitron for headings and Azeret Mono for body text, creating a unique tech-forward appearance
- **Search & Filter**: Real-time search functionality and category filtering
- **Tool Categories**:
  - Hooks
  - Skills
  - Agents
  - Slash Commands
- **Featured Tools**: Highlighted tools with special visual treatment
- **Holographic Cards**: Tool cards with hover effects, glowing borders, and smooth animations
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Tech Stack

- **Next.js 16**: Latest version with App Router and Turbopack
- **React 19**: Latest React version
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling with custom animations
- **Custom CSS Effects**: Grid animation, scanlines, noise overlay, glowing effects

## Design Philosophy

This project follows the frontend-development skill principles:

- **Bold Aesthetic Direction**: Embraces a cyberpunk/technology aesthetic with confidence
- **Distinctive Typography**: Avoids generic fonts (Inter, Roboto) in favor of characterful choices
- **Rich Visual Details**: Includes animated backgrounds, scanline effects, holographic cards, and glowing text
- **Intentional Motion**: CSS-based animations for grid movement, cursor blinks, and card hover states
- **Atmospheric Backgrounds**: Layered effects with grid, noise, and scanline overlays
- **Production-Grade Code**: Clean, well-structured components with proper TypeScript typing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git (for submodule management)
- Access to the `claudesmith-tools` repository

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/yourorg/claudesmith-directory.git
cd claudesmith-directory

# Initialize and update git submodule (tools repository)
git submodule update --init --recursive

# Install dependencies
npm install

# Sync tools from submodule to src/lib/data.ts
npm run sync-tools

# Run development server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to view the application.

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production (automatically runs sync-tools first)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run sync-tools` - Manually sync tools from submodule to data.ts

### Important Notes

⚠️ **The `tools/` directory is a git submodule** pointing to the public `claudesmith-tools` repository. Do not edit files in `tools/` directly in this repo.

⚠️ **The `src/lib/data.ts` file is auto-generated** by `scripts/sync-tools.ts`. Do not edit it manually - your changes will be overwritten.

## Project Structure

```
claudesmith-directory/
├── tools/                         # Git submodule → claudesmith-tools (public repo)
│   ├── hooks/                     # Tool files from public repo
│   ├── skills/
│   ├── manifest.json              # Generated index of all tools
│   └── ...
├── scripts/
│   └── sync-tools.ts              # Syncs tools to src/lib/data.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout with background effects
│   │   ├── page.tsx               # Main directory page
│   │   ├── globals.css            # Global styles and animations
│   │   ├── tools/
│   │   │   └── [category]/
│   │   │       └── [id]/
│   │   │           └── page.tsx   # Tool detail page
│   │   └── blog/                  # Blog section (private)
│   ├── components/
│   │   ├── Header.tsx             # Navigation header
│   │   ├── SearchBar.tsx          # Search input component
│   │   ├── CategoryFilter.tsx     # Category filter buttons
│   │   ├── ToolCard.tsx           # Individual tool card
│   │   ├── CopyButton.tsx         # Copy-to-clipboard component
│   │   └── ui/                    # shadcn/ui components
│   └── lib/
│       ├── types.ts               # TypeScript type definitions
│       └── data.ts                # AUTO-GENERATED - Do not edit!
├── _public-repo-template/         # Templates for public repo setup
├── DEVELOPER_WORKFLOW.md          # Developer guide
└── package.json
```

## Custom Styling

The application includes several custom CSS effects:

- **Grid Background**: Animated grid that moves diagonally
- **Scanline**: Horizontal line that moves vertically creating a CRT monitor effect
- **Noise Overlay**: Subtle texture overlay for depth
- **Glow Effects**: Text and border glowing effects using box-shadow
- **Cyber Buttons**: Clipped polygon shapes with gradient overlays
- **Holographic Cards**: Cards with animated border gradients on hover
- **Custom Scrollbar**: Styled scrollbar with cyan gradient

## Architecture

### Hybrid Repository Design

This project uses a **dual-repository architecture**:

1. **claudesmith-tools** (Public Repository)
   - Open source (MIT License)
   - Contains all tools (hooks, skills, agents, slash commands)
   - Single source of truth
   - Users can copy tools directly from GitHub or website

2. **claudesmith-directory** (This Private Repository)
   - Closed source website application
   - Displays tools via git submodule
   - Blog and other private features
   - Renders tools from public repo

### How It Works

```
Public Repo (claudesmith-tools)
         ↓ (git submodule)
      tools/
         ↓ (build time)
  sync-tools.ts reads manifest.json
         ↓
  Generates src/lib/data.ts
         ↓
  Website displays tools
```

**Key Benefits:**
- Tools are open source and freely accessible
- Website code remains private
- GitHub is single source of truth
- Users can copy from website OR GitHub
- Automated sync process

### Build Process

1. `npm run build` triggers `prebuild` script
2. `prebuild` runs `tsx scripts/sync-tools.ts`
3. Sync script reads `tools/manifest.json` from submodule
4. Script loads all tool content
5. Generates `src/lib/data.ts` with full tool data
6. Next.js build proceeds with fresh data

## Managing Tools

### Adding New Tools

To add a new tool, work in the **public repository** (`claudesmith-tools`):

1. Create tool directory and files
2. Add `metadata.json` with tool information
3. Run manifest generator
4. Commit and push to public repo
5. Update this repo's submodule reference
6. Rebuild website

See [DEVELOPER_WORKFLOW.md](./DEVELOPER_WORKFLOW.md) for detailed instructions.

### Updating Tools on Website

```bash
# Pull latest tools from public repo
git submodule update --remote tools

# Commit the submodule reference update
git add tools
git commit -m "chore: update tools to latest version"
git push

# Deploy will automatically sync tools
```

## Documentation

Comprehensive documentation is available:

- **[DEVELOPER_WORKFLOW.md](./DEVELOPER_WORKFLOW.md)** - Complete guide for maintaining both repositories, adding tools, and deployment
- **[_public-repo-template/](./\_public-repo-template/)** - Templates and scripts for setting up the public tools repository
  - `METADATA_SCHEMA.md` - Metadata.json specification
  - `DIRECTORY_STRUCTURE.md` - Public repo structure guide
  - `GITMODULES_SETUP.md` - Git submodule setup instructions
  - `README.md` - Public repo documentation template
  - `generate-manifest.ts` - Manifest generation script

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Configure build settings:
   - **Build Command:** `npm run build`
   - **Install Command:** `npm install && git submodule update --init --recursive`
   - **Output Directory:** `.next`
3. Deploy

The build process will automatically:
- Initialize and update the git submodule
- Sync tools from the submodule
- Generate `src/lib/data.ts`
- Build the Next.js application

### Other Platforms

Ensure your deployment platform:
- Supports git submodules
- Runs `git submodule update --init --recursive` before build
- Executes the `prebuild` script (or manually run `npm run sync-tools`)

## Troubleshooting

### Submodule is empty or missing
```bash
git submodule update --init --recursive
```

### data.ts is not generated
```bash
npm run sync-tools
```

### Tools are outdated
```bash
git submodule update --remote tools
git add tools
git commit -m "chore: update tools"
```

## License

**This repository (claudesmith-directory):** Private/Proprietary

**Tools repository (claudesmith-tools):** MIT License - tools are freely available to the community
