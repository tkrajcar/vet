import React, { memo, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { FileDiff, Hunk, Comment } from '../git/types.js';
import { Header } from './components/Header.js';
import { DiffView } from './components/DiffView.js';
import { CommentInput } from './components/CommentInput.js';

interface HunkReviewProps {
  files: FileDiff[];
  fileIndex: number;
  hunkIndex: number;
  comments: Comment[];
  onHunkComment: (text: string) => void;
  onLineComment: (text: string, lineNumber: number) => void;
  onSkip: () => void;
  onBack: () => void;
  onNextFile: () => void;
  onPrevFile: () => void;
  onEscape: () => void;
}

export const HunkReview: React.FC<HunkReviewProps> = ({
  files,
  fileIndex,
  hunkIndex,
  comments,
  onHunkComment,
  onLineComment,
  onSkip,
  onBack,
  onNextFile,
  onPrevFile,
  onEscape,
}) => {
  const file = files[fileIndex];
  const hunk = file.hunks[hunkIndex];
  const totalFiles = files.length;
  const totalHunks = file.hunks.length;

  // Check if there's an existing hunk-level comment
  const existingHunkComment = comments.find(
    c => c.filePath === file.path && c.hunkIndex === hunkIndex && !c.lineNumber
  );

  // Get line-specific comments for this hunk
  const lineComments = comments.filter(
    c => c.filePath === file.path && c.hunkIndex === hunkIndex && c.lineNumber
  );

  // Track which line is being targeted for a comment
  const [targetedLine, setTargetedLine] = useState<number | null>(null);

  // Handle comment submission - line comments stay, hunk comments advance
  const handleSubmit = (text: string, lineNumber?: number) => {
    if (lineNumber) {
      onLineComment(text, lineNumber);
    } else {
      onHunkComment(text);
    }
  };

  useInput((input, key) => {
    // Use Ctrl modifiers to avoid conflict with typing comments
    if (key.ctrl && input === 'n') {
      onNextFile();
    } else if (key.ctrl && input === 'p') {
      onPrevFile();
    }
    // Other inputs handled by CommentInput
  });

  const subtitle = `file ${fileIndex + 1}/${totalFiles}`;

  // For deleted files, show a simple message instead of the diff
  const isDeleted = file.isDeleted;
  const headerTitle = isDeleted
    ? `${file.path} (deleted)`
    : `${file.path} [hunk ${hunkIndex + 1}/${totalHunks}]`;

  return (
    <Box flexDirection="column" padding={1}>
      <Header
        title={headerTitle}
        subtitle={subtitle}
      />

      <Box flexDirection="column" marginBottom={1}>
        {isDeleted ? (
          <Box flexDirection="column" paddingY={1}>
            <Text color="red">This file will be deleted.</Text>
            <Text color="gray">Add a comment if you have concerns about this deletion.</Text>
          </Box>
        ) : (
          <DiffView hunk={hunk} lineComments={lineComments} targetedLine={targetedLine} />
        )}
      </Box>

      <CommentInput
        onSubmit={handleSubmit}
        onSkip={onSkip}
        onBack={onBack}
        onEscape={onEscape}
        onLineTargetChange={setTargetedLine}
        existingComment={existingHunkComment?.text}
      />

      <Box marginTop={1}>
        <Text color="gray">
          ^N: next file | ^P: prev file | ESC: finish early
        </Text>
      </Box>
    </Box>
  );
};
