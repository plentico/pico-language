; Pico Tree-sitter Highlights
; For Neovim, Helix, and other tree-sitter compatible editors

; ============================================================================
; Frontmatter
; ============================================================================

(frontmatter_delimiter) @punctuation.special

; Frontmatter keywords
(import_statement "import" @keyword.import)
(import_statement "from" @keyword.import)
(import_statement (component_name) @type)
(import_statement (string) @string)

(prop_declaration "prop" @keyword)
(prop_declaration (identifier) @variable.parameter)

(let_declaration "let" @keyword)
(let_declaration "const" @keyword)
(let_declaration (identifier) @variable)

; ============================================================================
; Control Flow
; ============================================================================

; If blocks
(if_start "{" @punctuation.special)
(if_start "if" @keyword.conditional)
(if_start "}" @punctuation.special)

(else_if_clause "{" @punctuation.special)
(else_if_clause "else" @keyword.conditional)
(else_if_clause "if" @keyword.conditional)
(else_if_clause "}" @punctuation.special)

(else_clause "{" @punctuation.special)
(else_clause "else" @keyword.conditional)
(else_clause "}" @punctuation.special)

(if_end "{" @punctuation.special)
(if_end "/if" @keyword.conditional)
(if_end "}" @punctuation.special)

; For blocks
(for_start "{" @punctuation.special)
(for_start "for" @keyword.repeat)
(for_start "let" @keyword)
(for_start "of" @keyword.repeat)
(for_start (identifier) @variable)
(for_start "}" @punctuation.special)

(for_end "{" @punctuation.special)
(for_end "/for" @keyword.repeat)
(for_end "}" @punctuation.special)

; ============================================================================
; Expressions
; ============================================================================

(expression "{" @punctuation.special)
(expression "}" @punctuation.special)

; ============================================================================
; HTML Elements - Consistent coloring for opening and closing tags
; ============================================================================

; Tag names - same color for both opening and closing
(html_start_tag (tag_name) @tag)
(html_end_tag (tag_name) @tag)
(self_closing_html_tag (tag_name) @tag)

; Tag delimiters - consistent for opening and closing
(html_start_tag "<" @tag.delimiter)
(html_start_tag ">" @tag.delimiter)
(html_end_tag "</" @tag.delimiter)
(html_end_tag ">" @tag.delimiter)
(self_closing_html_tag "<" @tag.delimiter)
(self_closing_html_tag "/>" @tag.delimiter)

; ============================================================================
; Component Tags
; ============================================================================

(component_start_tag (component_name) @type)
(component_end_tag (component_name) @type)
(self_closing_component (component_name) @type)

(component_start_tag "<" @tag.delimiter)
(component_start_tag ">" @tag.delimiter)
(component_end_tag "</" @tag.delimiter)
(component_end_tag ">" @tag.delimiter)
(self_closing_component "<" @tag.delimiter)
(self_closing_component "/>" @tag.delimiter)

; ============================================================================
; Attributes
; ============================================================================

(attribute_name) @tag.attribute

(string_attribute (attribute_name) @tag.attribute)
(string_attribute "=" @punctuation.delimiter)
(string_attribute (string) @string)

(expression_attribute (attribute_name) @tag.attribute)
(expression_attribute "=" @punctuation.delimiter)
(expression_attribute "{" @punctuation.special)
(expression_attribute "}" @punctuation.special)

(boolean_attribute) @tag.attribute

(shorthand_attribute "{" @punctuation.special)
(shorthand_attribute (identifier) @variable)
(shorthand_attribute "}" @punctuation.special)

; ============================================================================
; Style Element
; ============================================================================

(style_element "<style>" @tag)
(style_element "</style>" @tag)
(style_element (raw_text) @none)

; ============================================================================
; Script Element
; ============================================================================

(script_element "<script>" @tag)
(script_element "</script>" @tag)
(script_element (raw_text) @none)

; ============================================================================
; Literals and Identifiers
; ============================================================================

(string) @string
(number) @number
(boolean) @boolean
(null) @constant.builtin
(undefined) @constant.builtin

(template_string) @string
(template_substitution "${" @punctuation.special)
(template_substitution "}" @punctuation.special)

(identifier) @variable

; ============================================================================
; Operators
; ============================================================================

[
  "+"
  "-"
  "*"
  "/"
  "%"
  "="
] @operator

[
  "=="
  "!="
  "==="
  "!=="
  "<"
  ">"
  "<="
  ">="
] @operator

[
  "&&"
  "||"
  "!"
] @operator

[
  "?"
  ":"
] @operator.ternary

[
  "."
  "?."
] @punctuation.delimiter

; ============================================================================
; Punctuation
; ============================================================================

[
  "("
  ")"
] @punctuation.bracket

[
  "["
  "]"
] @punctuation.bracket

"," @punctuation.delimiter
";" @punctuation.delimiter

; ============================================================================
; Comments
; ============================================================================

(html_comment) @comment

; ============================================================================
; Dynamic Components
; ============================================================================

(dynamic_component "<" @tag.delimiter)
(dynamic_component "=" @keyword.operator)
(dynamic_component "/>" @tag.delimiter)

(expression_path "{" @punctuation.special)
(expression_path (identifier) @variable)
(expression_path "}" @punctuation.special)
