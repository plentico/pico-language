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

### Installation

The Neovim plugin is located in the `neovim/` subdirectory.

**With vim-plug:**
```vim
Plug 'plentico/pico-language', { 'rtp': 'neovim' }
```

Then in your `init.lua`:
```lua
require('pico').setup()
```

**With lazy.nvim:**
```lua
{
  'plentico/pico-language',
  config = function()
    vim.opt.runtimepath:append(vim.fn.stdpath('data') .. '/lazy/pico-language/neovim')
    require('pico').setup()
  end,
}
```

**With packer:**
```lua
use {
  'plentico/pico-language',
  config = function()
    vim.opt.runtimepath:append(vim.fn.stdpath('data') .. '/site/pack/packer/start/pico-language/neovim')
    require('pico').setup()
  end,
}
```

### Syntax Highlighting Features

The Neovim plugin provides comprehensive syntax highlighting including:

- **Frontmatter** - JavaScript highlighting inside `---` fences with support for the custom `prop` keyword
- **HTML Elements** - Consistent coloring for opening and closing tags
- **Control Structures** - Proper highlighting for `{if}`, `{else}`, `{for}` with keywords, operators, and expressions
- **Embedded CSS** - Full CSS syntax highlighting inside `<style>` tags
- **Embedded JavaScript** - Full JS syntax highlighting inside `<script>` tags and frontmatter
- **Component Tags** - PascalCase components highlighted as types
- **Expressions** - Template expressions `{variable}` and `{expression}` with proper operator highlighting

### File Icons (nvim-web-devicons)

If you use [nvim-web-devicons](https://github.com/nvim-tree/nvim-web-devicons), add custom Pico file icons:

```lua
require('nvim-web-devicons').setup({
  override_by_extension = {
    ['pico'] = {
      icon = '󰗀',
      color = '#22a6ed',
      name = 'Pico',
    },
  },
})
```

### Snippets

#### LuaSnip (Recommended)

If you use [LuaSnip](https://github.com/L3MON4D3/LuaSnip), context-aware snippets are automatically loaded when you call `require('pico').setup()`. 

**Important:** Do NOT manually load the JSON snippets with `lazy_load()` for pico files - the setup function handles this automatically with context awareness. If you have a line like this, remove it:
```lua
-- Remove this line if present:
require("luasnip.loaders.from_vscode").lazy_load({
  paths = { vim.fn.expand("~/.local/share/nvim/lazy/pico-language/neovim/snippets") }
})
```

**Context-aware behavior:** Template snippets like `{if`, `{for`, `{$`, etc. will only trigger in the HTML template section of your `.pico` files. They are automatically disabled inside:
- Frontmatter (`---` fences)
- `<script>` tags
- `<style>` tags

This prevents Pico template snippets from interfering when you're writing JavaScript or CSS.

To disable auto-loaded snippets:
```lua
require('pico').setup({ snippets = false })
```

#### vim-vsnip

If you use [vim-vsnip](https://github.com/hrsh7th/vim-vsnip), add the pico snippets directory to your config:

```lua
-- Add pico snippets directory
-- Adjust the path based on your plugin manager location
vim.g.vsnip_snippet_dirs = { 
  vim.fn.expand('~/.config/nvim/plugged/pico-language/neovim/snippets')  -- vim-plug
  -- Or for lazy.nvim: vim.fn.stdpath('data') .. '/lazy/pico-language/neovim/snippets'
}
```

**Note:** vim-vsnip uses JSON snippets which don't support context awareness. Snippets will be available everywhere in the file.

**Available snippets:**

| Prefix | Description |
|--------|-------------|
| `{if` | If block with `{/if}` |
| `{if-else` | If-else block |
| `{for` | For loop with `{/for}` |
| `{else` | Else clause |
| `{else if` | Else-if clause |
| `---` | Frontmatter template |
| `prop` | Prop declaration |
| `import` | Import statement |
| `<script` | Script tags |
| `<style` | Style tags |
| `<C` | Component tag |

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
3. Convert JSON to XML plist format

## Structure

```
pico-language/
├── vscode/                     # VS Code extension
│   ├── package.json
│   ├── language-configuration.json
│   └── syntaxes/
│       └── pico.tmLanguage.json
├── neovim/                     # Neovim plugin
│   ├── lua/pico/
│   │   └── init.lua
│   ├── syntax/
│   │   └── pico.vim
│   ├── ftdetect/
│   │   └── pico.vim
│   ├── ftplugin/
│   │   └── pico.vim
│   └── snippets/
│       └── pico.json
├── tree-sitter-pico/           # Tree-sitter grammar
│   ├── grammar.js
│   ├── package.json
│   └── queries/
│       ├── highlights.scm
│       └── injections.scm
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
