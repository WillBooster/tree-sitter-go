# @willbooster/tree-sitter-go

[![npm version](https://img.shields.io/npm/v/@willbooster/tree-sitter-go.svg)](https://www.npmjs.com/package/@willbooster/tree-sitter-go)
[![license](https://img.shields.io/npm/l/@willbooster/tree-sitter-go.svg)](https://www.npmjs.com/package/@willbooster/tree-sitter-go)
[![Test](https://github.com/WillBooster/tree-sitter-go/actions/workflows/test.yml/badge.svg)](https://github.com/WillBooster/tree-sitter-go/actions/workflows/test.yml)
[![Test rust](https://github.com/WillBooster/tree-sitter-go/actions/workflows/test-rust.yml/badge.svg)](https://github.com/WillBooster/tree-sitter-go/actions/workflows/test-rust.yml)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![wbfy](https://img.shields.io/badge/wbfy-21.3.0-1e90ff.svg)](https://github.com/WillBooster/shared/tree/main/packages/wbfy)
[![crates.io](https://img.shields.io/crates/v/willbooster-tree-sitter-go.svg)](https://crates.io/crates/willbooster-tree-sitter-go)

Go grammar for [tree-sitter](https://github.com/tree-sitter/tree-sitter), forked from
[tree-sitter/tree-sitter-go](https://github.com/tree-sitter/tree-sitter-go). We are grateful
to its authors and contributors. This is not an official release of that project.

This fork extends upstream's version 0.25.0 grammar with method type parameters and generates the parser with the
[WillBooster/tree-sitter](https://github.com/WillBooster/tree-sitter) generator. The parser carries that fork's ABI
number (`0x5742000c`), which upstream tree-sitter runtimes reject. This package targets the WillBooster runtime
(`willbooster-tree-sitter`, `@willbooster/web-tree-sitter`) version 20.0.0 or later within 20.x; the C and Wasm grammar
ABI is also compatible with 19.1.1+. Earlier 17.x, 18.x, and 19.0.x WillBooster runtimes share ABI `0x5742000c` and
pass the ABI check, but dereference `TSLanguage` tables (`alias_map`, `primary_state_bitmap`) omitted since 19.1.0 in
pre-19.0.0 query APIs and pre-19.1.0 Wasm language loading.

## Support Scope

This fork maintains only full parsing: valid input yields a correct tree, and invalid input yields `ERROR` or `MISSING`
nodes without crashing, hanging, or taking more than linear time. Incremental parsing is not supported, and no queries
are shipped. Node types, field names, and the trees that error recovery produces may change; such changes are released
as new major versions.

## Usage

The npm package ships `tree-sitter-go.wasm` for
[@willbooster/web-tree-sitter](https://www.npmjs.com/package/@willbooster/web-tree-sitter) version 20.0.0 or later within 20.x, which runs in Node.js, Bun, browsers, and Cloudflare Workers. In Node.js and Bun, load the grammar from its path:

```js
import { fileURLToPath } from 'node:url';

import { Language, Parser } from '@willbooster/web-tree-sitter';

await Parser.init();
const parser = new Parser();
const wasmPath = fileURLToPath(import.meta.resolve('@willbooster/tree-sitter-go/tree-sitter-go.wasm'));
parser.setLanguage(await Language.load(wasmPath));
const tree = parser.parse('package main\n\nfunc main() {}\n');
```

In browsers, serve both `.wasm` files and load them by URL, for example with Vite's `?url` imports:

```js
import goUrl from '@willbooster/tree-sitter-go/tree-sitter-go.wasm?url';
import { Language, Parser } from '@willbooster/web-tree-sitter';
import runtimeUrl from '@willbooster/web-tree-sitter/web-tree-sitter.wasm?url';

await Parser.init({ locateFile: () => runtimeUrl });
const parser = new Parser();
parser.setLanguage(await Language.load(goUrl));
```

Cloudflare Workers do not allow compiling Wasm at run time, so import both `.wasm` files as modules, with or without
Node.js compatibility:

```js
import go from '@willbooster/tree-sitter-go/tree-sitter-go.wasm';
import { Language, Parser } from '@willbooster/web-tree-sitter';
import runtime from '@willbooster/web-tree-sitter/web-tree-sitter.wasm';

await Parser.init({ wasmModule: runtime });
const parser = new Parser();
parser.setLanguage(await Language.load(go));
```

The package also ships `grammar.js` and the node types in `src/node-types.json`.

In Rust, depend on the [crate](https://crates.io/crates/willbooster-tree-sitter-go) and on
[willbooster-tree-sitter](https://crates.io/crates/willbooster-tree-sitter), the runtime this package is tested and
fuzzed with:

```sh
cargo add willbooster-tree-sitter@20.0.0 --rename tree-sitter
cargo add willbooster-tree-sitter-go --rename tree-sitter-go
```

```rust
let mut parser = tree_sitter::Parser::new();
parser.set_language(&tree_sitter_go::LANGUAGE.into())?;
let tree = parser.parse("package main\n\nfunc main() {}\n").unwrap();
```

## Development

```sh
mise install
bun install --frozen-lockfile
bun run test/ci-setup
bun run build/ci
bun run verify
bun run test
cargo test --locked
```

- Run Tree-sitter CLI commands through `script/tree-sitter` so they use the `WillBooster/tree-sitter` version locked in `Cargo.lock`.
- After changing `grammar.js`, `tree-sitter.json`, `test/corpus/`, or tracked files in `examples/`, run `bun run build/ci` and commit `src/`.
- `script/generate` reads tracked `examples/` paths from Git, so stage added or removed examples with `git add -A examples` before regenerating.
- When a grammar change or a moved pin in `script/parse-examples` alters which real-world Go files fail to parse, run `script/parse-examples` to rewrite `script/known-failures.txt` and review its diff.

### References

- [The Go Programming Language Specification](https://go.dev/ref/spec)
