-- Neovim configuration for Pico syntax highlighting
-- Add this to your Neovim config or use as a plugin

local M = {}

-- Register pico filetype
vim.filetype.add({
  extension = {
    pico = 'pico',
  },
  pattern = {
    ['.*%.pico%.html'] = 'pico',
  },
})

-- Setup tree-sitter parser (requires tree-sitter-pico to be built)
function M.setup_treesitter()
  local parser_config = require('nvim-treesitter.parsers').get_parser_configs()

  parser_config.pico = {
    install_info = {
      url = 'https://github.com/plentico/pico-language',
      files = { 'tree-sitter-pico/src/parser.c' },
      branch = 'main',
    },
    filetype = 'pico',
  }

  -- Register the parser for .pico and .pico.html files
  vim.treesitter.language.register('pico', 'pico')
end

-- Fallback vim syntax (if tree-sitter not available)
function M.setup_vim_syntax()
  vim.cmd([[
    augroup pico_syntax
      autocmd!
      autocmd BufRead,BufNewFile *.pico,*.pico.html setfiletype pico
      autocmd FileType pico setlocal syntax=html
      autocmd FileType pico syntax match picoFrontmatter /^---\_.\{-}^---/
      autocmd FileType pico syntax match picoControlKeyword /{\(if\|else\|for\|\/if\|\/for\)/ contained
      autocmd FileType pico syntax match picoExpression /{[^}]*}/ contains=picoControlKeyword
      autocmd FileType pico syntax match picoComponent /<[A-Z][A-Za-z0-9_]*/
      autocmd FileType pico highlight link picoFrontmatter Comment
      autocmd FileType pico highlight link picoControlKeyword Keyword
      autocmd FileType pico highlight link picoExpression Special
      autocmd FileType pico highlight link picoComponent Type
    augroup END
  ]])
end

-- Full setup
function M.setup(opts)
  opts = opts or {}

  -- Try tree-sitter first, fall back to vim syntax
  local ok, _ = pcall(require, 'nvim-treesitter')
  if ok and not opts.force_vim_syntax then
    M.setup_treesitter()
  else
    M.setup_vim_syntax()
  end
end

return M
