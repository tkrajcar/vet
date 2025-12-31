# Claude Code Integration

> Technical documentation for how Vet integrates with Claude Code using tmux.

---

## The Challenge

Claude Code plugins cannot take over the terminal for interactive TUI applications. When Claude runs a shell command via `!command`, it captures stdout/stderr but doesn't provide PTY access for interactive input.

## The Solution: tmux

Vet uses tmux to work around this limitation:

1. **Split pane** - Create a new tmux pane for the TUI
2. **Wait mechanism** - Block the Claude command until Vet exits
3. **Stdout handoff** - Output feedback directly for Claude to read

---

## Integration Flow

```
User runs /vet in Claude Code
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│ vet.md command file executes                              │
│                                                          │
│  !`vet-claude $ARGUMENTS`                                │
│                                                          │
│  vet-claude (bash wrapper):                              │
│  ├─ Creates temp file for feedback                       │
│  ├─ Splits tmux pane (75% width)                        │
│  ├─ Runs vet TUI in new pane                            │
│  ├─ Blocks via `tmux wait-for`                          │
│  ├─ When vet exits:                                      │
│  │   ├─ Outputs feedback to stdout                       │
│  │   └─ Cleans up temp file                             │
│  └─ Returns to Claude                                    │
│                                                          │
│  Claude reads stdout, processes feedback                 │
└──────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Command File (`commands/vet.md`)

Registers the `/vet` slash command:

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

Key points:
- Uses `` !`command` `` syntax (with backticks) for inline execution
- Feedback comes via stdout, not a separate file
- Claude processes the output immediately after the command

### 2. tmux Wrapper (`bin/vet-claude`)

Bash script that orchestrates the tmux interaction:

```bash
#!/bin/bash
# Key operations:

# 1. Check tmux availability
if [ -z "$TMUX" ]; then
  echo "Error: Not running inside tmux."
  exit 1
fi

# 2. Create unique temp file
FEEDBACK_FILE=$(mktemp /tmp/vet-feedback-XXXXXX.md)

# 3. Build command with signal
CHANNEL="vet-$$-$RANDOM"
VET_CMD="cd '$WORK_DIR' && vet --output '$FEEDBACK_FILE'; tmux wait-for -S $CHANNEL"

# 4. Split pane and run
tmux split-window -h -p 75 "$VET_CMD"

# 5. Block until vet exits
tmux wait-for $CHANNEL

# 6. Output feedback to stdout
cat "$FEEDBACK_FILE"

# 7. Cleanup
rm -f "$FEEDBACK_FILE"
```

### 3. TUI (`bin/vet.js`)

The actual Ink-based TUI. The wrapper calls this with `--output` to write feedback to a temp file.

Without `--output`, feedback goes to stdout (useful for testing).

---

## Feedback Format

Vet outputs structured markdown that Claude can parse:

```markdown
=== VET REVIEW FEEDBACK ===
## Code Review Feedback

The following comments are from an interactive review...

### src/utils/parser.ts

**Lines 45-47:**
```diff
+    if (value !== null) {
...
```
This null check seems redundant.

---
Please address these comments.
=== END FEEDBACK ===
```

Or for no feedback:
```
No feedback provided. All changes approved.
```

Or for abort:
```
ABORTED
```

---

## Debugging

### View last feedback sent to Claude

```bash
cat /tmp/vet-last-feedback.md
```

### Test the wrapper directly

```bash
# In a tmux session
vet-claude

# Should split pane, run vet, output feedback when done
```

### Test the TUI directly

```bash
# Outputs feedback to stdout (no file written)
vet
```

---

## Limitations

| Limitation | Workaround |
|------------|------------|
| Requires tmux | Document as prerequisite |
| Can't run in non-tmux terminal | Provide helpful error message |
| Pane focus may not auto-switch | Click or use tmux prefix + arrow |

---

## Claude Code Extension Points Used

| Feature | Usage |
|---------|-------|
| Slash commands | `~/.claude/commands/vet.md` |
| Inline bash execution | `` !`vet-claude` `` syntax |
| stdout capture | Feedback passed directly |
| allowed-tools | Bash for command execution |
