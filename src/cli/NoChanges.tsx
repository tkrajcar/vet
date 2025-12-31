import React from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from './components/Header.js';

interface NoChangesProps {
  onExit: () => void;
}

export const NoChanges: React.FC<NoChangesProps> = ({ onExit }) => {
  useInput(() => {
    onExit();
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Header title="Vet" />
      <Text>No changes to review.</Text>
      <Text color="gray">Press any key to exit.</Text>
    </Box>
  );
};
