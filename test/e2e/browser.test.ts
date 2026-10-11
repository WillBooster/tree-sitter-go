import { Language, Parser } from '@willbooster/web-tree-sitter';
import runtimeUrl from '@willbooster/web-tree-sitter/web-tree-sitter.wasm?url';
import { expect, test } from 'vitest';

import goUrl from '../../tree-sitter-go.wasm?url';
import { Source, Tree } from '../fixtures/parse.js';

test('parses Go in a browser, loading the Wasm files over HTTP', async () => {
  await Parser.init({ locateFile: () => runtimeUrl });
  const parser = new Parser();
  parser.setLanguage(await Language.load(goUrl));
  expect(parser.parse(Source)?.rootNode.toString()).toBe(Tree);
});
