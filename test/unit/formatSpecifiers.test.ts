import fs from 'node:fs';
import path from 'node:path';

import { Language, Parser } from '@willbooster/web-tree-sitter';
import { expect, test } from 'vitest';

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
