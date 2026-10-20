(
  (comment)* @doc
  .
  (function_declaration
    name: (identifier) @name) @definition.function
  (#strip! @doc "^//\\s*")
  (#set-adjacent! @doc @definition.function)
)

(
  (comment)* @doc
  .
  (method_declaration
    name: (field_identifier) @name) @definition.method
  (#strip! @doc "^//\\s*")
  (#set-adjacent! @doc @definition.method)
)

(call_expression
  function: [
    (identifier) @name
    (parenthesized_expression (identifier) @name)
    (selector_expression field: (field_identifier) @name)
    (parenthesized_expression (selector_expression field: (field_identifier) @name))
  ]) @reference.call

[
  (type_spec name: (type_identifier) @name)
  (type_alias name: (type_identifier) @name)
] @definition.type

(type_identifier) @name @reference.type

(package_clause "package" (package_identifier) @name)

(method_elem
  name: (field_identifier) @name) @definition.method

(
  (field_declaration
    name: (field_identifier) @name) @definition.field
  (#not-eq? @name "_")
)

(import_declaration (import_spec) @name)

(
  (source_file
    (var_declaration
      [
        (var_spec name: (identifier) @name) @definition.variable
        (var_spec_list
          (var_spec name: (identifier) @name) @definition.variable)
      ]))
  (#not-eq? @name "_")
)

(
  (source_file
    (const_declaration
      (const_spec name: (identifier) @name) @definition.constant))
  (#not-eq? @name "_")
)
