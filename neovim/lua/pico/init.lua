-- Neovim configuration for Pico syntax highlighting
-- Use: Plug 'plentico/pico-language', { 'rtp': 'neovim' }
-- Then: require('pico').setup()

local M = {}

-- Check if cursor is in a pico template context (not in frontmatter, script, or style)
-- Uses buffer parsing for reliable detection
function M.in_template_context()
  local bufnr = vim.api.nvim_get_current_buf()
  local cursor = vim.api.nvim_win_get_cursor(0)
  local line_num = cursor[1]  -- 1-indexed
  local lines = vim.api.nvim_buf_get_lines(bufnr, 0, -1, false)
  
  -- Track regions
  local in_frontmatter = false
  local in_script = false
  local in_style = false
  local frontmatter_count = 0
  
  for i, line in ipairs(lines) do
    if i > line_num then
      break
    end
    
    -- Check for frontmatter delimiters (must be at start of file)
    if line:match("^%-%-%-") then
      frontmatter_count = frontmatter_count + 1
      if frontmatter_count == 1 then
        in_frontmatter = true
      elseif frontmatter_count == 2 then
        in_frontmatter = false
      end
    end
    
    -- Check for script tags
    if line:match("<script[^>]*>") then
      in_script = true
    end
    if line:match("</script>") then
      in_script = false
    end
    
    -- Check for style tags
    if line:match("<style[^>]*>") then
      in_style = true
    end
    if line:match("</style>") then
      in_style = false
    end
  end
  
  -- Return false if we're in any excluded region
  if in_frontmatter or in_script or in_style then
    return false
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
  local c = ls.choice_node
  local sn = ls.snippet_node
  local d = ls.dynamic_node
  
  -- Wrapper function that checks context and returns empty if not in template
  local function template_only(nodes)
    return d(1, function()
      if M.in_template_context() then
        return sn(nil, nodes)
      else
        return sn(nil, {})
      end
    end)
  end
  
  -- Clear any existing pico snippets (e.g., from JSON lazy_load)
  -- This ensures only context-aware snippets are used
  ls.cleanup("pico")
  
  -- Condition that checks template context
  local function cond_fn()
    return M.in_template_context()
  end
  
  local in_template = {
    condition = cond_fn,
    show_condition = cond_fn,
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

-- Setup LSP for embedded JS/CSS completion
local function setup_lsp(opts)
  -- Get user's capabilities (from nvim-cmp if available)
  local capabilities = vim.lsp.protocol.make_client_capabilities()
  local cmp_ok, cmp_nvim_lsp = pcall(require, "cmp_nvim_lsp")
  if cmp_ok then
    capabilities = cmp_nvim_lsp.default_capabilities(capabilities)
  end
  
  -- Merge with user-provided capabilities
  if opts.capabilities then
    capabilities = vim.tbl_deep_extend("force", capabilities, opts.capabilities)
  end
  
  -- Use vim.lsp.config (Neovim 0.11+) if available, fall back to lspconfig
  if vim.lsp.config then
    -- Neovim 0.11+ native LSP config
    -- HTML language server handles embedded CSS and JavaScript in <style> and <script> tags
    vim.lsp.config("html", {
      capabilities = capabilities,
      filetypes = { "html", "pico" },
      on_attach = opts.on_attach,
      init_options = {
        provideFormatter = false,
        embeddedLanguages = {
          css = true,
          javascript = true,
        },
      },
    })
    vim.lsp.enable("html")
    
    -- Only enable separate CSS language server if explicitly requested
    -- (HTML LS already handles CSS inside <style> tags)
    if opts.cssls == true then
      vim.lsp.config("cssls", {
        capabilities = capabilities,
        filetypes = { "css", "scss", "less" },  -- Don't include pico
        on_attach = opts.on_attach,
      })
      vim.lsp.enable("cssls")
    end
  else
    -- Fallback to lspconfig for older Neovim versions
    local lspconfig_ok, lspconfig = pcall(require, "lspconfig")
    if not lspconfig_ok then
      return false
    end
    
    if lspconfig.html then
      lspconfig.html.setup({
        capabilities = capabilities,
        filetypes = { "html", "pico" },
        on_attach = opts.on_attach,
        init_options = {
          provideFormatter = false,
          embeddedLanguages = {
            css = true,
            javascript = true,
          },
        },
      })
    end
    
    -- Only enable separate CSS language server if explicitly requested
    if opts.cssls == true and lspconfig.cssls then
      lspconfig.cssls.setup({
        capabilities = capabilities,
        filetypes = { "css", "scss", "less" },  -- Don't include pico
        on_attach = opts.on_attach,
      })
    end
  end
  
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
  
  -- Setup LSP for embedded language support (disabled by default)
  -- Enable with: require('pico').setup({ lsp = true })
  if opts.lsp then
    vim.defer_fn(function()
      setup_lsp(type(opts.lsp) == "table" and opts.lsp or {})
    end, 100)
  end
end

return M
