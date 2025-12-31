# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Vet?

Vet is an interactive terminal-based code review tool for Claude Code auto-accept mode. It displays a TUI in a tmux split pane where users review git diffs hunk-by-hunk, add comments, and send structured feedback back to Claude.

## Build & Development Commands

```bash
npm run build      # Compile TypeScript to dist/
npm run dev        # Watch mode compilation
npm run typecheck  # Type check without emitting
npm test           # Run Jest tests (uses --experimental-vm-modules)
npm run lint       # ESLint on src/
```

Run a single test:
```bash
npm test -- --testPathPattern="diff.test"
```

**Important:** Run `npm test && npm run typecheck` after every change to catch regressions.

## Local Development

```bash
npm link                    # Makes npx @tkrajcar/vet use local build
npm run dev                 # Watch mode in terminal 1
claude --plugin-dir .       # Test plugin in terminal 2
```

The `--plugin-dir .` flag loads the plugin from the current directory, picking up changes to skills on restart.

## Architecture

**Tech Stack:** TypeScript, Ink (React for CLIs), simple-git, parse-diff

**tmux Integration:** Claude Code cannot provide PTY access for interactive TUIs. Vet works around this:
1. `vet-claude` wrapper (bin/vet-claude) splits a tmux pane
2. TUI runs in the new pane with full terminal control
3. `tmux wait-for` blocks until Vet exits
4. Feedback outputs to stdout for Claude to read

**Data Flow:**
```
git diff → parse-diff → FileDiff[] → Ink TUI → User comments → Markdown feedback → stdout → Claude
```

**Screen Flow in App.tsx:**
- `loading` → `overview` (file list) → `review` (hunk-by-hunk) → `summary` (edit/submit) or `no-feedback`

**Key Types (src/git/types.ts):**
- `FileDiff`: Represents a changed file with hunks
- `Hunk`: A contiguous block of changes with line info
- `Comment`: User feedback tied to a file/hunk/line

## Project Structure

```
vet/
├── .claude-plugin/
│   └── plugin.json         # Claude Code plugin manifest
├── commands/
│   └── start.md            # /vet:start command definition
├── bin/
│   ├── vet.js              # Entry point, loads dist/index.js
│   └── vet-claude          # Bash wrapper for tmux orchestration
├── src/
│   ├── index.tsx           # CLI arg parsing with meow
│   ├── cli/
│   │   ├── App.tsx         # Main component, screen routing, state management
│   │   └── HunkReview.tsx  # Primary review interface
│   ├── git/
│   │   └── diff.ts         # Git operations using simple-git
│   └── output/
│       └── formatter.ts    # Generates markdown feedback for Claude
└── package.json            # @tkrajcar/vet
```

## Plugin Distribution (Future)

Vet is structured as a Claude Code plugin. The plugin:
- Bundles the command in `commands/start.md`
- Invokes the tool via `vet-claude`
- Accessible as `/vet:start`

Plugin marketplace distribution is planned for the future.

## Output Format

The wrapper outputs feedback in this format:
```
=== VET REVIEW FEEDBACK ===
## Code Review Feedback
...
=== END FEEDBACK ===
```

Or `No feedback provided. All changes approved.` or `ABORTED`.
