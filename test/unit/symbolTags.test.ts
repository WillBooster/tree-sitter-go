import { expect } from 'vitest';
import { testCommand } from './run.js';

testCommand(
  'tags declared symbols across groups without treating local bindings as global definitions',
  ['bash', '-c', 'script/tree-sitter tags < test/fixtures/symbolTags.go'],
  300_000,
  {
    check(output) {
      const definitions = Array.from(output.matchAll(/^\s*(\w+)\s+\|\s*\w+\s+def\b/gm), (match) => match[1]);
      expect(definitions).toEqual(
        expect.arrayContaining([
          'Number',
          'Record',
          'Contract',
          'First',
          'Second',
          'Method',
          'GlobalOne',
          'GlobalTwo',
          'GlobalA',
          'GlobalB',
          'DirectVariable',
          'DirectConstant',
          'Function',
        ])
      );
      expect(new Set(definitions).size).toBe(definitions.length);
      expect(definitions).not.toContain('_');
      expect(definitions).not.toContain('localValue');
      expect(definitions).not.toContain('localConstant');
    },
  }
);
