import { expect } from 'vitest';

import { testCommand } from './run.js';

testCommand(
  'attaches tag documentation only across adjacent comment lines',
  ['bash', '-c', 'script/tree-sitter tags < test/fixtures/docComments.go'],
  300_000,
  {
    check(output) {
      expect(output).toMatch(/^Separated\s+\|[^\n]*`func Separated\(\) \{\}`\s*$/m);
      expect(output).toMatch(/^SeparateMethod\s+\|[^\n]*`func \(Receiver\) SeparateMethod\(\) \{\}`\s*$/m);
      expect(output).toContain(String.raw`"Direct docs.\nContinuation."`);
      expect(output).toContain('"Direct method."');
      expect(output).toMatch(/^BlockSeparated\s+\|[^\n]*`func BlockSeparated\(\) \{\}`\s*$/m);
      expect(output).toContain('"/* Direct block. */"');
      expect(output).not.toContain('Detached');
    },
  }
);
