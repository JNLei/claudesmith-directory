# Contributing to ClaudeSmith Directory

Thank you for your interest in contributing to ClaudeSmith Directory! This guide will help you understand how to add your tools to our directory.

## How to Contribute

There are two main ways to contribute tools to the directory:

### 1. Submit a Claude Code Plugin (Preferred)

If your tool follows the [Claude Code plugin format](https://code.claude.com/docs/en/plugins.md) with a proper `plugin.json` manifest:

1. **Ensure your repository is public** and accessible on GitHub
2. **Add a `.claude-plugin/plugin.json`** manifest to your repository
3. **Open an issue** in this repository with:
   - Tool name and description
   - GitHub repository URL
   - Category (skills, agents, hooks, commands, mcp)
   - Tags for searchability

We'll review your submission and add it to the appropriate marketplace.

#### Plugin Structure Example

```
your-plugin/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── README.md                # Documentation
└── [your plugin files]
```

**plugin.json example:**

```json
{
  "name": "my-awesome-tool",
  "version": "1.0.0",
  "description": "Brief description of your tool",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "skills": ["./skills/my-skill.md"],
  "keywords": ["keyword1", "keyword2"],
  "license": "MIT"
}
```

### 2. Submit a Community Tool (Custom Installation)

If your tool has a custom installation method (CLI, script, etc.) that doesn't follow the plugin format:

1. **Ensure your repository is public** on GitHub
2. **Open an issue** with the following information:
   - Tool name and description
   - GitHub repository URL (owner/repo)
   - Category (skills, agents, hooks, commands)
   - Installation instructions (markdown format)
   - Tags for searchability
   - Version number
   - License

We'll add your tool to our `tools-registry.json` with the information you provide.

#### Community Tool Example

For a tool with a single installation command:

```markdown
## Installation

Run this command in your terminal:

\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/yourname/yourtool/main/install.sh | bash
\`\`\`

This will install the tool to your `.claude` directory.
```

For a tool with multiple steps:

```markdown
## Prerequisites

Ensure you have Node.js 18+ installed.

## Installation Steps

### Step 1: Clone the repository

\`\`\`bash
git clone https://github.com/yourname/yourtool.git
cd yourtool
\`\`\`

### Step 2: Install dependencies

\`\`\`bash
npm install
\`\`\`

### Step 3: Link to Claude

\`\`\`bash
npm link
claude config set yourtool.path "$(pwd)"
\`\`\`
```

## Submission Checklist

Before submitting, ensure:

- ✅ Your repository is **public**
- ✅ You have a **clear README** explaining what your tool does
- ✅ Your tool is **functional** and tested
- ✅ Installation instructions are **accurate**
- ✅ You've included a **license** (MIT, Apache, etc.)
- ✅ Your code follows **best practices**
- ✅ Tags are **relevant** and **searchable**

## Tool Categories

Choose the appropriate category for your tool:

- **skills**: Claude Code skills that enhance AI capabilities
- **agents**: Specialized agents for specific tasks
- **hooks**: Lifecycle hooks (PreToolUse, PostToolUse, etc.)
- **commands**: Slash commands for quick actions
- **mcp**: Model Context Protocol servers
- **plugin**: Full plugin bundles

## Quality Guidelines

To ensure high-quality tools in our directory:

### Documentation

- Provide clear, concise descriptions
- Include usage examples
- Document all configuration options
- List prerequisites and dependencies

### Code Quality

- Write clean, readable code
- Follow TypeScript/JavaScript best practices
- Include proper error handling
- Test your tool thoroughly

### User Experience

- Make installation as simple as possible
- Provide helpful error messages
- Include uninstall instructions
- Keep dependencies minimal

## Issue Template

When opening an issue to add a tool, use this template:

```markdown
## Tool Submission

**Tool Name:** [Your tool name]

**Description:** [Brief, clear description of what your tool does]

**Repository URL:** https://github.com/[owner]/[repo]

**Category:** [skills/agents/hooks/commands/mcp/plugin]

**Tags:** [tag1, tag2, tag3]

**Version:** [1.0.0]

**License:** [MIT/Apache/etc.]

**Has plugin.json?** [Yes/No]

## Installation Instructions

[For community tools without plugin.json, provide markdown installation instructions here]

## Additional Notes

[Any other relevant information]
```

## Review Process

1. **Submission**: You open an issue with your tool information
2. **Review**: Maintainers review your submission (typically within 1 week)
3. **Testing**: We test your tool to ensure it works as described
4. **Approval**: If approved, we add your tool to the directory
5. **Go Live**: Your tool appears on claudesmith.directory after the next deployment

## Updating Your Tool

To update your tool's information:

1. **For plugins**: Update your repository and `plugin.json`
2. **For community tools**: Open an issue with the updated information
3. The directory will automatically fetch the latest version on the next cache refresh

## Removing Your Tool

If you'd like to remove your tool from the directory:

1. Open an issue requesting removal
2. Provide the tool name and reason (optional)
3. We'll remove it in the next update

## Code of Conduct

Please be respectful and constructive in all interactions. We're building this directory to help the Claude Code community, and we appreciate contributions that align with this goal.

## Questions?

If you have questions about contributing:

1. Check the [README](./README.md) for general information
2. Review the [Claude Code documentation](https://code.claude.com/docs)
3. Open an issue with your question

## Tools Registry Format

For maintainers and advanced contributors, here's the JSON schema for community tools in `tools-registry.json`:

```typescript
{
  "id": "string",              // Unique identifier (kebab-case)
  "name": "string",            // Display name
  "category": "string",        // skills|agents|hooks|commands|mcp|plugin
  "description": "string",     // Brief description
  "author": "string",          // Author name
  "version": "string",         // Semantic version (1.0.0)
  "tags": ["string"],          // Search tags
  "lastUpdated": "string",     // ISO 8601 date
  "featured": boolean,         // Optional: featured tool
  "repository": {
    "type": "github",          // Currently only GitHub supported
    "url": "string",           // Full repository URL
    "owner": "string",         // GitHub username/org
    "repo": "string",          // Repository name
    "branch": "string"         // Default: "main"
  },
  "installation": {
    "prerequisites": [         // Optional prerequisites
      {
        "content": "string"    // Markdown content
      }
    ],
    "steps": [                 // Installation steps (required)
      {
        "content": "string",   // Markdown content
        "file": "string"       // Optional: file to display
      }
    ]
  },
  "files": {                   // Optional: files to display
    "include": ["string"],     // Paths/patterns to include
    "exclude": ["string"]      // Paths/patterns to exclude
  }
}
```

### Markdown Features

Installation steps support full markdown including:

- **Bold**, *italic*, ~~strikethrough~~
- `inline code`
- Code blocks with syntax highlighting
- Links: [text](url)
- Lists (ordered and unordered)
- Headings
- Blockquotes

Code blocks automatically get copy buttons:

````markdown
```bash
npm install my-tool
```
````

## Example Submissions

### Example 1: Simple Plugin

```markdown
## Tool Submission

**Tool Name:** Quick Task Manager

**Description:** Add and manage tasks directly from Claude Code with slash commands

**Repository URL:** https://github.com/user/quick-tasks

**Category:** commands

**Tags:** productivity, tasks, organization

**Version:** 1.0.0

**License:** MIT

**Has plugin.json?** Yes

## Additional Notes

Fully tested with Claude Code 1.5+. Includes /task-add, /task-list, and /task-done commands.
```

### Example 2: Community Tool with Script

```markdown
## Tool Submission

**Tool Name:** Dev Environment Setup

**Description:** Automated development environment setup for Claude Code projects

**Repository URL:** https://github.com/user/dev-setup

**Category:** commands

**Tags:** setup, automation, development

**Version:** 2.0.0

**License:** MIT

**Has plugin.json?** No

## Installation Instructions

Run this command to set up your development environment:

\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/user/dev-setup/main/setup.sh | bash
\`\`\`

This will:
- Install required dependencies
- Configure Claude Code settings
- Set up project templates

## Additional Notes

Requires bash shell and git. Works on macOS and Linux.
```

## Thank You!

Your contributions help make ClaudeSmith Directory a valuable resource for the Claude Code community. We appreciate your effort in creating and sharing tools!


