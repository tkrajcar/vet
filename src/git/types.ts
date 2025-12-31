export interface DiffLine {
  type: 'add' | 'delete' | 'context';
  lineNumber: number;
  content: string;
}

export interface Hunk {
  startLine: number;
  endLine: number;
  lines: DiffLine[];
  header: string;
}

export interface FileDiff {
  path: string;
  hunks: Hunk[];
  isBinary: boolean;
  isNew: boolean;
  isDeleted: boolean;
}

export interface Comment {
  filePath: string;
  hunkIndex: number;
  lineNumber?: number;
  text: string;
  diffSnippet: string;
  startLine: number;
  endLine: number;
  isDeletedFile?: boolean;
}

export interface ReviewState {
  files: FileDiff[];
  currentFileIndex: number;
  currentHunkIndex: number;
  comments: Comment[];
}
