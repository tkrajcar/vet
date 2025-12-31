import { describe, it, expect } from '@jest/globals';
import { generateDiffSnippet } from '../git/diff.js';
import type { Hunk, DiffLine } from '../git/types.js';

describe('generateDiffSnippet', () => {
  it('generates snippet with add/delete/context lines', () => {
    const hunk: Hunk = {
      startLine: 10,
      endLine: 14,
      header: '@@ -10,3 +10,4 @@',
      lines: [
        { type: 'context', lineNumber: 10, content: ' const a = 1;' },
        { type: 'delete', lineNumber: 11, content: '-const b = 2;' },
        { type: 'add', lineNumber: 11, content: '+const b = 3;' },
        { type: 'add', lineNumber: 12, content: '+const c = 4;' },
        { type: 'context', lineNumber: 13, content: ' return a + b;' },
      ],
    };

    const result = generateDiffSnippet(hunk);

    expect(result).toContain(' const a = 1;');
    expect(result).toContain('-const b = 2;');
    expect(result).toContain('+const b = 3;');
    expect(result).toContain('+const c = 4;');
    expect(result).toContain(' return a + b;');
  });

  it('handles all additions (new file)', () => {
    const hunk: Hunk = {
      startLine: 1,
      endLine: 3,
      header: '@@ -0,0 +1,3 @@',
      lines: [
        { type: 'add', lineNumber: 1, content: '+line 1' },
        { type: 'add', lineNumber: 2, content: '+line 2' },
        { type: 'add', lineNumber: 3, content: '+line 3' },
      ],
    };

    const result = generateDiffSnippet(hunk);
    const lines = result.split('\n');

    expect(lines).toHaveLength(3);
    expect(lines.every((l: string) => l.startsWith('+'))).toBe(true);
  });

  it('handles all deletions (deleted file)', () => {
    const hunk: Hunk = {
      startLine: 1,
      endLine: 2,
      header: '@@ -1,2 +0,0 @@',
      lines: [
        { type: 'delete', lineNumber: 1, content: '-old line 1' },
        { type: 'delete', lineNumber: 2, content: '-old line 2' },
      ],
    };

    const result = generateDiffSnippet(hunk);
    const lines = result.split('\n');

    expect(lines).toHaveLength(2);
    expect(lines.every((l: string) => l.startsWith('-'))).toBe(true);
  });

  it('handles empty hunk', () => {
    const hunk: Hunk = {
      startLine: 1,
      endLine: 1,
      header: '',
      lines: [],
    };

    const result = generateDiffSnippet(hunk);
    expect(result).toBe('');
  });
});
