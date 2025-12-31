# Vet: Interactive Code Review for Claude Code

## Overview

**Vet** is an interactive terminal-based code review tool designed for developers using Claude Code in auto-accept mode. It bridges the gap between speed and quality control by providing a structured review workflow where feedback flows directly back to Claude for immediate action.

## Problem Statement

When using Claude Code in auto-accept mode for speed, developers lose the opportunity to review individual changes as they're made. Current workflows require manual IDE-based review of git diffs and separate feedback sessions. Vet streamlines this into a single, integrated workflow.

## Core Workflow

1. Developer uses Claude Code in auto-accept mode for speed
2. Claude Code makes changes to multiple files
3. Developer runs `/vet` command
4. Vet TUI launches in the same terminal
5. Developer sees an overview of all changed files, then steps through hunks
6. Developer adds comments at the hunk level or targets specific lines
7. After review, developer sees a summary before submitting
8. Vet writes feedback to `.claude/review-feedback.md` and exits
9. Claude automatically reads the feedback and addresses each comment

---

## Installation

### Step 1: Install the TUI

```bash
npm install -g @yourorg/vet
```

### Step 2: Add the Claude Command

Create the file `~/.claude/commands/vet.md`:

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

### Step 3: Verify Installation

```bash
# Test the TUI directly
vet --help

# Test the Claude command
# (in a Claude Code session)
/vet
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
| `--output <path>` | Custom output path (default: `.claude/review-feedback.md`) |

---

## Feedback File Format

Vet writes feedback to `.claude/review-feedback.md`:

```markdown
## Code Review Feedback

The following comments are from an interactive review of your recent changes. Please address each one:

### src/utils/parser.ts

**Lines 45-47:**
```diff
+    if (value !== null) {
+      return process(value);
+    }
```
This null check seems redundant given the TypeScript types above.

**Line 67 specifically:**
Consider a more descriptive variable name than `x`.

### src/components/Button.tsx

**Lines 12-20:**
```diff
+  const handleClick = () => {
+    onClick?.(event);
+  };
```
Should this handler be wrapped in useCallback?

---
Please address these comments and let me know when you've made the changes.
```

### Format Rules
- Comments grouped by file
- Each comment includes the diff snippet for context
- Hunk-level comments show line range: "Lines X-Y"
- Line-specific comments (from `:N` syntax) show: "Line X specifically"
- Closing prompt directs Claude to take action

### Exit Conditions

| Condition | File Written | Contents |
|-----------|--------------|----------|
| User submits feedback | Yes | Formatted markdown |
| User completes with no comments | No | (no file created) |
| User aborts (`q` from summary) | Yes | `ABORTED` |
| User quits early (`q` from overview) | No | (no file created) |

---

## Technical Architecture

### Tech Stack
- **Runtime:** Node.js / TypeScript
- **TUI Framework:** Ink (React for CLIs)
- **Git Integration:** simple-git
- **Diff Parsing:** parse-diff (if simple-git's parsing is insufficient)

### Project Structure
```
vet/
├── package.json
├── tsconfig.json
├── bin/
│   └── vet.js                   # CLI entry point
├── src/
│   ├── index.ts                 # Main entry, arg parsing
│   ├── cli/
│   │   ├── App.tsx              # Ink root component, screen router
│   │   ├── Overview.tsx         # File list screen
│   │   ├── HunkReview.tsx       # Individual hunk review screen
│   │   ├── Summary.tsx          # Pre-submit summary screen
│   │   └── components/
│   │       ├── DiffView.tsx     # Renders diff with line numbers
│   │       ├── CommentInput.tsx # Text input with :line detection
│   │       └── Header.tsx       # Progress indicator header
│   ├── git/
│   │   ├── diff.ts              # Git diff operations
│   │   ├── parser.ts            # Diff output parsing
│   │   └── types.ts             # Diff, Hunk, FileDiff types
│   ├── state/
│   │   └── reviewState.ts       # Tracks comments, current position
│   └── output/
│       └── formatter.ts         # Generates feedback markdown
├── commands/
│   └── vet.md                   # Claude command file (for users to copy)
└── README.md
```

### Git Diff Handling

**MVP Scope:**
| Change Type | Handling |
|-------------|----------|
| Modified files | Standard hunk review |
| New files | Show as single all-additions hunk |
| Deleted files | Show as single all-deletions hunk with acknowledgment prompt |
| Binary files | Detect and display "binary file changed" (no hunk review) |

**Post-MVP:**
- Renamed/moved files
- Permission changes
- Submodule changes

### Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   git diff   │────▶│  Parse into  │────▶│   Ink TUI    │
│    output    │     │  FileDiff[]  │     │   renders    │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                                                  ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Claude    │◀────│  Write to    │◀────│  User adds   │
│  reads file  │     │  .claude/    │     │   comments   │
└──────────────┘     └──────────────┘     └──────────────┘
```

### State Management

```typescript
interface ReviewState {
  files: FileDiff[];
  currentFileIndex: number;
  currentHunkIndex: number;
  comments: Comment[];
}

interface Comment {
  filePath: string;
  hunkIndex: number;
  lineNumber?: number;  // If specified via :N syntax
  text: string;
  diffSnippet: string;  // For inclusion in feedback
}

interface FileDiff {
  path: string;
  hunks: Hunk[];
  isBinary: boolean;
  isNew: boolean;
  isDeleted: boolean;
}

interface Hunk {
  startLine: number;
  endLine: number;
  lines: DiffLine[];
}

interface DiffLine {
  type: 'add' | 'remove' | 'context';
  lineNumber: number;
  content: string;
}
```

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| No unstaged changes | Display message: "No changes to review" and exit |
| All files are binary | Display message: "All changed files are binary" and exit |
| User quits from overview | Exit immediately, no file written |
| User escapes with no comments | Confirm exit, no file written |
| User escapes with comments | Go to Summary screen with option to save or discard |
| User discards from Summary | Write `ABORTED` to feedback file |
| Very long lines in diff | Truncate with ellipsis, or horizontal scroll (TBD) |
| Hunk larger than terminal | Vertical scroll within hunk view |

---

## Future Enhancements

- Syntax highlighting in diff view
- Fuzzy file search from overview
- Saved review sessions (pause and resume later)
- Integration with specific test failures
- Custom comment templates/shortcuts
- Support for reviewing specific commits (not just working tree)
- `--watch` mode to auto-launch after Claude makes changes
