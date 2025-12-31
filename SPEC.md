# Vet: Interactive Code Review for Claude Code

## Overview

**Vet** is an interactive terminal-based code review tool designed for developers using Claude Code in auto-accept mode. It bridges the gap between speed and quality control by providing a structured review workflow where feedback flows directly back to Claude for immediate action.

## Problem Statement

When using Claude Code in auto-accept mode for speed, developers lose the opportunity to review individual changes as they're made. Current workflows require manual IDE-based review of git diffs and separate feedback sessions. Vet streamlines this into a single, integrated workflow.

## Core Workflow

1. Developer uses Claude Code in auto-accept mode for speed
2. Claude Code makes changes to multiple files
3. Developer runs `/vet` command
4. A tmux pane splits open with the Vet TUI (75% width)
5. Developer reviews changed files, stepping through hunks
6. Developer adds comments at the hunk level or targets specific lines
7. After review, developer sees a summary before submitting
8. Vet outputs feedback directly to stdout
9. Claude reads the feedback and addresses each comment

---

## Requirements

- **tmux** - Required for the split-pane TUI experience
- **Node.js 18+** - Runtime for the TUI
- **Claude Code** - Running inside a tmux session

---

## Installation

### Step 1: Install the TUI

```bash
npm install -g vet-claude
```

### Step 2: Add the Claude Command

Create the file `~/.claude/commands/vet.md`:

```markdown
---
description: Interactive code review for changes made in auto-accept mode
allowed-tools: Bash, Read, Edit, Write, Glob, Grep
---

Run this command immediately and wait for it to complete:

!`vet-claude $ARGUMENTS`

After the command completes, process the output:
- If "=== VET REVIEW FEEDBACK ===" is shown: address each comment with code changes, then summarize
- If "No feedback provided": acknowledge approval and continue
- If "ABORTED": do nothing
```

### Step 3: Run Claude Code in tmux

```bash
# Start a tmux session
tmux new -s dev

# Run Claude Code inside tmux
claude

# Now /vet will work with split-pane review
```

---

## User Interface

### Screen 1: Overview

Shown immediately when `/vet` is invoked:

```
┌─ Vet ─────────────────────────────────────────────┐
│ 5 files changed, 12 hunks total                   │
│                                                   │
│  1. src/index.ts              (3 hunks)          │
│  2. src/utils/parser.ts       (4 hunks)          │
│  3. src/components/Button.tsx (2 hunks)          │
│  4. package.json              (1 hunk)           │
│  5. README.md                 (2 hunks)          │
│                                                   │
│ ENTER: Start sequential review                    │
│ 1-5:   Jump to specific file                      │
│ q:     Quit without review                        │
└───────────────────────────────────────────────────┘
```

### Screen 2: Hunk Review

The primary review interface. Header shows current position:

```
┌─ src/utils/parser.ts [hunk 2/4] ─── file 2/5 ────┐
│                                                   │
│  42 │   function parse(input: string) {          │
│  43 │     const result = [];                     │
│  44 │                                            │
│ +45 │     if (value !== null) {                  │
│ +46 │       return process(value);               │
│ +47 │     }                                      │
│  48 │                                            │
│  49 │     return defaultValue;                   │
│  50 │   }                                        │
│                                                   │
├───────────────────────────────────────────────────┤
│ Comment (ENTER skip, :line for specific line):   │
│ > _                                              │
└───────────────────────────────────────────────────┘
```

### Screen 3: Summary

Shown after all hunks reviewed (or on early exit with comments):

```
┌─ Review Summary ──────────────────────────────────┐
│                                                   │
│ 3 comments across 2 files                         │
│                                                   │
│ src/utils/parser.ts:                             │
│   • [hunk 2] "This null check seems redundant"   │
│   • [line 67] "Use a more descriptive name"      │
│                                                   │
│ src/components/Button.tsx:                        │
│   • [hunk 1] "Should this use useCallback?"      │
│                                                   │
├───────────────────────────────────────────────────┤
│ ENTER: Send feedback to Claude                    │
│ e:     Edit a comment                             │
│ d:     Delete a comment                           │
│ q:     Discard all and exit                       │
└───────────────────────────────────────────────────┘
```

### Screen 4: No Feedback Confirmation

Shown if user completes review with no comments:

```
┌─ Review Complete ─────────────────────────────────┐
│                                                   │
│ No feedback to send. All changes approved.        │
│                                                   │
│ Press any key to exit.                            │
└───────────────────────────────────────────────────┘
```

---

## Key Bindings

