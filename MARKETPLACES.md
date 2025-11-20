# Marketplace Management

This document explains how external marketplaces are managed in ClaudeSmith Directory.

## Architecture

### Local Marketplace (Your Tools)
- **Path**: `./tools`
- **Type**: Git submodule
- **Repository**: https://github.com/JNLei/claude-tools.git

### External Marketplaces
External marketplaces are added as git submodules in the `external-marketplaces/` directory:

- **Anthropic Skills**: `./external-marketplaces/anthropic-skills`

## Why Git Submodules?

Instead of calling GitHub API during build time (which causes delays and rate limits), we use git submodules to:
- ✅ Pull all marketplace files at build time (fast, no API calls)
- ✅ Work offline after initial clone
- ✅ Predictable build times
- ✅ No GitHub API rate limits
- ✅ Works seamlessly with Vercel deployment

## Adding a New External Marketplace

### Step 1: Add as Git Submodule

```bash
git submodule add -b main https://github.com/OWNER/REPO.git external-marketplaces/MARKETPLACE-NAME
```

### Step 2: Update Configuration

Edit `src/lib/marketplaces.config.ts`:

```typescript
{
    id: 'marketplace-name',
    name: 'Marketplace Display Name',
    source: {
        type: 'local',
        path: './external-marketplaces/MARKETPLACE-NAME'
    },
    enabled: true,
}
```

### Step 3: Commit Changes

```bash
git add .gitmodules external-marketplaces/ src/lib/marketplaces.config.ts
git commit -m "feat: add MARKETPLACE-NAME marketplace"
git push
```

## Updating Marketplaces

### Manually Update All Marketplaces

```bash
bash scripts/sync-marketplaces.sh
```

Or:

```bash
git submodule update --remote --recursive
```

### Manually Update Specific Marketplace

```bash
cd external-marketplaces/MARKETPLACE-NAME
git pull origin main
cd ../..
git add external-marketplaces/MARKETPLACE-NAME
git commit -m "chore: update MARKETPLACE-NAME"
git push
```

## Vercel Deployment

The project is configured to automatically pull git submodules during Vercel builds:

1. **vercel.json**: Sets `git.submodules: true`
2. **package.json**: `postinstall` script ensures submodules are initialized

No additional configuration needed - Vercel handles it automatically!

## Future: User-Contributed Marketplaces

When you launch the contribution page, users can:

1. **Submit their marketplace URL** via a form
2. **Your approval workflow**:
   - Manually add their repo as a submodule
   - Update `marketplaces.config.ts`
   - Commit and push
3. **Automatic deployment** via Vercel

### Potential Future Automation

You could later add a GitHub Action to:
- Accept PRs that add new marketplaces
- Validate marketplace structure
- Auto-merge if validation passes

## Troubleshooting

### Submodules Not Pulling Locally

```bash
git submodule update --init --recursive
```

### Vercel Build Missing Submodules

Ensure `vercel.json` has:
```json
{
  "git": {
    "submodules": true
  }
}
```

### Outdated Marketplace Content

Run the sync script or update submodules manually, then redeploy.
