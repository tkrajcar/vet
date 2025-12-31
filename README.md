# Vet

Interactive code review for Claude Code. Review changes in a TUI, send feedback directly to Claude.

```
┌─────────────┬───────────────────────────────────────────────┐
│ Claude Code │ Vet                                           │
│             │ ┌─ src/parser.ts [hunk 2/4] ─── file 2/5 ───┐ │
│ /vet        │ │  42 │   function parse(input: string) {   │ │
│ (waiting)   │ │ +45 │     if (value !== null) {           │ │
│             │ │ +46 │       return process(value);        │ │
│             │ │                                           │ │
│             │ │ Comment: This null check seems redundant_ │ │
│             │ └───────────────────────────────────────────┘ │
└─────────────┴───────────────────────────────────────────────┘
```

## Why?

When using Claude Code in auto-accept mode, changes happen fast. Vet lets you review those changes and send structured feedback back to Claude - without leaving your terminal.

## Requirements

- **tmux** - Vet runs in a split pane
- **Node.js 18+**
- **Claude Code** - Running inside tmux

## Install

```bash
npm install -g vet-claude
```

Copy the command file to enable `/vet`:

```bash
mkdir -p ~/.claude/commands
cp node_modules/vet-claude/commands/vet.md ~/.claude/commands/
```

Or create `~/.claude/commands/vet.md` manually:

```markdown
---
description: Interactive code review for changes made in auto-accept mode
allowed-tools: Bash, Read, Edit, Write, Glob, Grep
---

!`vet-claude $ARGUMENTS`

Process the output:
- If "=== VET REVIEW FEEDBACK ===" is shown: address each comment with code changes, then summarize
- If "No feedback provided": acknowledge approval and continue
- If "ABORTED": do nothing
```

## Usage

1. Start Claude Code inside tmux:
   ```bash
   tmux new -s dev
   claude
   ```

2. After Claude makes changes, run:
   ```
   /vet
   ```

3. Review each hunk, add comments, submit feedback

4. Claude automatically addresses your comments

## Key Bindings

| Key | Action |
|-----|--------|
| `ENTER` | Skip hunk (no comment) / Submit comment |
| `↑` / `↓` | Navigate hunks |
| `Ctrl+N` / `Ctrl+P` | Jump to next/prev file |
| `ESC` | Finish review early |
| `:45` | Target comment to specific line |
| `q` | Quit |

## Options

```bash
/vet --staged           # Review staged changes
/vet --file "src/**"    # Filter by pattern
/vet --context 5        # More context lines
```

## How It Works

Vet uses tmux to display an interactive TUI alongside Claude:

1. `/vet` triggers the `vet-claude` wrapper
2. Wrapper splits a tmux pane (75% width)
3. You review changes in the TUI
4. Feedback is output to stdout
5. Claude reads and processes the feedback

See [CLAUDE_CODE_INTEGRATION.md](./CLAUDE_CODE_INTEGRATION.md) for technical details.

## Development

```bash
git clone https://github.com/yourorg/vet
cd vet
npm install
npm run build
npm link
```

## License

MIT
