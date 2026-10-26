import fs from 'node:fs';
import path from 'node:path';

import { Language, Parser } from '@willbooster/web-tree-sitter';
import { expect, test } from 'vitest';

import { generationInputMtime } from '../helpers/generationInputs.js';

const Root = path.join(import.meta.dirname, '../..');
const WasmPath = path.join(Root, 'tree-sitter-go.wasm');
await Parser.init();
const parser = new Parser();
parser.setLanguage(await Language.load(WasmPath));

test('uses a Wasm build built from the current parser', () => {
  const sources = ['grammar.js', 'src/parser.c', 'src/tree_sitter/parser.h'].map(
    (name) => fs.statSync(path.join(Root, name)).mtimeMs
  );
  expect(
    Math.max(generationInputMtime(Root), ...sources) > fs.statSync(WasmPath).mtimeMs,
    'generation inputs or src/ changed after the Wasm build was built; run `bun run build/ci`'
  ).toBe(false);
});

test('recovers from an error on each line in linear time', { timeout: 60_000 }, () => {
  expectLinearScaling('$ a\n'.repeat(2000), '$ a\n'.repeat(20_000), true);
});

test('parses ambiguous raw tag contents in linear time', { timeout: 60_000 }, () => {
  expectLinearScaling(rawTagSource(2000), rawTagSource(20_000), false);
});

function rawTagSource(count: number): string {
  return 'package tags\ntype Record struct { F string `' + 'x:"a '.repeat(count) + '` }\n';
}

function expectLinearScaling(small: string, large: string, expectError: boolean): void {
  parseCpuTime(large, expectError);
  parseCpuTime(large, expectError);
  let smallFastest = Infinity;
  let largeFastest = Infinity;
  for (let run = 0; run < 5; run++) {
    smallFastest = Math.min(smallFastest, parseCpuTime(small, expectError));
    largeFastest = Math.min(largeFastest, parseCpuTime(large, expectError));
  }
  expect(
    largeFastest / smallFastest,
    `parse CPU microseconds: small=${smallFastest}, large=${largeFastest}`
  ).toBeLessThan(18);
}

function parseCpuTime(source: string, expectError: boolean): number {
  const start = process.threadCpuUsage();
  const tree = parser.parse(source);
  const { system, user } = process.threadCpuUsage(start);
  if (!tree) throw new Error('The parser returned no tree');
  const { hasError } = tree.rootNode;
  tree.delete();
  expect(hasError).toBe(expectError);
  return system + user;
}
