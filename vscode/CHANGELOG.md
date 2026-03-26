# Changelog

All notable changes to the "Pico Templates by Plentico" extension will be documented in this file.

## [0.0.17] - 2026-03-25

### Fixed
- Fix syntax highlighting for additional loop variations:
  - Object key iterations: `{for let item in items}`
  - Array destructuring: `{for let [key, value] of rootFieldEntries}`

## [0.0.16] - 2026-03-25

### Added
- Syntax highlighting for expressions inside quoted HTML attribute values (e.g., `type="{typeof value === 'number' ? 'number' : 'text'}"`)

## [0.0.15] - 2026-03-24

### Added
- Syntax recognition for CSS classes that are potentially being added via If Statement [Modifiers](https://github.com/plentico/pico/blob/master/docs/MODIFIERS.md) (stops warnings that classes are unused).

## [0.0.14] - 2026-03-11

### Fixed
- Fix bug that was warning compound selectors that start with a valid #ID as being unmatched
- Auto-indent after opening `<html>` and `<style>` tags
- Only trigger fence snippet when typing "---" and do not trigger on the word "fence" itself

## [0.0.13] - 2026-03-11

### Added
- Check HTML hierarchy to ensure CSS selectors exist in the specific combination and apply warnings when mismatched

### Fixed
- Highlight deepest non-matching selector instead of highlighting ancestor element
- Apply highlight to deepest unused selector even when duplicate elements are present (e.g. span span)
- Fix compound selector issues (e.g. span.myclass or .class1.class2)

## [0.0.12] - 2026-03-11

### Fixed
- Identify descendant CSS selectors when unused

## [0.0.11] - 2026-03-08

### Fixed
- Unident closing HTML tags when completing Emmet suggestions
- Autoclose single and double quotes when setting attribute values on HTML elements
- Display warnings when CSS selectors in `<style>` tags aren't found in the component
- Fix Comp closing tags now that angle brackets `<` are no longer autoclosing

## [0.0.10] - 2026-03-07

### Added
- **HTML tag completion** - Type `<h` and get suggestions for `<h1>`, `<h2>`, etc.
- **HTML closing tag auto-completion** - Type `<` after content and get automatic closing tag suggestions
- **CSS completion inside `<style>` blocks** - Full CSS IntelliSense support
- **Emmet abbreviations** - Type `div.container` and expand with Tab for HTML shortcuts
- Configured `embeddedLanguages` to properly enable HTML and CSS language features
- Added `configurationDefaults` for better editor suggestions in Pico files

### Fixed
- HTML tag suggestions now work properly in `.pico` files
- CSS autocomplete now functions correctly inside `<style>` tags
- Closing tags are now automatically suggested after typing opening tags

## [0.0.9] - 2026-03-06

### Added
- Treat content inside `<style>` tags as CSS, enabling CSS autocomplete
- Limit "Import" and "Prop Declaration" snippets to only frontmatter / fence

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
