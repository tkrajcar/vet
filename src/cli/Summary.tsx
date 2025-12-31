import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { Comment } from '../git/types.js';
import { Header } from './components/Header.js';

interface SummaryProps {
  comments: Comment[];
  onSubmit: () => void;
  onDiscard: () => void;
  onEditComment: (index: number, newText: string) => void;
  onDeleteComment: (index: number) => void;
}

type Mode = 'view' | 'edit-select' | 'edit-input' | 'delete-select';

export const Summary: React.FC<SummaryProps> = ({
  comments,
  onSubmit,
  onDiscard,
  onEditComment,
  onDeleteComment,
}) => {
  const [mode, setMode] = useState<Mode>('view');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editInput, setEditInput] = useState('');

  // Group comments by file for display
  const byFile = new Map<string, { comment: Comment; globalIndex: number }[]>();
  comments.forEach((comment, globalIndex) => {
    const existing = byFile.get(comment.filePath) || [];
    existing.push({ comment, globalIndex });
    byFile.set(comment.filePath, existing);
  });

  useInput((input, key) => {
    if (mode === 'view') {
      if (key.return) {
        onSubmit();
      } else if (input === 'e' && comments.length > 0) {
        setMode('edit-select');
        setSelectedIndex(0);
      } else if (input === 'd' && comments.length > 0) {
        setMode('delete-select');
        setSelectedIndex(0);
      } else if (input === 'q') {
        onDiscard();
      }
    } else if (mode === 'edit-select' || mode === 'delete-select') {
      if (key.escape) {
        setMode('view');
      } else if (key.upArrow) {
        setSelectedIndex(i => Math.max(0, i - 1));
      } else if (key.downArrow) {
        setSelectedIndex(i => Math.min(comments.length - 1, i + 1));
      } else if (key.return) {
        if (mode === 'edit-select') {
          setEditInput(comments[selectedIndex].text);
          setMode('edit-input');
        } else {
          onDeleteComment(selectedIndex);
          setMode('view');
        }
      }
    } else if (mode === 'edit-input') {
      if (key.escape) {
        setMode('view');
      } else if (key.return) {
        onEditComment(selectedIndex, editInput);
        setMode('view');
      } else if (key.backspace || key.delete) {
        setEditInput(prev => prev.slice(0, -1));
      } else if (input && !key.ctrl && !key.meta) {
        setEditInput(prev => prev + input);
      }
    }
  });

  const fileCount = byFile.size;
  const commentCount = comments.length;

  return (
    <Box flexDirection="column" padding={1}>
      <Header title="Review Summary" />

      <Text>
        <Text bold>{commentCount}</Text>
        <Text> comment{commentCount !== 1 ? 's' : ''} across </Text>
        <Text bold>{fileCount}</Text>
        <Text> file{fileCount !== 1 ? 's' : ''}</Text>
      </Text>

      <Box flexDirection="column" marginY={1}>
        {Array.from(byFile.entries()).map(([filePath, fileComments]) => (
          <Box key={filePath} flexDirection="column" marginBottom={1}>
            <Text color="cyan">{filePath}:</Text>
            {fileComments.map(({ comment, globalIndex }) => {
              const isSelected = (mode === 'edit-select' || mode === 'delete-select') && selectedIndex === globalIndex;
              const locationText = comment.isDeletedFile
                ? 'deletion'
                : comment.lineNumber
                  ? `line ${comment.lineNumber}`
                  : `hunk ${comment.hunkIndex + 1}`;

              return (
                <Text key={globalIndex} wrap="wrap">
                  <Text color={isSelected ? 'yellow' : undefined}>
                    {isSelected ? '> ' : '  '}
                  </Text>
                  <Text color="gray">[{locationText}]</Text>
                  <Text> "{comment.text}"</Text>
                </Text>
              );
            })}
          </Box>
        ))}
      </Box>

      {mode === 'edit-input' && (
        <Box flexDirection="column" borderStyle="single" borderColor="yellow" paddingX={1} marginBottom={1}>
          <Text color="yellow">Edit comment:</Text>
          <Text>
            <Text color="cyan">&gt; </Text>
            <Text>{editInput}</Text>
            <Text color="gray">▌</Text>
          </Text>
        </Box>
      )}

      {mode === 'view' && (
        <Box flexDirection="column" borderStyle="single" borderColor="gray" paddingX={1}>
          <Text><Text color="green">ENTER</Text>: Send feedback to Claude</Text>
          <Text><Text color="green">e</Text>:     Edit a comment</Text>
          <Text><Text color="green">d</Text>:     Delete a comment</Text>
          <Text><Text color="green">q</Text>:     Discard all and exit</Text>
        </Box>
      )}

      {(mode === 'edit-select' || mode === 'delete-select') && (
        <Box flexDirection="column" borderStyle="single" borderColor="yellow" paddingX={1}>
          <Text color="yellow">
            {mode === 'edit-select' ? 'Select comment to edit:' : 'Select comment to delete:'}
          </Text>
          <Text>↑/↓: Navigate | ENTER: Select | ESC: Cancel</Text>
        </Box>
      )}
    </Box>
  );
};
