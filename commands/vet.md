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
