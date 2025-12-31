import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface CommentInputProps {
  onSubmit: (comment: string, lineNumber?: number) => void;
  onSkip: () => void;
  onBack: () => void;
  onEscape: () => void;
  onLineTargetChange?: (lineNumber: number | null) => void;
  existingComment?: string;
}

export const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  onSkip,
  onBack,
  onEscape,
  onLineTargetChange,
  existingComment = '',
}) => {
  const [input, setInput] = useState(existingComment);
  const [lineMode, setLineMode] = useState<number | null>(null);

  // Parse input to detect line targeting like `:45` or `:45 `
  const parseLineTarget = (text: string): number | null => {
    const match = text.match(/^:(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return null;
  };

  // Update input and line target
  const updateInput = (newInput: string, overrideLineMode?: number | null) => {
    setInput(newInput);
    // Use override if provided, otherwise check lineMode, then parse input
    const target = overrideLineMode !== undefined ? overrideLineMode : (lineMode ?? parseLineTarget(newInput));
    onLineTargetChange?.(target);
  };

  useInput((char, key) => {
    if (key.escape) {
      onLineTargetChange?.(null);
      onEscape();
      return;
    }

    if (key.upArrow && input === '') {
      onLineTargetChange?.(null);
      onBack();
      return;
    }

    if (key.downArrow && input === '') {
      onLineTargetChange?.(null);
      onSkip();
      return;
    }

    if (key.return) {
      if (input === '') {
        onLineTargetChange?.(null);
        onSkip();
      } else if (input.startsWith(':')) {
        // Parse line-specific comment like ":45 comment text"
        const match = input.match(/^:(\d+)\s*(.*)/);
        if (match) {
          const lineNum = parseInt(match[1], 10);
          const comment = match[2];
          if (comment) {
            onSubmit(comment, lineNum);
            onLineTargetChange?.(null);
            setInput('');
          } else {
            // Just set line mode, wait for more input
            setLineMode(lineNum);
            setInput('');
            onLineTargetChange?.(lineNum);  // Keep highlighting the line
          }
        }
      } else if (lineMode !== null) {
        onSubmit(input, lineMode);
        setLineMode(null);
        onLineTargetChange?.(null);
        setInput('');
      } else {
        onSubmit(input);
        onLineTargetChange?.(null);
        setInput('');
      }
      return;
    }

    if (key.backspace || key.delete) {
      updateInput(input.slice(0, -1));
      return;
    }

    if (char && !key.ctrl && !key.meta) {
      updateInput(input + char);
    }
  });

  const prompt = lineMode !== null
    ? `Comment for line ${lineMode}`
    : 'Comment (ENTER skip, :line for specific line)';

  return (
    <Box flexDirection="column" borderStyle="single" borderColor="gray" paddingX={1}>
      <Text color="gray">{prompt}:</Text>
      <Text>
        <Text color="cyan">&gt; </Text>
        <Text>{input}</Text>
        <Text color="gray">▌</Text>
      </Text>
    </Box>
  );
};
