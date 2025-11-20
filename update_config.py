import json
import os

file_path = "/Users/jasonlei/.gemini/antigravity/mcp_config.json"

new_content = {
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": [
        "shadcn@latest",
        "mcp"
      ]
    },
    "next-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "next-devtools-mcp@latest"
      ]
    },
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "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"
      }
    }
  }
}

with open(file_path, 'w') as f:
    json.dump(new_content, f, indent=2)

print("Successfully updated mcp_config.json")
