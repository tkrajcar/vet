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
