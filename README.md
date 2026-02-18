# Pico Language Support

Syntax highlighting for [Pico](https://github.com/plentico/pico) template files across multiple editors.

## Features

- Frontmatter (`---`) with imports, props, and let declarations
- Control flow: `{if}`, `{else if}`, `{else}`, `{/if}`, `{for}`, `{/for}`
- Expressions: `{variableName}`, `{expression}`
- Components: `<ComponentName />` (capital letter)
- Dynamic components: `<="./path.html" />`, `<='{variable}' />`
- Embedded CSS in `<style>` tags
- Embedded JavaScript in `<script>` tags
- HTML base syntax

## VS Code / VSCodium

### Install from Source

```bash
cd vscode
npm install -g @vscode/vsce  # If you don't have vsce
vsce package
code --install-extension pico-language-0.1.0.vsix
```

### Manual Install

1. Copy the `vscode` folder to `~/.vscode/extensions/pico-language`
2. Restart VS Code

### File Extensions

The extension recognizes:
- `.pico` files
- `.pico.html` files

## Neovim

### With nvim-treesitter (Recommended)

1. Build the tree-sitter parser:

```bash
cd tree-sitter-pico
npm install
npm run build
```

2. Add to your Neovim config:

```lua
-- In your init.lua or plugins config
require('pico-language.nvim.pico').setup()

-- Or with lazy.nvim
{
  dir = '/path/to/pico-language',
  config = function()
    require('nvim.pico').setup()
  end,
}
```

3. Copy query files:

```bash
mkdir -p ~/.config/nvim/queries/pico
cp tree-sitter-pico/queries/*.scm ~/.config/nvim/queries/pico/
```

### Without Tree-sitter (Fallback)

The Neovim config includes a vim syntax fallback:

```lua
require('nvim.pico').setup({ force_vim_syntax = true })
```

## Helix

Helix uses tree-sitter natively. Add to `~/.config/helix/languages.toml`:

```toml
[[language]]
name = "pico"
scope = "source.pico"
injection-regex = "pico"
file-types = ["pico", "pico.html"]
roots = []
comment-token = "<!--"
indent = { tab-width = 2, unit = "  " }

[language.auto-pairs]
'(' = ')'
'{' = '}'
'[' = ']'
'"' = '"'
"'" = "'"
'<' = '>'

[[grammar]]
name = "pico"
source = { git = "https://github.com/plentico/pico-language", subpath = "tree-sitter-pico" }
```

Then run:
```bash
helix --grammar fetch
helix --grammar build
```

## Sublime Text

The TextMate grammar can be converted for Sublime Text:

1. Copy `vscode/syntaxes/pico.tmLanguage.json` to your Sublime packages
2. Rename to `Pico.tmLanguage`
3. Convert JSON to XML plist format (many online converters available)

## Structure

```
pico-language/
├── vscode/                     # VS Code extension
│   ├── package.json            # Extension manifest
│   ├── language-configuration.json
│   └── syntaxes/
│       └── pico.tmLanguage.json  # TextMate grammar
├── tree-sitter-pico/           # Tree-sitter grammar
│   ├── grammar.js              # Grammar definition
│   ├── package.json
│   └── queries/
│       └── highlights.scm      # Highlight queries
├── nvim/                       # Neovim configuration
│   └── pico.lua                # Setup module
└── README.md
```

## Syntax Highlighting Examples

### Frontmatter
```pico
---
import Header from "./header.html";
import Card from "./card.html";

prop title;
prop items = [];

let count = items.length;
---
```

### Control Flow
```pico
{if count > 0}
  <p>Found {count} items</p>
{else}
  <p>No items found</p>
{/if}

{for let item of items}
  <Card title={item.name} />
{/for}
```

### Components
```pico
<Header title="My Page" />

<Card {title} count={count + 1}>
  <p>Content here</p>
</Card>

<="./dynamic.html" {props} />
```

## Contributing

1. Fork the repository
2. Make changes to the grammar files
3. Test in your editor
4. Submit a pull request

## Related

- [Pico](https://github.com/plentico/pico) - Pure-Go component-based templating system
- [pico-tests](https://github.com/plentico/pico-tests) - Example templates and e2e tests
- [Pattr](https://github.com/plentico/pattr) - Client-side reactivity library
