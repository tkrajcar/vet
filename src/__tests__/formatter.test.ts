import { describe, it, expect } from '@jest/globals';
import { formatFeedback, formatAborted } from '../output/formatter.js';
import type { Comment } from '../git/types.js';

describe('formatFeedback', () => {
  it('returns empty string for no comments', () => {
    expect(formatFeedback([])).toBe('');
  });

  it('formats a single hunk comment', () => {
    const comments: Comment[] = [
      {
        filePath: 'src/index.ts',
        hunkIndex: 0,
        text: 'This looks wrong',
        diffSnippet: '+const x = 1;',
        startLine: 10,
        endLine: 12,
      },
    ];

    const result = formatFeedback(comments);

    expect(result).toContain('## Code Review Feedback');
    expect(result).toContain('### src/index.ts');
    expect(result).toContain('**Lines 10-12:**');
    expect(result).toContain('This looks wrong');
  });

  it('formats a line-specific comment', () => {
    const comments: Comment[] = [
      {
        filePath: 'src/index.ts',
        hunkIndex: 0,
        lineNumber: 15,
        text: 'Rename this variable',
        diffSnippet: '+const x = 1;',
        startLine: 10,
        endLine: 12,
      },
    ];

    const result = formatFeedback(comments);

    expect(result).toContain('**Line 15 specifically:**');
    expect(result).toContain('Rename this variable');
  });

  it('formats a deleted file comment', () => {
    const comments: Comment[] = [
      {
        filePath: 'src/old.ts',
        hunkIndex: 0,
        text: 'Why are we deleting this?',
        diffSnippet: '',
        startLine: 1,
        endLine: 1,
        isDeletedFile: true,
      },
    ];

    const result = formatFeedback(comments);

    expect(result).toContain('### src/old.ts');
    expect(result).toContain('**Regarding file deletion:**');
    expect(result).toContain('Why are we deleting this?');
    expect(result).not.toContain('```diff');
  });

  it('groups comments by file', () => {
    const comments: Comment[] = [
      {
        filePath: 'src/a.ts',
        hunkIndex: 0,
        text: 'Comment on A',
        diffSnippet: '+a',
        startLine: 1,
        endLine: 1,
      },
      {
        filePath: 'src/b.ts',
        hunkIndex: 0,
        text: 'Comment on B',
        diffSnippet: '+b',
        startLine: 1,
        endLine: 1,
      },
      {
        filePath: 'src/a.ts',
        hunkIndex: 1,
        text: 'Another comment on A',
        diffSnippet: '+a2',
        startLine: 10,
        endLine: 10,
      },
    ];

    const result = formatFeedback(comments);

    // Check that files are grouped
    const aIndex = result.indexOf('### src/a.ts');
    const bIndex = result.indexOf('### src/b.ts');
    const commentOnA = result.indexOf('Comment on A');
    const anotherOnA = result.indexOf('Another comment on A');
    const commentOnB = result.indexOf('Comment on B');

    // Both A comments should appear before B section
    expect(commentOnA).toBeGreaterThan(aIndex);
    expect(anotherOnA).toBeGreaterThan(aIndex);
    expect(commentOnB).toBeGreaterThan(bIndex);
  });

  it('includes closing prompt', () => {
    const comments: Comment[] = [
      {
        filePath: 'src/index.ts',
        hunkIndex: 0,
        text: 'Fix this',
        diffSnippet: '+x',
        startLine: 1,
        endLine: 1,
      },
    ];

    const result = formatFeedback(comments);

    expect(result).toContain('Please address these comments');
  });
});

describe('formatAborted', () => {
  it('returns ABORTED', () => {
    expect(formatAborted()).toBe('ABORTED');
  });
});
