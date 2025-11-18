# Developer Workflow Guide

This guide documents the complete developer workflow for maintaining both the **claudesmith-tools** (public) and **claudesmith-directory** (private) repositories.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│   claudesmith-tools (PUBLIC REPO)       │
│   - Single source of truth for tools    │
│   - MIT Licensed                         │
│   - Contains: hooks, skills, agents,    │
│     slash commands, metadata            │
│   - Auto-generates manifest.json        │
└──────────────┬──────────────────────────┘
               │ Git Submodule
               ↓
┌─────────────────────────────────────────┐
│  claudesmith-directory (PRIVATE REPO)   │
│  - Website application                   │
│  - Next.js 16 + React 19                │
│  - Reads from tools/ submodule          │
│  - Generates src/lib/data.ts at build   │
│  - Blog, auth, other features           │
└─────────────────────────────────────────┘
```

**Key Principle:** GitHub repo is the single source of truth. Website renders/displays tools.

## 📦 Initial Setup

### 1. Create Public Tools Repository

```bash
# Create directory for public repo
mkdir claudesmith-tools
cd claudesmith-tools

# Initialize git
git init
git branch -M main

# Copy template structure from _public-repo-template/
# You'll need:
# - hooks/
# - skills/
# - agents/
# - slash-commands/
# - scripts/
# - docs/
# - README.md
# - LICENSE (MIT)
# - package.json
# - .gitignore

# Create initial commit
git add .
git commit -m "feat: initial repository structure"

# Create GitHub repo and push
gh repo create yourorg/claudesmith-tools --public --source=. --remote=origin
git push -u origin main
```

### 2. Migrate Existing Tools

```bash
# Still in claudesmith-tools/

