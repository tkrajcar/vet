import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import type { FileDiff, Comment, Hunk } from '../git/types.js';
import { getChanges, generateDiffSnippet, type DiffOptions } from '../git/diff.js';
import { formatFeedback, formatAborted } from '../output/formatter.js';
import { Overview } from './Overview.js';
import { HunkReview } from './HunkReview.js';
import { Summary } from './Summary.js';
import { NoChanges } from './NoChanges.js';
import { NoFeedback } from './NoFeedback.js';
import fs from 'node:fs';
import path from 'node:path';

type Screen = 'loading' | 'no-changes' | 'overview' | 'review' | 'summary' | 'no-feedback';

interface AppProps {
  options: DiffOptions;
  outputPath: string;
  onExit: () => void;
}

export const App: React.FC<AppProps> = ({ options, outputPath, onExit }) => {
  const [screen, setScreen] = useState<Screen>('loading');
  const [files, setFiles] = useState<FileDiff[]>([]);
  const [fileIndex, setFileIndex] = useState(0);
  const [hunkIndex, setHunkIndex] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load changes on mount
  useEffect(() => {
    getChanges(options)
      .then(result => {
        if (result.length === 0) {
          setScreen('no-changes');
        } else {
          setFiles(result);
          setScreen('overview');
        }
      })
      .catch(err => {
        setError(err.message);
      });
  }, []);

  const writeFeedback = (content: string) => {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, content, 'utf-8');
  };

  const getCurrentHunk = (): Hunk | null => {
    if (fileIndex >= files.length) return null;
    const file = files[fileIndex];
    if (hunkIndex >= file.hunks.length) return null;
    return file.hunks[hunkIndex];
  };

  const addHunkComment = (text: string) => {
    const file = files[fileIndex];
    const hunk = file.hunks[hunkIndex];

    const comment: Comment = {
      filePath: file.path,
      hunkIndex,
      lineNumber: undefined,
      text,
      diffSnippet: file.isDeleted ? '' : generateDiffSnippet(hunk),
      startLine: hunk.startLine,
      endLine: hunk.endLine,
      isDeletedFile: file.isDeleted,
    };

    // Replace existing hunk comment if one exists
    setComments(prev => {
      const filtered = prev.filter(
        c => !(c.filePath === file.path && c.hunkIndex === hunkIndex && !c.lineNumber)
      );
      return [...filtered, comment];
    });

    advanceToNextHunk();
  };

  const addLineComment = (text: string, lineNumber: number) => {
    const file = files[fileIndex];
    const hunk = file.hunks[hunkIndex];

    const comment: Comment = {
      filePath: file.path,
      hunkIndex,
      lineNumber,
      text,
      diffSnippet: file.isDeleted ? '' : generateDiffSnippet(hunk),
      startLine: hunk.startLine,
      endLine: hunk.endLine,
      isDeletedFile: file.isDeleted,
    };

    // Replace existing comment for this line if one exists
    setComments(prev => {
      const filtered = prev.filter(
        c => !(c.filePath === file.path && c.hunkIndex === hunkIndex && c.lineNumber === lineNumber)
      );
      return [...filtered, comment];
    });

    // Stay on current hunk - don't advance
  };

  const advanceToNextHunk = () => {
    const file = files[fileIndex];

    if (hunkIndex + 1 < file.hunks.length) {
      setHunkIndex(hunkIndex + 1);
    } else if (fileIndex + 1 < files.length) {
      setFileIndex(fileIndex + 1);
      setHunkIndex(0);
    } else {
      finishReview();
    }
  };

  const goToPrevHunk = () => {
    if (hunkIndex > 0) {
      setHunkIndex(hunkIndex - 1);
    } else if (fileIndex > 0) {
      const prevFile = files[fileIndex - 1];
      setFileIndex(fileIndex - 1);
      setHunkIndex(prevFile.hunks.length - 1);
    }
  };

  const skipToNextFile = () => {
    if (fileIndex + 1 < files.length) {
      setFileIndex(fileIndex + 1);
      setHunkIndex(0);
    } else {
      finishReview();
    }
  };

  const jumpToFile = (index: number) => {
    setFileIndex(index);
    setHunkIndex(0);
    setScreen('review');
  };

  const jumpToNextFile = () => {
    if (fileIndex + 1 < files.length) {
      setFileIndex(fileIndex + 1);
      setHunkIndex(0);
    }
  };

  const jumpToPrevFile = () => {
    if (fileIndex > 0) {
      setFileIndex(fileIndex - 1);
      setHunkIndex(0);
    }
  };

  const finishReview = () => {
    if (comments.length === 0) {
      setScreen('no-feedback');
    } else {
      setScreen('summary');
    }
  };

  const handleSubmitFeedback = () => {
    const feedback = formatFeedback(comments);
    writeFeedback(feedback);
    onExit();
  };

  const handleDiscard = () => {
    writeFeedback(formatAborted());
    onExit();
  };

  const handleEditComment = (index: number, newText: string) => {
    setComments(prev => prev.map((c, i) => (i === index ? { ...c, text: newText } : c)));
  };

  const handleDeleteComment = (index: number) => {
    setComments(prev => prev.filter((_, i) => i !== index));
    if (comments.length <= 1) {
      setScreen('no-feedback');
    }
  };

  const handleQuitFromOverview = () => {
    // No file written
    onExit();
  };

  if (error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }

  switch (screen) {
    case 'loading':
      return (
        <Box padding={1}>
          <Text>Loading changes...</Text>
        </Box>
      );

    case 'no-changes':
      return <NoChanges onExit={onExit} />;

    case 'overview':
      return (
        <Overview
          files={files}
          onStart={() => setScreen('review')}
          onJumpToFile={jumpToFile}
          onQuit={handleQuitFromOverview}
        />
      );

    case 'review':
      return (
        <HunkReview
          files={files}
          fileIndex={fileIndex}
          hunkIndex={hunkIndex}
          comments={comments}
          onHunkComment={addHunkComment}
          onLineComment={addLineComment}
          onSkip={advanceToNextHunk}
          onBack={goToPrevHunk}
          onNextFile={jumpToNextFile}
          onPrevFile={jumpToPrevFile}
          onEscape={finishReview}
        />
      );

    case 'summary':
      return (
        <Summary
          comments={comments}
          onSubmit={handleSubmitFeedback}
          onDiscard={handleDiscard}
          onEditComment={handleEditComment}
          onDeleteComment={handleDeleteComment}
        />
      );

    case 'no-feedback':
      return <NoFeedback onExit={onExit} />;

    default:
      return null;
  }
};
