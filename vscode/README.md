# Pico Language Support

Syntax highlighting for [Pico](https://github.com/plentico/pico) template files.

## Features

- **Frontmatter** (`---`) with imports, props, and let declarations
- **Control flow**: `{if}`, `{else if}`, `{else}`, `{/if}`, `{for}`, `{/for}`
- **Expressions**: `{variableName}`, `{expression}`
- **Components**: `<ComponentName />` (PascalCase = component)
- **Dynamic components**: `<="./path.html" />`, `<='{variable}' />`
- **Embedded CSS** in `<style>` tags
- **Embedded JavaScript** in `<script>` tags
- **HTML** base syntax

## File Extensions

The extension recognizes:
- `.pico` files
- `.pico.html` files

## Example

```pico
---
import Header from "./header.html";
import Card from "./card.html";

prop title;
prop items = [];

let count = items.length;
---

<Header {title} />

{if count > 0}
  {for let item of items}
    <Card title={item.name} />
  {/for}
{else}
  <p>No items found</p>
{/if}

<style>
  p { color: gray; }
</style>
```

## What is Pico?

[Pico](https://github.com/plentico/pico) is a pure-Go, component-based templating system with:
- Scoped CSS
- JavaScript expressions
- Control flow logic
- Component composition
- Client-side reactivity via [Pattr](https://github.com/plentico/pattr)

## Related

- [Pico](https://github.com/plentico/pico) - The templating engine
- [pico-tests](https://github.com/plentico/pico-tests) - Example templates
- [Pattr](https://github.com/plentico/pattr) - Client-side reactivity
- [Plenti](https://github.com/plentico/plenti) - Static site generator using Pico
