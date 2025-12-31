import { simpleGit } from 'simple-git';
import parseDiff from 'parse-diff';
import type { FileDiff, Hunk, DiffLine } from './types.js';

const git = simpleGit();

export interface DiffOptions {
  staged?: boolean;
  file?: string;
  context?: number;
}

export async function getChanges(options: DiffOptions = {}): Promise<FileDiff[]> {
  const { staged = false, file, context = 3 } = options;

  const args = [`-U${context}`];
  if (staged) {
    args.push('--cached');
  }
  if (file) {
    args.push('--', file);
  }

  const diffOutput = await git.diff(args);

  if (!diffOutput.trim()) {
    return [];
  }

  const parsed = parseDiff(diffOutput);

  return parsed.map((file): FileDiff => {
    const isNew = file.new === true;
    const isDeleted = file.deleted === true;
    const isBinary = file.chunks.length === 0 && !isNew && !isDeleted;

    const hunks: Hunk[] = file.chunks.map((chunk): Hunk => {
      const lines: DiffLine[] = chunk.changes.map((change): DiffLine => {
        let type: DiffLine['type'];
        if (change.type === 'add') {
          type = 'add';
        } else if (change.type === 'del') {
          type = 'delete';
        } else {
          type = 'context';
        }

        // Get line number based on change type
        let lineNumber: number;
        if (change.type === 'add') {
          lineNumber = change.ln;
        } else if (change.type === 'del') {
          lineNumber = change.ln;
        } else {
          // Normal/context line - use ln2 (new line number)
          lineNumber = change.ln2;
        }

        return {
          type,
          lineNumber,
          content: change.content,
        };
      });

      // Calculate line range from the chunk
      const addedLines = lines.filter(l => l.type !== 'delete');
      const startLine = chunk.newStart || chunk.oldStart || 1;
      const endLine = startLine + (chunk.newLines || chunk.oldLines || 1) - 1;

      return {
        startLine,
        endLine,
        lines,
        header: chunk.content || '',
      };
    });

    // For deleted files, use 'from' path (the original); for others use 'to'
    const path = isDeleted ? (file.from || 'unknown') : (file.to || file.from || 'unknown');

    return {
      path,
      hunks,
      isBinary,
      isNew,
      isDeleted,
    };
  });
}

export function generateDiffSnippet(hunk: Hunk): string {
  return hunk.lines
    .filter(line => line.type !== 'context' || true) // include context for now
    .map(line => {
      const prefix = line.type === 'add' ? '+' : line.type === 'delete' ? '-' : ' ';
      return `${prefix}${line.content.replace(/^[+-]/, '')}`;
    })
    .join('\n');
}