### Overview Screen
| Key | Action |
|-----|--------|
| `ENTER` | Start sequential review from first file |
| `1-9` | Jump directly to file N |
| `q` | Quit without reviewing |

### Hunk Review Screen
| Key | Action |
|-----|--------|
| `ENTER` or `↓` | No comment, advance to next hunk |
| `↑` | Go back to previous hunk (allows editing previous comments) |
| `Ctrl+N` | Jump to next file |
| `Ctrl+P` | Jump to previous file |
| `ESC` | Exit review early (goes to Summary if comments exist, else confirms exit) |
| `:N` | Target comment to specific line N (e.g., `:45`) |
| Any text + `ENTER` | Save as comment for current hunk, advance |

### Summary Screen
| Key | Action |
|-----|--------|
| `ENTER` | Save feedback and exit (Claude will process) |
| `e` | Edit a comment (prompts for which one) |
| `d` | Delete a comment (prompts for which one) |
| `q` | Discard all comments and exit |

---

## Command-Line Options

```bash
vet [options]
```

| Option | Description |
|--------|-------------|
| `--staged` | Review staged changes instead of unstaged |
| `--file <pattern>` | Limit review to files matching glob pattern |
| `--context <n>` | Lines of context around changes (default: 3) |
| `--output <path>` | Write feedback to file instead of stdout |

---

## Technical Architecture

### Tech Stack
- **Runtime:** Node.js / TypeScript
- **TUI Framework:** Ink (React for CLIs)
- **Git Integration:** simple-git
- **Diff Parsing:** parse-diff
- **Terminal Multiplexing:** tmux (for Claude Code integration)

### How tmux Integration Works

Claude Code cannot give plugins direct terminal control. Vet works around this using tmux:

```
┌─────────────────────────────────────────────────────────────┐
│ tmux session                                                │
│ ┌─────────────┬───────────────────────────────────────────┐ │
│ │ Claude Code │ Vet TUI (75% width)                       │ │
│ │             │                                           │ │
│ │ /vet        │ ┌─ src/parser.ts [hunk 1/3] ────────────┐ │ │
│ │ (waiting)   │ │ ...                                   │ │ │
│ │             │ └───────────────────────────────────────┘ │ │
│ └─────────────┴───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

1. `/vet` command triggers `vet-claude` wrapper
2. Wrapper creates a tmux split pane (75% width)
3. Vet TUI runs in the new pane with full terminal control
4. `tmux wait-for` blocks until Vet exits
5. Feedback is output to stdout for Claude to read
6. Pane closes, Claude continues

### Project Structure
```
vet/
├── package.json
├── tsconfig.json
├── bin/
│   ├── vet.js              # TUI entry point
│   └── vet-claude          # tmux wrapper for Claude integration
├── src/
│   ├── index.tsx           # Main entry, arg parsing
│   ├── cli/
│   │   ├── App.tsx         # Ink root component, screen router
│   │   ├── Overview.tsx    # File list screen
│   │   ├── HunkReview.tsx  # Individual hunk review screen
│   │   ├── Summary.tsx     # Pre-submit summary screen
│   │   └── components/
│   │       ├── DiffView.tsx     # Renders diff with line numbers
│   │       ├── CommentInput.tsx # Text input with :line detection
│   │       └── Header.tsx       # Progress indicator header
│   ├── git/
│   │   ├── diff.ts         # Git diff operations
│   │   └── types.ts        # Diff, Hunk, FileDiff types
│   └── output/
│       └── formatter.ts    # Generates feedback markdown
├── commands/
│   └── vet.md              # Claude command file (for users to copy)
└── README.md
```

### Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   git diff   │────▶│  Parse into  │────▶│   Ink TUI    │
│    output    │     │  FileDiff[]  │     │   renders    │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                                                  ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Claude    │◀────│   stdout     │◀────│  User adds   │
│   processes  │     │   output     │     │   comments   │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| No unstaged changes | Display message: "No changes to review" and exit |
| Not running in tmux | Display error with instructions to run Claude in tmux |
| User quits from overview | Exit immediately, no feedback |
| User escapes with no comments | Confirm exit, no feedback |
| User escapes with comments | Go to Summary screen with option to save or discard |
| User discards from Summary | Output `ABORTED` |
| Deleted files | Show deletion notice, allow comment |

---

## Future Enhancements

- Syntax highlighting in diff view
- Fuzzy file search from overview
- Saved review sessions (pause and resume later)
- Integration with specific test failures
- Custom comment templates/shortcuts
- Support for reviewing specific commits (not just working tree)
- `--watch` mode to auto-launch after Claude makes changes
