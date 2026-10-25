import fs from 'node:fs';
import path from 'node:path';

import { Language, Parser } from '@willbooster/web-tree-sitter';
import { expect, test } from 'vitest';

import { testCommand } from './run.js';

const Root = path.join(import.meta.dirname, '../..');

test('exposes format tokens with exact source ranges without rejecting arbitrary string contents', async () => {
  await Parser.init();
  const language = await Language.load(path.join(Root, 'tree-sitter-go.wasm'));
  const parser = new Parser();
  parser.setLanguage(language);
  const source = fs.readFileSync(path.join(Root, 'test/fixtures/formatSpecifiers.go'), 'utf8');
  const tree = parser.parse(source)!;
  try {
    expect(tree.rootNode.hasError).toBe(false);
    const tokens = tree.rootNode.descendantsOfType('format_specifier');
    const indexed = tokens.find((token) => token.text === '%[2]*.[1]*[3]f')!;
    expect(indexed.startIndex).toBe(source.indexOf('%[2]*.[1]*[3]f'));
    expect(indexed.endIndex).toBe(indexed.startIndex + '%[2]*.[1]*[3]f'.length);
    expect(tokens.map((token) => token.text)).toEqual([
      '%[2]*.[1]*[3]f',
      '%%',
      '%d',
      '%+v',
      '%w',
      '%02d',
      '%d',
      '%s',
      '%v',
      '%d',
      '%s',
      '%d',
      '%v',
      '%#08.2f',
      '%.[2]*[1]s',
      '%9.f',
      '%O',
      '%U',
      '% x',
      '%[02]*.[01]*[03]f',
      '%[01]d',
      '%d',
      '%[1]d',
      '%d',
      '%s',
      '%d',
      '%%',
      '%v',
    ]);
  } finally {
    tree.delete();
    parser.delete();
  }
});

testCommand(
  'highlights format directives in formatting positions while leaving data strings intact',
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
    'test/fixtures/formatSpecifiers.go',
  ],
  300_000,
  {
    check(output) {
      const directives = Array.from(
        output.matchAll(/<span class='string special'>([^<]*)<\/span>/g),
        (match) => match[1]
      );
      expect(directives).toEqual([
        '%[2]*.[1]*[3]f',
        '%%',
        '%d',
        '%+v',
        '%w',
        '%02d',
        '%d',
        '%s',
        '%s',
        '%#08.2f',
        '%.[2]*[1]s',
        '%9.f',
        '%O',
        '%U',
        '% x',
        '%[02]*.[01]*[03]f',
        '%[01]d',
        '%d',
        '%[1]d',
        '%s',
        '%d',
      ]);
      expect(output).toContain('%d literal');
      expect(output).toContain('%v data');
      expect(output).toContain('%d data');
      expect(output).toContain('plain %v');
      expect(output).toContain('%Q trailing %');
      expect(output).toContain('%d input');
      expect(output).toContain("\t<span class='function'>Printf</span>(");
    },
  }
);
