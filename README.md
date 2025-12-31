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
git clone https://github.com/tkrajcar/vet
cd vet
npm install
npm run build
npm link
```

Then run Claude Code with the plugin:

```bash
claude --plugin-dir /path/to/vet
```

## Usage

1. Start Claude Code inside tmux:
   ```bash
   tmux new -s dev
   claude
   ```

2. After Claude makes changes, run:
   ```
   /vet:start
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
/vet:start --staged           # Review staged changes
/vet:start --file "src/**"    # Filter by pattern
/vet:start --context 5        # More context lines
```

## How It Works

Vet uses tmux to display an interactive TUI alongside Claude:

1. `/vet:start` triggers the `vet-claude` wrapper
2. Wrapper splits a tmux pane (75% width)
3. You review changes in the TUI
4. Feedback is output to stdout
5. Claude reads and processes the feedback

See [SPEC.md](./SPEC.md) for technical details.

## Development

```bash
npm run dev                 # Watch mode for TypeScript changes
```

After making changes to skills, restart Claude Code to pick them up.

## License

MIT
