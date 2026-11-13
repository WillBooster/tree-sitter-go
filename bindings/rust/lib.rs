//! This crate provides Go language support for the [tree-sitter] parsing library.
//!
//! The parser carries the ABI number (`0x5742000c`) of the WillBooster fork of tree-sitter, which
//! upstream `tree-sitter` runtimes reject. This crate targets the `willbooster-tree-sitter`
//! runtime, version 20.0.0 or later within 20.x; the C grammar ABI is also compatible with
//! 19.1.1+. Earlier 17.x, 18.x, and 19.0.x WillBooster runtimes share ABI `0x5742000c` and pass
//! the ABI check, but dereference `TSLanguage` tables (`alias_map`, `primary_state_bitmap`)
//! omitted since 19.1.0 in pre-19.0.0 query APIs and pre-19.1.0 Wasm language loading.
//!
//! Typically, you will use the [`LANGUAGE`] constant to add this language to a
//! tree-sitter [`Parser`], and then use the parser to parse some code:
//!
//! ```
//! let code = "package main\n\nfunc main() {}\n";
//! let mut parser = tree_sitter::Parser::new();
//! let language = tree_sitter_go::LANGUAGE;
//! parser
//!     .set_language(&language.into())
//!     .expect("Error loading Go parser");
//! let tree = parser.parse(code).unwrap();
//! assert!(!tree.root_node().has_error());
//! ```
//!
//! [`Parser`]: https://docs.rs/willbooster-tree-sitter/20.0.0/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter_language::LanguageFn;

unsafe extern "C" {
    fn tree_sitter_go() -> *const ();
}

/// The tree-sitter [`LanguageFn`] for this grammar.
pub const LANGUAGE: LanguageFn = unsafe { LanguageFn::from_raw(tree_sitter_go) };

/// The content of the [`node-types.json`] file for this grammar.
///
/// [`node-types.json`]: https://tree-sitter.github.io/tree-sitter/using-parsers/6-static-node-types
pub const NODE_TYPES: &str = include_str!("../../src/node-types.json");

#[cfg(test)]
mod tests {
    #[test]
    fn test_can_load_grammar() {
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(&super::LANGUAGE.into())
            .expect("Error loading Go parser");
    }
}
