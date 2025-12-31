import React from 'react';
import { Box, Text, useInput } from 'ink';
import type { FileDiff } from '../git/types.js';
import { Header } from './components/Header.js';

interface OverviewProps {
  files: FileDiff[];
  onStart: () => void;
  onJumpToFile: (index: number) => void;
  onQuit: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
  files,
  onStart,
  onJumpToFile,
  onQuit,
}) => {
  const totalHunks = files.reduce((sum, f) => sum + f.hunks.length, 0);

  useInput((input, key) => {
    if (key.return) {
      onStart();
    } else if (input === 'q') {
      onQuit();
    } else if (input >= '1' && input <= '9') {
      const index = parseInt(input, 10) - 1;
      if (index < files.length) {
        onJumpToFile(index);
      }
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Header title="Vet" />

      <Text>
        <Text bold>{files.length}</Text>
        <Text> file{files.length !== 1 ? 's' : ''} changed, </Text>
        <Text bold>{totalHunks}</Text>
        <Text> hunk{totalHunks !== 1 ? 's' : ''} total</Text>
      </Text>

      <Box flexDirection="column" marginY={1}>
        {files.map((file, index) => {
          const hunkText = file.hunks.length === 1 ? 'hunk' : 'hunks';
          let suffix = '';
          if (file.isDeleted) {
            suffix = ' (deleted)';
          } else if (file.isNew) {
            suffix = ' (new)';
          } else if (file.isBinary) {
            suffix = ' (binary)';
          } else {
            suffix = ` (${file.hunks.length} ${hunkText})`;
          }

          return (
            <Text key={file.path}>
              <Text color="yellow">{index + 1}. </Text>
              <Text>{file.path}</Text>
              <Text color="gray">{suffix}</Text>
            </Text>
          );
        })}
      </Box>

      <Box flexDirection="column" marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
        <Text><Text color="green">ENTER</Text>: Start sequential review</Text>
        <Text><Text color="green">1-{Math.min(files.length, 9)}</Text>:   Jump to specific file</Text>
        <Text><Text color="green">q</Text>:     Quit without review</Text>
      </Box>
    </Box>
  );
};
