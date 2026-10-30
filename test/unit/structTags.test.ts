import fs from 'node:fs';
import path from 'node:path';

import { Language, Parser, Query } from '@willbooster/web-tree-sitter';
import { expect, test } from 'vitest';

const Root = path.join(import.meta.dirname, '../..');
const Source = fs.readFileSync(path.join(Root, 'test/fixtures/structTags.go'), 'utf8');
await Parser.init();
const LanguageGo = await Language.load(path.join(Root, 'tree-sitter-go.wasm'));

test('exposes tag key/value fields and drops a pair whose value is unterminated', () => {
  const parser = new Parser();
  parser.setLanguage(LanguageGo);
  const query = new Query(
    LanguageGo,
    '(struct_tag_pair key: (tag_name) @key value: (interpreted_string_literal) @value)'
  );
  const tree = parser.parse(Source)!;
  try {
    expect(tree.rootNode.hasError).toBe(false);
    const pairs = query.matches(tree.rootNode).map(({ captures }) => captures.map(({ node }) => node.text));
    expect(pairs).toEqual([
      ['json', '"name"'],
      ['xml', '"name,omitempty"'],
      ['custom-tag', '"x"'],
      ['x.y', '"z"'],
      ['json', '"x"'],
      ['xml', '"y"'],
      [String.raw`\key`, '"slash"'],
      ['界.键', '"value"'],
      ['custom', String.raw`"a\"b\\c"`],
      ['empty', '""'],
      ['only', '"value"'],
      ['custom', '"%[01]d"'],
      ['b', '"second"'],
      ['c', '"third"'],
      ['b', '"second"'],
      ['b', '"second"'],
      ['prefix%d', '"value"'],
      ['%s', '"other"'],
      ['unknown%Q', '"x"'],
      ['percent%%', '"value"'],
      ['bare%', '"value"'],
    ]);
    expect(tree.rootNode.descendantsOfType('field_identifier').filter((node) => node.text === 'Second')).toHaveLength(
      3
    );
    const unicode = tree.rootNode.descendantsOfType('tag_name').find((node) => node.text === '界.键')!;
    expect(unicode.startIndex).toBe(Source.indexOf('界.键'));
    expect(unicode.endIndex).toBe(unicode.startIndex + '界.键'.length);
    const formats = tree.rootNode.descendantsOfType('format_specifier');
    expect(formats.map((node) => node.text)).toEqual([
      '%[01]d',
      '%[01]d',
      '%d',
      '%q',
      '%d',
      '%s',
      '%d',
      '%v',
      '%q',
      '% d',
      '%%',
    ]);
    const fallbackFormat = formats.find((node) => node.startIndex === Source.indexOf('plain %d') + 'plain '.length)!;
    expect(fallbackFormat.text).toBe('%d');
    expect(fallbackFormat.endIndex).toBe(fallbackFormat.startIndex + 2);

    const start = Source.indexOf('only:"value"') + 'only:"value'.length;
    const unterminated = parser.parse(Source.slice(0, start) + Source.slice(start + 1))!;
    try {
      expect(unterminated.rootNode.hasError).toBe(false);
      expect(unterminated.rootNode.descendantsOfType('tag_name').map((node) => node.text)).not.toContain('only');
    } finally {
      unterminated.delete();
    }
  } finally {
    tree.delete();
    query.delete();
    parser.delete();
  }
});
