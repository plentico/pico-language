" Filetype plugin for Pico templates

if exists("b:did_ftplugin")
  finish
endif
let b:did_ftplugin = 1

" Use HTML-like settings
setlocal commentstring=<!--%s-->
setlocal comments=s:<!--,m:\ \ \ \ ,e:-->

" Indentation
setlocal tabstop=2
setlocal shiftwidth=2
setlocal softtabstop=2
setlocal expandtab

" Undo settings when switching filetypes
let b:undo_ftplugin = "setlocal commentstring< comments< tabstop< shiftwidth< softtabstop< expandtab<"
