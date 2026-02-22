# Changelog

All notable changes to the "Pico Templates by Plentico" extension will be documented in this file.

## [0.0.8] - 2026-02-21

### Added
- Disabled the "abc" word bases suggestions by default
- Added new configuration option: `pico.enableWordBasedSuggestions`

### Changed
- Simplified frontmatter / fence autocompletion
- Removed duplicate closing angle bracket > from script and style snippets because of element auto-closing

## [0.0.7] - 2026-02-18

### Added
- **Custom Pico icon for Material Icon Theme** - auto-configures with relative path to your custom `pico.svg`
- Material Icon Theme users now see your custom Pico icon instead of generic HTML icon

### Changed
- Improved icon configuration to use extension-relative paths

## [0.0.6] - 2026-02-18

### Changed
- Add native file icon support so .pico and .pico.html files show the Plenti icon when using VS Code's default icon theme (Seti)

## [0.0.5] - 2026-02-18

### Added
- **Native file icon** - custom `.pico` file icon works with ALL VS Code icon themes (Seti, Minimal, Material, etc.)
- Fallback auto-config for Material Icon Theme and vscode-icons

### Fixed
- Snippets work correctly with `{` auto-closing - trailing `}` omitted since auto-close adds it

## [0.0.4] - 2026-02-18

### Fixed
- Snippets no longer add extra `}` when using `{if}` or `{for}` completions
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
