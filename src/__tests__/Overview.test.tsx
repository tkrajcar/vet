import React from 'react';
import { render } from 'ink-testing-library';
import { jest, describe, it, expect } from '@jest/globals';
import { Overview } from '../cli/Overview.js';
import type { FileDiff } from '../git/types.js';

describe('Overview', () => {
  const mockFiles: FileDiff[] = [
    {
      path: 'src/index.ts',
      hunks: [
        { startLine: 1, endLine: 10, lines: [], header: '' },
        { startLine: 20, endLine: 25, lines: [], header: '' },
      ],
      isBinary: false,
      isNew: false,
      isDeleted: false,
    },
    {
      path: 'src/utils.ts',
      hunks: [{ startLine: 1, endLine: 5, lines: [], header: '' }],
      isBinary: false,
      isNew: true,
      isDeleted: false,
    },
    {
      path: 'src/old.ts',
      hunks: [{ startLine: 1, endLine: 5, lines: [], header: '' }],
      isBinary: false,
      isNew: false,
      isDeleted: true,
    },
  ];

  it('displays file count and hunk count', () => {
    const { lastFrame } = render(
      <Overview
        files={mockFiles}
        onStart={jest.fn()}
        onJumpToFile={jest.fn()}
        onQuit={jest.fn()}
      />
    );

    const output = lastFrame();
    expect(output).toContain('3');  // 3 files
    expect(output).toContain('file');
    expect(output).toContain('4');  // 4 total hunks
    expect(output).toContain('hunk');
  });

  it('displays file paths', () => {
    const { lastFrame } = render(
      <Overview
        files={mockFiles}
        onStart={jest.fn()}
        onJumpToFile={jest.fn()}
        onQuit={jest.fn()}
      />
    );

    const output = lastFrame();
    expect(output).toContain('src/index.ts');
    expect(output).toContain('src/utils.ts');
    expect(output).toContain('src/old.ts');
  });

  it('shows hunk count for regular files', () => {
    const { lastFrame } = render(
      <Overview
        files={mockFiles}
        onStart={jest.fn()}
        onJumpToFile={jest.fn()}
        onQuit={jest.fn()}
      />
    );

    const output = lastFrame();
    expect(output).toContain('(2 hunks)');  // src/index.ts
  });

  it('shows (new) indicator for new files', () => {
    const { lastFrame } = render(
      <Overview
        files={mockFiles}
        onStart={jest.fn()}
        onJumpToFile={jest.fn()}
        onQuit={jest.fn()}
      />
    );

    const output = lastFrame();
    expect(output).toContain('(new)');
  });

  it('shows (deleted) indicator for deleted files', () => {
    const { lastFrame } = render(
      <Overview
        files={mockFiles}
        onStart={jest.fn()}
        onJumpToFile={jest.fn()}
        onQuit={jest.fn()}
      />
    );

    const output = lastFrame();
    expect(output).toContain('(deleted)');
  });

  it('displays key bindings', () => {
    const { lastFrame } = render(
      <Overview
        files={mockFiles}
        onStart={jest.fn()}
        onJumpToFile={jest.fn()}
        onQuit={jest.fn()}
      />
    );

    const output = lastFrame();
    expect(output).toContain('ENTER');
    expect(output).toContain('Start sequential review');
    expect(output).toContain('Quit without review');
  });

  // Note: Input simulation with ink-testing-library is unreliable in this
  // test environment. The useInput hook requires raw mode which isn't
  // available in tests. Input handling is verified through manual testing.
});
