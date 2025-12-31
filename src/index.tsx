import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import { App } from './cli/App.js';

const cli = meow(
  `
  Usage
    $ vet [options]

  Options
    --staged          Review staged changes instead of unstaged
    --file <pattern>  Limit review to files matching pattern
    --context <n>     Lines of context around changes (default: 3)
    --output <path>   Write feedback to file (default: stdout)

  Examples
    $ vet
    $ vet --staged
    $ vet --file "src/**/*.ts"
    $ vet --context 5
`,
  {
    importMeta: import.meta,
    flags: {
      staged: {
        type: 'boolean',
        default: false,
      },
      file: {
        type: 'string',
      },
      context: {
        type: 'number',
        default: 3,
      },
      output: {
        type: 'string',
      },
    },
  }
);

const { flags } = cli;

const options = {
  staged: flags.staged,
  file: flags.file,
  context: flags.context,
};

const { waitUntilExit } = render(
  <App
    options={options}
    outputPath={flags.output}
    onExit={() => process.exit(0)}
  />
);

waitUntilExit().then(() => {
  process.exit(0);
});
