; Pico Tree-sitter Highlights
; For Neovim, Helix, and other tree-sitter compatible editors

; --- Frontmatter ---
(frontmatter_delimiter) @punctuation.delimiter

; Keywords
"import" @keyword.import
"from" @keyword.import
"prop" @keyword
"let" @keyword
"const" @keyword

; Control flow
"if" @keyword.conditional
"else" @keyword.conditional
"/if" @keyword.conditional
"for" @keyword.repeat
"of" @keyword.repeat
"/for" @keyword.repeat

; --- Components ---
(component_name) @type
(tag_name) @tag
(attribute_name) @attribute

; --- Literals ---
(string) @string
(number) @number
(boolean) @boolean
(null) @constant.builtin
(undefined) @constant.builtin

; Template strings
(template_string) @string
(template_substitution
  "${" @punctuation.special
  "}" @punctuation.special)

; --- Identifiers ---
(identifier) @variable

; Prop declarations
(prop_declaration
  (identifier) @variable.parameter)

; Let declarations
(let_declaration
  (identifier) @variable)

; Import component names
(import_statement
  (component_name) @type)

; --- Operators ---
[
  "+"
  "-"
  "*"
  "/"
  "%"
  "="
  "=="
  "!="
  "==="
  "!=="
  "<"
  ">"
  "<="
  ">="
  "&&"
  "||"
  "!"
  "?"
  ":"
  "."
  "?."
] @operator

; --- Punctuation ---
[
  "{"
  "}"
] @punctuation.bracket

[
  "("
  ")"
] @punctuation.bracket

[
  "["
  "]"
] @punctuation.bracket

[
  "<"
  ">"
  "</"
  "/>"
] @punctuation.bracket

"," @punctuation.delimiter
";" @punctuation.delimiter

; --- HTML ---
(html_comment) @comment

; --- Style/Script ---
(style_element
  "<style>" @tag
  "</style>" @tag)

(script_element
  "<script>" @tag
  "</script>" @tag)

(raw_text) @none

; --- Dynamic components ---
(dynamic_component
  "=" @keyword.operator)

; Expression delimiters in template
(expression
  "{" @punctuation.special
  "}" @punctuation.special)

(if_start
  "{" @punctuation.special
  "}" @punctuation.special)

(if_end
  "{" @punctuation.special
  "}" @punctuation.special)

(for_start
  "{" @punctuation.special
  "}" @punctuation.special)

(for_end
  "{" @punctuation.special
  "}" @punctuation.special)

(else_if_clause
  "{" @punctuation.special
  "}" @punctuation.special)

(else_clause
  "{" @punctuation.special
  "}" @punctuation.special)

(shorthand_attribute
  "{" @punctuation.special
  (identifier) @variable
  "}" @punctuation.special)

(expression_attribute
  "{" @punctuation.special
  "}" @punctuation.special)
