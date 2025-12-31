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

- `bin/vet.js` - Entry point, loads dist/index.js
- `bin/vet-claude` - Bash wrapper for tmux orchestration
- `src/index.tsx` - CLI arg parsing with meow
- `src/cli/App.tsx` - Main component, screen routing, state management
- `src/cli/HunkReview.tsx` - Primary review interface
- `src/git/diff.ts` - Git operations using simple-git
- `src/output/formatter.ts` - Generates markdown feedback for Claude

## Claude Command Integration

Users install via `~/.claude/commands/vet.md` which runs `vet-claude $ARGUMENTS`. The wrapper outputs feedback in this format:
```
=== VET REVIEW FEEDBACK ===
## Code Review Feedback
...
=== END FEEDBACK ===
```

Or `No feedback provided. All changes approved.` or `ABORTED`.
