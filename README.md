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

**With lazy.nvim:**
```lua
{
  'plentico/pico-language',
  config = function()
    require('pico').setup()
  end,
}
```

**With vim-plug:**
```vim
Plug 'plentico/pico-language'
```
```lua
-- Add to your init.lua after plugins are loaded:
require('pico').setup()
```

**With packer:**
```lua
use {
  'plentico/pico-language',
  config = function()
    require('pico').setup()
  end,
}
```

### File Icons (nvim-web-devicons)

If you use [nvim-web-devicons](https://github.com/nvim-tree/nvim-web-devicons), add custom Pico file icons:

```lua
require('nvim-web-devicons').setup({
  override_by_extension = {
    ['pico'] = {
      icon = '󰗀',  -- Nerd Font: nf-md-file_code (use any icon you prefer)
      color = '#22a6ed',
      name = 'Pico',
    },
  },
})
```

This works automatically with nvim-tree, lualine, bufferline, and other plugins that use nvim-web-devicons.

**Note:** You need to declare `require('nvim-web-devicons').setup({...})` _before_ other setups that may call nvim-web-devicons (for example before `require('nvim-tree').setup({...})` is called). You may need to close and reopen nvim as well.

### Tree-sitter (Optional)

For enhanced syntax highlighting with tree-sitter:

1. Build the tree-sitter parser:
```bash
cd tree-sitter-pico
npm install
npm run build
```

2. Copy query files:
```bash
mkdir -p ~/.config/nvim/queries/pico
cp tree-sitter-pico/queries/*.scm ~/.config/nvim/queries/pico/
```

### Fallback Vim Syntax

The plugin includes vim syntax highlighting as fallback (used automatically if tree-sitter is not available):

```lua
require('pico').setup({ force_vim_syntax = true })
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
├── lua/                        # Neovim plugin (for vim-plug, lazy, packer)
│   └── pico/
│       └── init.lua            # Main plugin module
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

## Publishing (Maintainers)

### One-time Setup (Free - No Credit Card Required)

1. **Create an Azure DevOps Organization** (needed for PAT)
   - Go to https://dev.azure.com
   - Sign in with Microsoft or GitHub account
   - Click "Create new organization" (requires subscription now)

2. **Create Personal Access Token (PAT)**
   - In Azure DevOps, click User Settings (profile + gear icon) → Personal Access Tokens
   - Click "New Token"
   - Name: `vsce-publish`
   - Organization: **All accessible organizations** (important!)
   - Expiration: Set to max (1 year) or as desired
   - Scopes: Click "Show all scopes" → Scroll to **Marketplace** → Check **Manage**
   - Click "Create" and **copy the token** (you won't see it again!)

3. **Create a Publisher on VS Code Marketplace**
   - Go to https://marketplace.visualstudio.com/manage/publishers
   - Sign in with the **same account** used for Azure DevOps
   - Click "Create publisher"
   - Publisher ID: `plentico`
   - Display name: `Plentico`

4. **Add Secrets to GitHub Repository**
   - Go to repo Settings → Secrets and variables → Actions
   - Add `VSCE_PAT` with your Azure DevOps PAT

5. **(Optional) Open VSX for VSCodium**
   - Create account at https://open-vsx.org
   - Get access token from your account settings
   - Add `OVSX_PAT` secret to GitHub

### Publishing

The extension auto-publishes when you push a version tag:

```bash
# 1. Update version in vscode/package.json
# 2. Update vscode/CHANGELOG.md
# 3. Commit changes
git add -A
git commit -m "Release v0.1.0"

# 4. Create and push a version tag
git tag v0.1.0
git push origin v0.1.0
```

GitHub Actions will automatically build and publish to:
- VS Code Marketplace
- Open VSX (for VSCodium)

**Alternative triggers:**
- Create a GitHub Release (also works)
- Manually: Actions → "Publish VS Code Extension" → Run workflow

### Manual Publishing

```bash
cd vscode
npm install -g @vscode/vsce
vsce package               # Creates .vsix file
vsce publish               # Publishes to marketplace (needs PAT)
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
