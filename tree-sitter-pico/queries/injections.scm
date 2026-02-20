; Language injections for Pico templates
; Injects CSS into style elements and JavaScript into script elements

; CSS in <style> tags
(style_element
  (raw_text) @injection.content
  (#set! injection.language "css"))

; JavaScript in <script> tags
(script_element
  (raw_text) @injection.content
  (#set! injection.language "javascript"))
