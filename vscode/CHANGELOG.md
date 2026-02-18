# Changelog

All notable changes to the "Pico Templates by Plentico" extension will be documented in this file.

## [0.0.4] - 2026-02-18

### Fixed
- Snippets no longer add extra `}` when using `{if}` or `{for}` completions
- Removed auto-closing `{` → `}` since Pico control blocks have their own closing syntax
- Adds file extension icon support

## [0.0.3] - 2026-02-17

### Added
- **Snippets/Autocomplete** for common patterns:
  - `if` → If block with `{if}...{/if}`
  - `ife` → If-else block
  - `for` → For loop with `{for let item of items}...{/for}`
  - `prop` → Prop declaration
  - `import` → Import statement
  - `comp` → Component tag
  - `---` → Frontmatter block
- **Comment highlighting** in frontmatter:
  - Single-line comments: `// comment`
  - Block comments: `/* comment */`

## [0.0.2] - 2026-02-17

### Fixed
- Changed display name to "Pico Templates by Plentico" to be unique in marketplace

## [0.0.1] - 2026-02-17

### Added
- Initial release
- Syntax highlighting for Pico template files
- Frontmatter support (`---` blocks)
  - `import` statements
  - `prop` declarations
  - `let`/`const` declarations
- Control flow highlighting
  - `{if}`, `{else if}`, `{else}`, `{/if}`
  - `{for}`, `{/for}`
- Expression highlighting `{expression}`
- Component tag highlighting (PascalCase tags)
- Dynamic component support `<="path" />`
- Embedded CSS in `<style>` tags
- Embedded JavaScript in `<script>` tags
- HTML base syntax support
- Bracket matching and auto-closing
- File associations: `.pico`, `.pico.html`
