-- Neovim configuration for Pico syntax highlighting
-- Use: Plug 'plentico/pico-language', { 'rtp': 'neovim' }
-- Then: require('pico').setup()

local M = {}

-- Check if cursor is in a pico template context (not in frontmatter, script, or style)
function M.in_template_context()
  local line = vim.fn.line('.')
  local col = vim.fn.col('.')
  
  -- Get the syntax group at cursor position
  local syn_id = vim.fn.synID(line, col, 1)
  local syn_name = vim.fn.synIDattr(syn_id, "name")
  
  -- Also check the transparent group
  local trans_id = vim.fn.synID(line, col, 0)
  local trans_name = vim.fn.synIDattr(trans_id, "name")
  
  -- Patterns for excluded regions
  local excluded_patterns = {
    "picoFrontmatter",
    "picoScriptRegion", 
    "picoStyleRegion",
    "^javascript",  -- Embedded JS syntax groups
    "^js",
    "^css",         -- Embedded CSS syntax groups
  }
  
  for _, pattern in ipairs(excluded_patterns) do
    if syn_name:match(pattern) or trans_name:match(pattern) then
      return false
    end
  end
  
  return true
end

-- Setup LuaSnip snippets with context awareness
local function setup_luasnip_snippets()
  local ok, ls = pcall(require, "luasnip")
  if not ok then
    return false
  end
  
  local s = ls.snippet
  local t = ls.text_node
  local i = ls.insert_node
  local f = ls.function_node
  
  -- Condition that checks template context
  local in_template = {
    condition = M.in_template_context,
    show_condition = M.in_template_context,
  }
  
  -- Define pico snippets with context awareness
  local snippets = {
    s({ trig = "{if", name = "if block", dscr = "Pico if block" }, {
      t("{if "), i(1, "condition"), t({ "}", "\t" }),
      i(0),
      t({ "", "{/if}" }),
    }, in_template),
    
    s({ trig = "{if-else", name = "if-else block", dscr = "Pico if-else block" }, {
      t("{if "), i(1, "condition"), t({ "}", "\t" }),
      i(2),
      t({ "", "{else}", "\t" }),
      i(0),
      t({ "", "{/if}" }),
    }, in_template),
    
    s({ trig = "{for", name = "for loop", dscr = "Pico for loop" }, {
      t("{for let "), i(1, "item"), t(" of "), i(2, "items"), t({ "}", "\t" }),
      i(0),
      t({ "", "{/for}" }),
    }, in_template),
    
    s({ trig = "{else", name = "else clause", dscr = "Pico else clause" }, {
      t("{else}"),
    }, in_template),
    
    s({ trig = "{else if", name = "else-if clause", dscr = "Pico else-if clause" }, {
      t("{else if "), i(1, "condition"), t("}"),
    }, in_template),
    
    s({ trig = "{$", name = "expression", dscr = "Pico expression" }, {
      t("{"), i(1, "expression"), t("}"),
    }, in_template),
    
    s({ trig = "<C", name = "component", dscr = "Pico component" }, {
      t("<"), i(1, "Component"), t(" "), i(2, "props"), t(" />"),
    }, in_template),
    
    -- These snippets should work anywhere in pico files
    s({ trig = "---", name = "frontmatter", dscr = "Pico frontmatter" }, {
      t({ "---", "\t" }),
      i(0),
      t({ "", "---" }),
    }),
    
    s({ trig = "prop", name = "prop declaration", dscr = "Pico prop declaration" }, {
      t("prop "), i(1, "name"), i(2, " = "), i(3, "defaultValue"), t(";"),
    }),
    
    s({ trig = "import", name = "import statement", dscr = "Pico import statement" }, {
      t("import "), i(1, "Component"), t(' from "'), i(2, "./path.html"), t('";'),
    }),
    
    s({ trig = "<script", name = "script tag", dscr = "Script tag" }, {
      t({ "<script>", "\t" }),
      i(0),
      t({ "", "</script>" }),
    }),
    
    s({ trig = "<style", name = "style tag", dscr = "Style tag" }, {
      t({ "<style>", "\t" }),
      i(0),
      t({ "", "</style>" }),
    }),
  }
  
  ls.add_snippets("pico", snippets)
  return true
end

-- Setup pico filetype and syntax
function M.setup(opts)
  opts = opts or {}
  
  -- Register pico filetype
  vim.filetype.add({
    extension = {
      pico = 'pico',
    },
    pattern = {
      ['.*%.pico%.html'] = 'pico',
    },
  })
  
  -- Setup context-aware snippets (enabled by default)
  if opts.snippets ~= false then
    -- Defer snippet setup to ensure LuaSnip is loaded
    vim.defer_fn(function()
      local loaded = setup_luasnip_snippets()
      if loaded and opts.snippets_loaded then
        opts.snippets_loaded()
      end
    end, 100)
  end
end

return M
