# Claude Code Integration Reference

> This document summarizes Claude Code's extension capabilities as of late 2025, for reference in future development sessions.

---

## How Vet Integrates with Claude Code

Vet uses a **hybrid distribution model**:

1. **npm package** (`@yourorg/vet`) - The interactive TUI
2. **Command file** (`~/.claude/commands/vet.md`) - Registers `/vet` and handles post-TUI processing

This approach gives us a clean `/vet` command (no namespace prefix) while keeping the TUI as a standalone, testable npm package.

### Integration Flow

```
User runs /vet
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Claude executes vet.md command                      │
│                                                     │
│  1. Runs: !vet $ARGUMENTS                          │
│     └─► TUI launches, takes over terminal          │
│         User reviews changes, adds comments         │
│         TUI writes .claude/review-feedback.md      │
│         TUI exits                                   │
│                                                     │
│  2. Claude continues with command instructions     │
│     └─► Reads .claude/review-feedback.md           │
│         Addresses each comment                      │
│         Deletes feedback file when done             │
└─────────────────────────────────────────────────────┘
```

### The Command File

Located at `~/.claude/commands/vet.md`:

```markdown
---
description: Interactive code review for changes made in auto-accept mode
allowed-tools: Bash, Read, Edit, Write, Glob, Grep
---

# Vet - Interactive Code Review

Launch the interactive review tool and process any feedback.

## Step 1: Launch Review TUI

!vet $ARGUMENTS

## Step 2: Process Feedback

Check if `.claude/review-feedback.md` exists.

If it exists and contains feedback:
1. Read the feedback file carefully
2. Address each comment by making the requested code changes
3. After addressing ALL comments, delete the feedback file
4. Provide a brief summary of what was changed

If the file doesn't exist or is empty:
- The user approved all changes (no comments were made)
- Acknowledge this and continue

If the file contains only "ABORTED":
- The user cancelled the review
- Delete the file and do not make any changes
```

---

## Claude Code Extension Capabilities

### What Plugins/Commands CAN Do

| Capability | How |
|------------|-----|
| Custom slash commands | `~/.claude/commands/*.md` for personal, `./.claude/commands/*.md` for project |
| Run shell commands | `!command` syntax in command files |
| Reference files | `@filepath` syntax in command files |
| Specify allowed tools | `allowed-tools` frontmatter |
| Accept arguments | `$ARGUMENTS`, `$1`, `$2` etc. |
| Event hooks | `hooks.json` for PreToolUse, PostToolUse, UserPromptSubmit |
| MCP servers | Custom tools via Model Context Protocol |
| Skills | Auto-invoked capabilities based on context |

### What Plugins/Commands CANNOT Do

| Capability | Status |
|------------|--------|
| Take over terminal with TUI | Not supported (workaround: launch external process) |
| Inject messages into conversation | Not supported (workaround: file-based handoff) |
| Control Claude's responses programmatically | Not supported |
| Interactive stdin during command | Not supported |

### Command File Frontmatter Options

```yaml
---
description: Short description shown in /help
allowed-tools: Bash, Read, Edit, Write, Glob, Grep  # Tools Claude can use
argument-hint: <options>  # Shown in autocomplete
model: opus  # Optional: force specific model
disable-model-invocation: false  # If true, just executes, no Claude response
---
```

### Command Syntax

| Syntax | Meaning |
|--------|---------|
| `!command` | Run shell command |
| `@filepath` | Include file contents |
| `$ARGUMENTS` | All arguments passed to command |
| `$1`, `$2`, etc. | Positional arguments |

---

## Plugin System (For Reference)

If distributing via plugin marketplace (not used by Vet, but documented here):

### Plugin Structure

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json         # Required manifest
├── commands/               # Slash commands (namespaced)
├── agents/                 # Subagents
├── skills/                 # Auto-invoked skills
├── hooks/                  # Event handlers
└── .mcp.json              # MCP server config
```

### Plugin Manifest

```json
{
  "name": "plugin-name",
  "version": "1.0.0",
  "description": "Brief description"
}
```

### Plugin Commands Are Namespaced

Plugin commands use format `/plugin-name:command-name`, which is why Vet uses direct command file distribution instead.

---

## Key Documentation Links

- Slash Commands: https://code.claude.com/docs/en/slash-commands.md
- Hooks: https://code.claude.com/docs/en/hooks-guide.md
- Plugins: https://code.claude.com/docs/en/plugins.md
- Plugins Reference: https://code.claude.com/docs/en/plugins-reference.md
- Skills: https://code.claude.com/docs/en/skills.md
- MCP: https://code.claude.com/docs/en/mcp.md
