import React, { memo } from 'react';
import { Box, Text } from 'ink';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = memo(({ title, subtitle }) => {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text bold color="cyan">─ {title} </Text>
        <Text color="gray">{'─'.repeat(Math.max(0, 50 - title.length))}</Text>
      </Box>
      {subtitle && (
        <Text color="gray">{subtitle}</Text>
      )}
    </Box>
  );
});
