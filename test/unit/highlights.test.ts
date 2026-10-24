import { expect } from 'vitest';

import { testCommand } from './run.js';

testCommand(
  'renders function captures instead of generic identifier fallbacks',
  [
    'script/tree-sitter',
    'highlight',
    '--html',
    '--style',
    'minimal',
    '--layout',
    'fragment',
    '--grammar-path',
    '.',
    '--query-paths',
    'queries/highlights.scm',
    '--',
    'test/fixtures/highlights.go',
  ],
  300_000,
  {
    check(output) {
      expect(output.match(/<span class='function'>declared<\/span>/g)).toHaveLength(2);
      expect(output).toContain("<span class='function builtin'>len</span>");
      expect(output.match(/<span class='function'>Method<\/span>/g)).toHaveLength(2);
      expect(output).toContain("<span class='property'>Field</span>");
      expect(output).toContain("<span class='variable'>variable</span>");
    },
  }
);
