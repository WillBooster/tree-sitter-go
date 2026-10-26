import fs from 'node:fs';
import path from 'node:path';

import { Edit, Language, Parser, Query } from '@willbooster/web-tree-sitter';
import { expect, test } from 'vitest';

import { testCommand } from './run.js';

const Root = path.join(import.meta.dirname, '../..');
const Source = fs.readFileSync(path.join(Root, 'test/fixtures/structTags.go'), 'utf8');
await Parser.init();
const LanguageGo = await Language.load(path.join(Root, 'tree-sitter-go.wasm'));

test('exposes tag key/value fields and restores them after an incomplete-value edit', () => {
  const parser = new Parser();
  parser.setLanguage(LanguageGo);
  const query = new Query(
    LanguageGo,
    '(struct_tag_pair key: (tag_name) @key value: (interpreted_string_literal) @value)'
  );
  const tree = parser.parse(Source)!;
  try {
    expect(tree.rootNode.hasError).toBe(false);
    const baseline = tree.rootNode.toString();
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
    const prefix = Source.slice(0, start).split('\n');
    const position = { row: prefix.length - 1, column: prefix.at(-1)!.length };
    tree.edit(
      new Edit({
        startIndex: start,
        oldEndIndex: start + 1,
        newEndIndex: start,
        startPosition: position,
        oldEndPosition: { ...position, column: position.column + 1 },
        newEndPosition: position,
      })
    );
    const edited = parser.parse(Source.slice(0, start) + Source.slice(start + 1), tree)!;
    try {
      expect(edited.rootNode.hasError).toBe(false);
      expect(edited.rootNode.descendantsOfType('tag_name').map((node) => node.text)).not.toContain('only');
      edited.edit(
        new Edit({
          startIndex: start,
          oldEndIndex: start,
          newEndIndex: start + 1,
          startPosition: position,
          oldEndPosition: position,
          newEndPosition: { ...position, column: position.column + 1 },
        })
      );
      const restored = parser.parse(Source, edited)!;
      try {
        expect(restored.rootNode.toString()).toBe(baseline);
      } finally {
        restored.delete();
      }
    } finally {
      edited.delete();
    }
  } finally {
    tree.delete();
    query.delete();
    parser.delete();
  }
});

testCommand(
  'renders raw tag keys as attributes while keeping ordinary strings intact',
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
    'test/fixtures/structTags.go',
  ],
  300_000,
  {
    check(output) {
      const names = Array.from(output.matchAll(/<span class='attribute'>([^<]*)<\/span>/g), (match) => match[1]);
      expect(names).toEqual([
        'json',
        'xml',
        'custom-tag',
        'x.y',
        'json',
        'xml',
        String.raw`\key`,
        '界.键',
        'custom',
        'empty',
        'only',
        'custom',
        'b',
        'c',
        'b',
        'b',
        'prefix%d',
        '%s',
        'unknown%Q',
        'percent%%',
        'bare%',
      ]);
      expect(output).toContain('`json:&quot;ordinary&quot;`');
      expect(output.match(/<span class='string special'>/g)).toHaveLength(1);
      expect(output).toContain("<span class='string special'>%[01]d</span>");
    },
  }
);
