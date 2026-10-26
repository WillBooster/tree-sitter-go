(type_identifier) @type
(field_identifier) @property
(tag_name) @attribute
(identifier) @variable

(call_expression
  function: (identifier) @function)

(call_expression
  function: (identifier) @function.builtin
  (#match? @function.builtin "^(append|cap|clear|close|complex|copy|delete|imag|len|make|max|min|new|panic|print|println|real|recover)$"))

(call_expression
  function: (selector_expression
    field: (field_identifier) @function.method))

(function_declaration
  name: (identifier) @function)

(method_declaration
  name: (field_identifier) @function.method)

[
  "--"
  "-"
  "-="
  ":="
  "!"
  "!="
  "..."
  "*"
  "*"
  "*="
  "/"
  "/="
  "&"
  "&&"
  "&="
  "%"
  "%="
  "^"
  "^="
  "+"
  "++"
  "+="
  "<-"
  "<"
  "<<"
  "<<="
  "<="
  "="
  "=="
  ">"
  ">="
  ">>"
  ">>="
  "|"
  "|="
  "||"
  "~"
] @operator

[
  "break"
  "case"
  "chan"
  "const"
  "continue"
  "default"
  "defer"
  "else"
  "fallthrough"
  "for"
  "func"
  "go"
  "goto"
  "if"
  "import"
  "interface"
  "map"
  "package"
  "range"
  "return"
  "select"
  "struct"
  "switch"
  "type"
  "var"
] @keyword

[
  (interpreted_string_literal)
  (raw_string_literal)
  (rune_literal)
] @string

((call_expression
  function: (identifier) @function
  arguments: (argument_list
    . (comment)*
    . [
      (interpreted_string_literal
        . [(interpreted_string_literal_content) (escape_sequence) (format_specifier) @string.special]* .)
      (raw_string_literal
        . [(raw_string_literal_content) (format_specifier) @string.special]* .)
    ]))
  (#match? @function "^(Printf|Sprintf|Errorf|Scanf|Fatalf|Panicf|Skipf|Logf|Debugf|Infof|Warnf|Warningf|Tracef)$"))

((call_expression
  function: (selector_expression field: (field_identifier) @function.method)
  arguments: (argument_list
    . (comment)*
    . [
      (interpreted_string_literal
        . [(interpreted_string_literal_content) (escape_sequence) (format_specifier) @string.special]* .)
      (raw_string_literal
        . [(raw_string_literal_content) (format_specifier) @string.special]* .)
    ]))
  (#match? @function.method "^(Printf|Sprintf|Errorf|Scanf|Fatalf|Panicf|Skipf|Logf|Debugf|Infof|Warnf|Warningf|Tracef)$"))

((call_expression
  function: (identifier) @function
  arguments: (argument_list
    . (comment)*
    . (_)
    . (comment)*
    . ","
    . (comment)*
    . [
      (interpreted_string_literal
        . [(interpreted_string_literal_content) (escape_sequence) (format_specifier) @string.special]* .)
      (raw_string_literal
        . [(raw_string_literal_content) (format_specifier) @string.special]* .)
    ]))
  (#match? @function "^(Fprintf|Appendf|Fscanf|Sscanf)$"))

((call_expression
  function: (selector_expression field: (field_identifier) @function.method)
  arguments: (argument_list
    . (comment)*
    . (_)
    . (comment)*
    . ","
    . (comment)*
    . [
      (interpreted_string_literal
        . [(interpreted_string_literal_content) (escape_sequence) (format_specifier) @string.special]* .)
      (raw_string_literal
        . [(raw_string_literal_content) (format_specifier) @string.special]* .)
    ]))
  (#match? @function.method "^(Fprintf|Appendf|Fscanf|Sscanf)$"))

(escape_sequence) @escape

[
  (int_literal)
  (float_literal)
  (imaginary_literal)
] @number

[
  (true)
  (false)
  (nil)
  (iota)
] @constant.builtin

(comment) @comment
