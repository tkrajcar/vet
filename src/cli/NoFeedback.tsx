import React from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from './components/Header.js';

interface NoFeedbackProps {
  onExit: () => void;
}

export const NoFeedback: React.FC<NoFeedbackProps> = ({ onExit }) => {
  useInput(() => {
    onExit();
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Header title="Review Complete" />
      <Text>No feedback to send. All changes approved.</Text>
      <Text color="gray">Press any key to exit.</Text>
    </Box>
  );
};
