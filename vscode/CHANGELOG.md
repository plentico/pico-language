# Changelog

All notable changes to the "Pico Language Support" extension will be documented in this file.

## [0.1.0] - 2026-02-17

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