# Copy tools from your current project
cp -r /path/to/claudesmith-directory/.claude/hooks/* hooks/
cp -r /path/to/claudesmith-directory/.claude/skills/* skills/

# For each tool, create metadata.json
# Example for a skill:
cat > skills/frontend-development/metadata.json << EOF
{
  "id": "frontend-development",
  "name": "Frontend Development",
  "category": "skills",
  "description": "Create distinctive, production-grade frontend interfaces",
  "author": "ClaudeSmith",
  "version": "1.0.0",
  "tags": ["frontend", "react", "design"],
  "featured": true,
  "files": {
    "main": "SKILL.md",
    "additional": ["REFERENCE.md", "EXAMPLES.md"]
  },
  "installation": {
    "targetDir": ".claude/skills/frontend-development"
  }
}
EOF

# Generate manifest.json
cd scripts
npm install
npm run generate

# Commit tools
cd ..
git add .
git commit -m "feat: add initial tools collection"
git push
```

### 3. Set Up Submodule in Website Repo

```bash
# Navigate to website repo
cd /path/to/claudesmith-directory

# Add tools as submodule
git submodule add https://github.com/yourorg/claudesmith-tools.git tools

# Configure submodule
cat > .gitmodules << EOF
[submodule "tools"]
  path = tools
  url = https://github.com/yourorg/claudesmith-tools.git
  branch = main
  update = merge
EOF

# Commit submodule
git add .gitmodules tools
git commit -m "feat: add tools repository as git submodule"
git push
```

### 4. Install Dependencies

```bash
# Website repo should already have tsx from earlier setup
npm install

# Initialize submodule (if needed)
git submodule update --init --recursive
```

## 🔄 Daily Workflows

### Workflow A: Adding a New Tool

**Where:** Work in `claudesmith-tools` repository

```bash
# 1. Navigate to tools repo (or work in separate clone)
cd /path/to/claudesmith-tools

# 2. Create tool directory structure
mkdir -p skills/new-skill

# 3. Create tool files
cat > skills/new-skill/SKILL.md << EOF
---
name: new-skill
description: Description of what this skill does
---

# Skill content here
EOF

# 4. Create metadata.json
cat > skills/new-skill/metadata.json << EOF
{
  "id": "new-skill",
  "name": "New Skill",
  "category": "skills",
  "description": "Description of what this skill does",
  "author": "Your Name",
  "version": "1.0.0",
  "tags": ["tag1", "tag2"],
  "files": {
    "main": "SKILL.md"
  },
  "installation": {
    "targetDir": ".claude/skills/new-skill"
  }
}
EOF

# 5. Create README
cat > skills/new-skill/README.md << EOF
# New Skill

## Installation
\`\`\`bash
cp -r skills/new-skill ~/.claude/skills/
\`\`\`

## Usage
...
EOF

# 6. Regenerate manifest
cd scripts
npm run generate

# 7. Commit and push
cd ..
git add .
git commit -m "feat: add new-skill"
git push origin main
```

### Workflow B: Updating Website with Latest Tools

**Where:** Work in `claudesmith-directory` repository

```bash
# 1. Navigate to website repo
cd /path/to/claudesmith-directory

# 2. Update submodule to latest
git submodule update --remote tools

# 3. Check what changed
cd tools
git log -1  # See latest commit
cd ..

# 4. Test locally
npm run sync-tools  # Manually sync to test
npm run dev        # Verify website works

# 5. Commit submodule update
git add tools
git commit -m "chore: update tools to latest version"
git push

# 6. Deploy (if using Vercel/Netlify, this happens automatically)
```

### Workflow C: Updating an Existing Tool

**Where:** Work in `claudesmith-tools` repository

```bash
# 1. Navigate to tools repo
cd /path/to/claudesmith-tools

# 2. Make changes to tool
vim skills/frontend-development/SKILL.md

# 3. Update version in metadata.json
vim skills/frontend-development/metadata.json
# Change: "version": "1.0.0" → "1.1.0"

# 4. Regenerate manifest
cd scripts
npm run generate

# 5. Commit and push
cd ..
git add .
git commit -m "feat(frontend-development): add new examples section"
git push origin main

# 6. Update website (see Workflow B)
```

### Workflow D: Testing Tools Locally Before Publishing

```bash
# 1. Work in tools repo
cd /path/to/claudesmith-tools

# 2. Make changes
vim skills/test-skill/SKILL.md

# 3. Test by copying to your local .claude/
cp -r skills/test-skill ~/.claude/skills/

# 4. Test with Claude Code
# (Use Claude Code to verify the tool works)

# 5. If good, commit and push
git add .
git commit -m "feat: add test-skill"
git push
```

## 🚀 Deployment

### Website Deployment (Automatic)

The website (`claudesmith-directory`) should be set up with automatic deployment:

**Vercel Setup:**
```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Configure build settings in vercel.json or dashboard:
# Build Command: npm run build
# Install Command: npm install && git submodule update --init --recursive
```

**Build Process:**
1. Vercel clones repository
2. Initializes submodules (`git submodule update --init --recursive`)
3. Runs `npm install` (includes tsx)
4. Runs `prebuild` script → `tsx scripts/sync-tools.ts`
5. Sync script reads `tools/manifest.json`
6. Generates `src/lib/data.ts` with tool content
7. Runs `next build`
8. Deploys static site

### Manual Deployment

```bash
cd /path/to/claudesmith-directory

# 1. Ensure submodule is updated
git submodule update --remote tools

# 2. Install dependencies
npm install

# 3. Build
npm run build
# This automatically runs sync-tools via prebuild script

# 4. Test production build
npm start

# 5. Deploy
# (Upload .next/ and other required files to your host)
```

## 🔍 Troubleshooting

### Issue: Submodule is empty after clone

**Solution:**
```bash
git submodule update --init --recursive
```

### Issue: sync-tools.ts fails with "manifest.json not found"

**Solution:**
```bash
# Ensure submodule is initialized
cd tools
git pull origin main
cd ..

# Ensure manifest exists in tools repo
ls tools/manifest.json

# If missing, regenerate in tools repo
cd /path/to/claudesmith-tools/scripts
npm run generate
git add ../manifest.json
git commit -m "chore: regenerate manifest"
git push
```

### Issue: Website shows old tool data

**Solution:**
```bash
# Update submodule reference
git submodule update --remote tools

# Manually sync
npm run sync-tools

# Check generated data
cat src/lib/data.ts

# Rebuild
npm run build
```

### Issue: TypeScript errors after syncing tools

**Solution:**
```bash
# Ensure types are up to date
npm run sync-tools

# Check that ToolWithContent interface is correct in types.ts
cat src/lib/types.ts

# Rebuild
npm run build
```

## 📋 Checklist Templates

### Before Adding a New Tool

- [ ] Tool is tested and working in your local `.claude/` directory
- [ ] All files are properly named and organized
- [ ] `metadata.json` is complete and accurate
- [ ] `README.md` explains installation and usage
- [ ] Tool follows best practices (see docs/TOOL_GUIDELINES.md)
- [ ] Version follows semantic versioning (1.0.0 for new tools)

### Before Pushing to Tools Repo

- [ ] All tool files are included
- [ ] Manifest is regenerated (`npm run generate`)
- [ ] No sensitive information or credentials
- [ ] Commit message follows convention (feat:, fix:, docs:)
- [ ] Changes are tested locally

### Before Updating Website

- [ ] Tools repo is pushed and up to date
- [ ] Submodule update is tested locally (`npm run sync-tools && npm run dev`)
- [ ] No build errors or TypeScript issues
- [ ] Tool detail pages render correctly
- [ ] Copy buttons work for new tools

## 🎯 Best Practices

### Version Control

- **Tools Repo:** Use semantic versioning tags (v1.0.0, v1.1.0)
- **Website Repo:** Tag releases for significant changes
- **Commits:** Use conventional commits (feat:, fix:, docs:, chore:)

### Testing

- **Always test tools** in your local `.claude/` before publishing
- **Test website locally** after syncing new tools
- **Verify copy buttons** work on tool detail pages
- **Check mobile responsiveness** for new UI components

### Documentation

- **Every tool needs a README** with installation instructions
- **Update main README** when adding featured tools
- **Document breaking changes** in commit messages
- **Keep metadata accurate** (version, tags, descriptions)

### Collaboration

- **Review PRs thoroughly** before merging to tools repo
- **Communicate** breaking changes to users
- **Maintain changelog** for major updates
- **Respond to issues** in a timely manner

## 🔗 Quick Reference

### Important Files

**Tools Repo:**
- `manifest.json` - Auto-generated tool index
- `scripts/generate-manifest.ts` - Manifest generator
- `docs/METADATA_SCHEMA.md` - Metadata specification
- `README.md` - Public-facing documentation

**Website Repo:**
- `scripts/sync-tools.ts` - Syncs tools to data.ts
- `src/lib/data.ts` - Generated tool data (don't edit)
- `src/lib/types.ts` - TypeScript interfaces
- `.gitmodules` - Submodule configuration

### Common Commands

**Tools Repo:**
```bash
npm run generate    # Generate manifest
npm run validate    # Validate metadata
npm run create-tool # Scaffold new tool
```

**Website Repo:**
```bash
npm run sync-tools  # Sync tools manually
npm run dev        # Start dev server
npm run build      # Build for production
git submodule update --remote tools  # Update tools
```

## 📞 Getting Help

- **Tools Issues:** [claudesmith-tools/issues](https://github.com/yourorg/claudesmith-tools/issues)
- **Website Issues:** Internal issue tracker
- **Documentation:** See `docs/` in tools repo
- **Questions:** [Discussions](https://github.com/yourorg/claudesmith-tools/discussions)

---

**Last Updated:** 2025-11-17
**Maintained by:** ClaudeSmith Team
