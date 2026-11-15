import assert from 'node:assert/strict';
import path from 'node:path';

import { Language, Parser } from '@willbooster/web-tree-sitter';
import { expect, test } from 'vitest';

await Parser.init();
const parser = new Parser();
parser.setLanguage(await Language.load(path.join(import.meta.dirname, '../../tree-sitter-go.wasm')));

const clauses = [
  ['switch {case true:', 'default:}'],
  ['switch any(1).(type) {case int:', 'default:}'],
  ['select {default:', 'case <-make(chan int):}'],
];
const labels = 'if false {goto Outer;goto Inner};Outer:Inner:';

test('empty label tails require a terminator before the next case', () => {
  for (const [prefix, next] of clauses) {
    expectParse(`${prefix}${labels};${next}`, false);
    expectParse(`${prefix}${labels}\n${next}`, true);
  }
});

test('ordinary statements require a terminator before the next case', () => {
  for (const [prefix, next] of clauses) {
    expectParse(`${prefix}println(1)\n${next}`, false);
    expectParse(`${prefix}println(1) ${next}`, true);
  }
});

test('comments preserve statement termination before the next case', () => {
  for (const [prefix, next] of clauses) {
    for (const comment of ['/*\n*/', '/* text *\n more **/', '/**/ /*\n*/ /**/', '// text\n']) {
      expectParse(`${prefix}println(1) ${comment}${next}`, false);
    }
    for (const comment of ['/**/', '/* text **/', '/*\r*/']) {
      expectParse(`${prefix}println(1) ${comment}${next}`, true);
    }
    expectParse(`${prefix}${labels}/*\n*/${next}`, true);
  }
});

test('newline comments separate statements and declaration members', () => {
  expectParse('println(1)/*\n*/println(2)', false);
  expectParse('var (a=1/*\n*/b=2);_ = a;_ = b', false);
  expectParse('type S struct {a int/*\n*/b int};_ = S{}', false);
  expectParse('type I interface {A()/*\n*/B()};var _ I', false);
});

test('empty label tails can end the final case before a closing brace', () => {
  for (const [prefix] of clauses) expectParse(`${prefix}${labels}}`, false);
});

function expectParse(body: string, hasError: boolean): void {
  const tree = parser.parse(`package main;func main(){${body}}`);
  assert.ok(tree);
  try {
    expect(tree.rootNode.hasError, body).toBe(hasError);
  } finally {
    tree.delete();
  }
}
