---
description: Interactive code review for changes made in auto-accept mode
allowed-tools: Bash, Read, Edit, Write, Glob, Grep
---

# Vet - Interactive Code Review

Launch the Vet interactive review interface to let the user review git diffs hunk-by-hunk and provide structured feedback.

Run this command and wait for it to complete:

```bash
vet-claude $ARGUMENTS
```

After the command completes, process the output based on what appears:

## If "=== VET REVIEW FEEDBACK ===" is shown:
The user has provided specific feedback on the code changes. You must:
1. Read each comment carefully - they reference specific files, hunks, and line numbers
2. Make the requested code changes to address each piece of feedback
3. After all changes are made, provide a brief summary of what you modified

## If "No feedback provided. All changes approved." is shown:
The user has reviewed all changes and approved them without comments. Acknowledge the approval and continue with the next task.

## If "ABORTED" is shown:
The user cancelled the review. Do not make any changes or take further action.
