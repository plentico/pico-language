// Tree-sitter grammar for Pico templates
// https://tree-sitter.github.io/tree-sitter/creating-parsers

module.exports = grammar({
  name: 'pico',

  externals: $ => [
    $._text_fragment,
    $._raw_text,
  ],

  extras: $ => [/\s/],

  rules: {
    source_file: $ => repeat($._node),

    _node: $ => choice(
      $.frontmatter,
      $.control_flow,
      $.expression,
      $.component_tag,
      $.dynamic_component,
      $.style_element,
      $.script_element,
      $.html_element,
      $.html_text,
      $.html_comment,
    ),

    // --- Frontmatter ---
    frontmatter: $ => seq(
      $.frontmatter_delimiter,
      repeat($._frontmatter_statement),
      $.frontmatter_delimiter,
    ),

    frontmatter_delimiter: $ => /---\s*\n/,

    _frontmatter_statement: $ => choice(
      $.import_statement,
      $.prop_declaration,
      $.let_declaration,
      $.expression_statement,
    ),

    import_statement: $ => seq(
      'import',
      $.component_name,
      'from',
      $.string,
      optional(';'),
    ),

    prop_declaration: $ => seq(
      'prop',
      $.identifier,
      optional(seq('=', $._expression)),
      ';',
    ),

    let_declaration: $ => seq(
      choice('let', 'const'),
      $.identifier,
      '=',
      $._expression,
      optional(';'),
    ),

    expression_statement: $ => seq(
      $._expression,
      optional(';'),
    ),

    // --- Control Flow ---
    control_flow: $ => choice(
      $.if_block,
      $.for_block,
    ),

    if_block: $ => seq(
      $.if_start,
      repeat($._node),
      repeat($.else_if_clause),
      optional($.else_clause),
      $.if_end,
    ),

    if_start: $ => seq('{', 'if', $._expression, '}'),
    else_if_clause: $ => seq('{', 'else', 'if', $._expression, '}', repeat($._node)),
    else_clause: $ => seq('{', 'else', '}', repeat($._node)),
    if_end: $ => seq('{', '/if', '}'),

    for_block: $ => seq(
      $.for_start,
      repeat($._node),
      $.for_end,
    ),

    for_start: $ => seq(
      '{',
      'for',
      optional('let'),
      $.identifier,
      'of',
      $._expression,
      '}',
    ),
    for_end: $ => seq('{', '/for', '}'),

    // --- Expressions (in templates) ---
    expression: $ => seq(
      '{',
      $._expression,
      '}',
    ),

    // --- Component Tags ---
    component_tag: $ => choice(
      $.self_closing_component,
      $.component_with_children,
    ),

    self_closing_component: $ => seq(
      '<',
      $.component_name,
      repeat($._attribute),
      '/>',
    ),

    component_with_children: $ => seq(
      $.component_start_tag,
      repeat($._node),
      $.component_end_tag,
    ),

    component_start_tag: $ => seq(
      '<',
      $.component_name,
      repeat($._attribute),
      '>',
    ),

    component_end_tag: $ => seq(
      '</',
      $.component_name,
      '>',
    ),

    component_name: $ => /[A-Z][A-Za-z0-9_]*/,

    // --- Dynamic Components ---
    dynamic_component: $ => seq(
      '<',
      '=',
      choice($.string, $.expression_path),
      repeat($._attribute),
      '/>',
    ),

    expression_path: $ => seq('{', $.identifier, '}'),

    // --- Attributes ---
    _attribute: $ => choice(
      $.shorthand_attribute,
      $.expression_attribute,
      $.string_attribute,
      $.boolean_attribute,
    ),

    shorthand_attribute: $ => seq('{', $.identifier, '}'),

    expression_attribute: $ => seq(
      $.attribute_name,
      '=',
      '{',
      $._expression,
      '}',
    ),

    string_attribute: $ => seq(
      $.attribute_name,
      '=',
      $.string,
    ),

    boolean_attribute: $ => $.attribute_name,

    attribute_name: $ => /[a-zA-Z_][a-zA-Z0-9_:-]*/,

    // --- Style/Script Elements ---
    style_element: $ => seq(
      '<style>',
      optional($.raw_text),
      '</style>',
    ),

    script_element: $ => seq(
      '<script>',
      optional($.raw_text),
      '</script>',
    ),

    raw_text: $ => /[^<]+/,

    // --- HTML Elements ---
    html_element: $ => choice(
      $.self_closing_html_tag,
      $.html_element_with_children,
    ),

    self_closing_html_tag: $ => seq(
      '<',
      $.tag_name,
      repeat($._attribute),
      '/>',
    ),

    html_element_with_children: $ => seq(
      $.html_start_tag,
      repeat($._node),
      $.html_end_tag,
    ),

    html_start_tag: $ => seq(
      '<',
      $.tag_name,
      repeat($._attribute),
      '>',
    ),

    html_end_tag: $ => seq(
      '</',
      $.tag_name,
      '>',
    ),

    tag_name: $ => /[a-z][a-z0-9-]*/,

    html_text: $ => /[^{}<]+/,

    html_comment: $ => /<!--[\s\S]*?-->/,

    // --- Expressions (JavaScript subset) ---
    _expression: $ => choice(
      $.identifier,
      $.number,
      $.string,
      $.boolean,
      $.null,
      $.undefined,
      $.template_string,
      $.member_expression,
      $.call_expression,
      $.binary_expression,
      $.unary_expression,
      $.ternary_expression,
      $.array,
      $.object,
      $.parenthesized_expression,
    ),

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    number: $ => /[0-9]+(\.[0-9]+)?/,

    string: $ => choice(
      seq("'", /[^']*/, "'"),
      seq('"', /[^"]*/, '"'),
    ),

    boolean: $ => choice('true', 'false'),
    null: $ => 'null',
    undefined: $ => 'undefined',

    template_string: $ => seq(
      '`',
      repeat(choice(
        /[^`$]+/,
        $.template_substitution,
      )),
      '`',
    ),

    template_substitution: $ => seq('${', $._expression, '}'),

    member_expression: $ => prec.left(1, seq(
      $._expression,
      choice('.', '?.'),
      $.identifier,
    )),

    call_expression: $ => prec.left(2, seq(
      $._expression,
      '(',
      optional($.arguments),
      ')',
    )),

    arguments: $ => seq(
      $._expression,
      repeat(seq(',', $._expression)),
    ),

    binary_expression: $ => choice(
      prec.left(3, seq($._expression, choice('+', '-'), $._expression)),
      prec.left(4, seq($._expression, choice('*', '/', '%'), $._expression)),
      prec.left(5, seq($._expression, choice('===', '!==', '==', '!=', '<=', '>=', '<', '>'), $._expression)),
      prec.left(6, seq($._expression, '&&', $._expression)),
      prec.left(7, seq($._expression, '||', $._expression)),
    ),

    unary_expression: $ => prec.right(8, seq(
      choice('!', '-', '+'),
      $._expression,
    )),

    ternary_expression: $ => prec.right(9, seq(
      $._expression,
      '?',
      $._expression,
      ':',
      $._expression,
    )),

    array: $ => seq(
      '[',
      optional(seq($._expression, repeat(seq(',', $._expression)))),
      ']',
    ),

    object: $ => seq(
      '{',
      optional(seq($.object_property, repeat(seq(',', $.object_property)))),
      '}',
    ),

    object_property: $ => seq(
      choice($.identifier, $.string),
      ':',
      $._expression,
    ),

    parenthesized_expression: $ => seq('(', $._expression, ')'),
  },
});
