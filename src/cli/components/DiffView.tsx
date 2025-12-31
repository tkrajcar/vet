import React, { memo } from 'react';
import { Box, Text } from 'ink';
import type { Hunk, Comment } from '../../git/types.js';

interface DiffViewProps {
  hunk: Hunk;
  lineComments?: Comment[];
  targetedLine?: number | null;
}

export const DiffView: React.FC<DiffViewProps> = memo(({ hunk, lineComments = [], targetedLine }) => {
  // Create a map of line numbers to comments for quick lookup
  const commentsByLine = new Map<number, Comment>();
  for (const comment of lineComments) {
    if (comment.lineNumber) {
      commentsByLine.set(comment.lineNumber, comment);
    }
  }

  return (
    <Box flexDirection="column">
      {hunk.lines.map((line, index) => {
        let color: string | undefined;
        let prefix: string;

        if (line.type === 'add') {
          color = 'green';
          prefix = '+';
        } else if (line.type === 'delete') {
          color = 'red';
          prefix = '-';
        } else {
          color = undefined;
          prefix = ' ';
        }

        // Format line number with padding
        const lineNum = line.lineNumber.toString().padStart(4, ' ');

        // Check if there's a comment for this line
        const lineComment = commentsByLine.get(line.lineNumber);

        // Check if this line is being targeted for a comment
        const isTargeted = targetedLine === line.lineNumber;

        return (
          <Box key={index} flexDirection="column">
            <Text backgroundColor={isTargeted ? 'blackBright' : undefined}>
              <Text color={color}>{prefix}</Text>
              <Text color={isTargeted ? 'white' : 'gray'}>{lineNum} │ </Text>
              <Text color={color}>
                {line.content.replace(/^[+-\s]/, '')}
              </Text>
            </Text>
            {lineComment && (
              <Text>
                <Text color="gray">      │ </Text>
                <Text color="yellow">💬 {lineComment.text}</Text>
              </Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
});
