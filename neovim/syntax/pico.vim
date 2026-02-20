" Vim syntax file for Pico templates
" Language: Pico
" Maintainer: Plentico
" Latest Revision: 2024

if exists("b:current_syntax")
  finish
endif

" ============================================================================
" Embedded Languages
" ============================================================================

" Include JavaScript syntax for script tags and frontmatter
syntax include @picoJavaScript syntax/javascript.vim
unlet! b:current_syntax

" Include CSS syntax for style tags
syntax include @picoCSS syntax/css.vim
unlet! b:current_syntax

" ============================================================================
" Frontmatter
" ============================================================================

" The frontmatter region between --- delimiters at the start of file
syntax region picoFrontmatter start=/\%^---\s*$/ end=/^---\s*$/ keepend contains=picoFrontmatterDelimiter,@picoJavaScript

" Frontmatter delimiters (the --- lines)
syntax match picoFrontmatterDelimiter /^---\s*$/ contained

" 'prop' keyword - custom Pico keyword in frontmatter
syntax match picoPropKeyword /\C\<prop\>/ contained containedin=picoFrontmatter

" ============================================================================
" Control Flow Structures
" ============================================================================

" If blocks
syntax region picoIfExpression start=/\C{if\s\+/ end=/}/ contains=picoControlBraceOpen,picoControlKeywordIf,@picoExprContents,picoControlBraceClose oneline keepend
syntax region picoElseIfExpression start=/\C{else\s\+if\s\+/ end=/}/ contains=picoControlBraceOpen,picoControlKeywordElse,picoControlKeywordIf,@picoExprContents,picoControlBraceClose oneline keepend
syntax match picoElseStatement /\C{else}/ contains=picoControlBraceOpen,picoControlKeywordElse,picoControlBraceClose
syntax match picoEndIf /\C{\/if}/ contains=picoControlBraceOpen,picoControlKeywordEndIf,picoControlBraceClose

" For blocks
syntax region picoForExpression start=/\C{for\s\+/ end=/}/ contains=picoControlBraceOpen,picoControlKeywordFor,picoForKeyword,@picoExprContents,picoControlBraceClose oneline keepend
syntax match picoEndFor /\C{\/for}/ contains=picoControlBraceOpen,picoControlKeywordEndFor,picoControlBraceClose

" Control structure components
syntax match picoControlBraceOpen /{/ contained
syntax match picoControlBraceClose /}/ contained
syntax match picoControlKeywordIf /\C\<if\>/ contained
syntax match picoControlKeywordElse /\C\<else\>/ contained
syntax match picoControlKeywordFor /\C\<for\>/ contained
syntax match picoControlKeywordEndIf /\C\/if/ contained
syntax match picoControlKeywordEndFor /\C\/for/ contained
syntax match picoForKeyword /\C\<let\>/ contained
syntax match picoForKeyword /\C\<of\>/ contained

" ============================================================================
" Template Expressions
" ============================================================================

" Expression cluster
syntax cluster picoExprContents contains=picoExprIdentifier,picoExprNumber,picoExprStringDouble,picoExprStringSingle,picoExprOperator,picoExprBoolean,picoExprDot

syntax match picoExprIdentifier /\<[a-zA-Z_][a-zA-Z0-9_]*\>/ contained
syntax match picoExprNumber /\<\d\+\(\.\d\+\)\?\>/ contained
syntax match picoExprOperator /[+\-*/%<>=!&|?:]/ contained
syntax match picoExprOperator /===\|!==\|==\|!=\|<=\|>=\|&&\|||/ contained
syntax keyword picoExprBoolean true false contained
syntax match picoExprDot /\./ contained
syntax region picoExprStringDouble start=/"/ end=/"/ contained oneline
syntax region picoExprStringSingle start=/'/ end=/'/ contained oneline

" General expression interpolation {variable} or {expression}
syntax region picoExpression start=/\C{\(if\>\|for\>\|else\>\|\/if}\|\/for}\)\@!/ end=/}/ contains=@picoExprContents oneline keepend
      \ containedin=ALLBUT,picoFrontmatter,picoStyleRegion,picoScriptRegion,picoComment,picoIfExpression,picoElseIfExpression,picoForExpression

" ============================================================================
" HTML Elements (defined before script/style so those take precedence)
" ============================================================================

" HTML tags - lowercase (\C = case sensitive)
syntax match picoHtmlTagName /\C\(<\/\?\)\@<=[a-z][a-z0-9-]*/ contained
syntax region picoHtmlTag start=/\C<[a-z]/ end=/>/ contains=picoHtmlTagName,picoHtmlAttr,picoHtmlString,picoExpression keepend
syntax region picoHtmlEndTag start=/\C<\/[a-z]/ end=/>/ contains=picoHtmlTagName keepend

" HTML attributes
syntax match picoHtmlAttr /\s\+[a-zA-Z_:][a-zA-Z0-9_:-]*/ contained
syntax region picoHtmlString start=/"/ end=/"/ contained oneline
syntax region picoHtmlString start=/'/ end=/'/ contained oneline

" ============================================================================
" Component Tags (PascalCase)
" ============================================================================

" Components must start with uppercase (\C = case sensitive)
syntax match picoComponentName /\C\(<\/\?\)\@<=[A-Z][A-Za-z0-9_]*/ contained
syntax region picoComponentTag start=/\C<[A-Z]/ end=/\/\?>/ contains=picoComponentName,picoHtmlAttr,picoHtmlString,picoExpression keepend
syntax region picoComponentEndTag start=/\C<\/[A-Z]/ end=/>/ contains=picoComponentName keepend

" ============================================================================
" Script/Style Elements (defined LAST to take precedence over HTML)
" ============================================================================

" Script tag with embedded JavaScript (\C = case sensitive)
syntax region picoScriptRegion matchgroup=picoScriptTag start=/\C<script>/ end=/\C<\/script>/ contains=@picoJavaScript keepend

" Style tag with embedded CSS (\C = case sensitive)
syntax region picoStyleRegion matchgroup=picoStyleTag start=/\C<style>/ end=/\C<\/style>/ contains=@picoCSS keepend

" ============================================================================
" Comments
" ============================================================================

syntax region picoComment start=/<!--/ end=/-->/ contains=@Spell

" ============================================================================
" Highlighting
" ============================================================================

" Frontmatter
highlight default link picoFrontmatterDelimiter PreProc
highlight default link picoPropKeyword Keyword

" Script/Style tags (use Statement for better color support)
highlight default link picoScriptTag Statement
highlight default link picoStyleTag Statement

" HTML elements (use Function/Identifier for better color support)
highlight default link picoHtmlTagName Function
highlight default link picoHtmlTag Normal
highlight default link picoHtmlEndTag Normal
highlight default link picoHtmlAttr Type
highlight default link picoHtmlString String

" Control structures
highlight default link picoControlBraceOpen Special
highlight default link picoControlBraceClose Special
highlight default link picoControlKeywordIf Conditional
highlight default link picoControlKeywordElse Conditional
highlight default link picoControlKeywordFor Repeat
highlight default link picoControlKeywordEndIf Conditional
highlight default link picoControlKeywordEndFor Repeat
highlight default link picoForKeyword Keyword

" Expressions
highlight default link picoExprIdentifier Identifier
highlight default link picoExprNumber Number
highlight default link picoExprStringDouble String
highlight default link picoExprStringSingle String
highlight default link picoExprOperator Operator
highlight default link picoExprBoolean Boolean

" Components
highlight default link picoComponentName Type

" Comments
highlight default link picoComment Comment

let b:current_syntax = "pico"
