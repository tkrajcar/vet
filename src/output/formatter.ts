import type { Comment } from '../git/types.js';

export function formatFeedback(comments: Comment[]): string {
  if (comments.length === 0) {
    return '';
  }

  const lines: string[] = [
    '## Code Review Feedback',
    '',
    'The following comments are from an interactive review of your recent changes. Please address each one:',
    '',
  ];

  // Group comments by file
  const byFile = new Map<string, Comment[]>();
  for (const comment of comments) {
    const existing = byFile.get(comment.filePath) || [];
    existing.push(comment);
    byFile.set(comment.filePath, existing);
  }

  for (const [filePath, fileComments] of byFile) {
    lines.push(`### ${filePath}`);
    lines.push('');

    for (const comment of fileComments) {
      if (comment.isDeletedFile) {
        lines.push('**Regarding file deletion:**');
      } else if (comment.lineNumber) {
        lines.push(`**Line ${comment.lineNumber} specifically:**`);
      } else {
        lines.push(`**Lines ${comment.startLine}-${comment.endLine}:**`);
      }

      // Add diff snippet in code block (skip for deleted files)
      if (comment.diffSnippet) {
        lines.push('```diff');
        lines.push(comment.diffSnippet);
        lines.push('```');
      }

      lines.push(comment.text);
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('Please address these comments and let me know when you\'ve made the changes.');

  return lines.join('\n');
}

export function formatAborted(): string {
  return 'ABORTED';
}
