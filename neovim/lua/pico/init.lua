-- Neovim configuration for Pico syntax highlighting
-- Use: Plug 'plentico/pico-language', { 'rtp': 'neovim' }
-- Then: require('pico').setup()

local M = {}

-- Setup pico filetype and syntax
function M.setup()
  -- Register pico filetype
  vim.filetype.add({
    extension = {
      pico = 'pico',
    },
    pattern = {
      ['.*%.pico%.html'] = 'pico',
    },
  })
end

return M
