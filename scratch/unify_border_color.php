<?php
$css = 'D:/Github/Utopia_react/frontend/src/styles/globals.css';
$s = file_get_contents($css);
if (strpos($s, 'Unified neutral border colour') === false) {
  $s = rtrim($s) . "\n" . <<<'CSS'

/* Unified neutral border colour: light greys (slate-100/200) are almost invisible
   on the light background, so every neutral control border uses slate-300 (#cbd5e1),
   the same grey as the caisse keypad digits. Coloured borders (rose, amber...) are untouched. */
button.border-slate-100,
button.border-slate-200,
[role="button"].border-slate-200,
.cursor-pointer.border-slate-200,
input.border-slate-200,
select.border-slate-200,
textarea.border-slate-200 {
  border-color: #cbd5e1;
}
button.border-slate-100:hover,
button.border-slate-200:hover,
.cursor-pointer.border-slate-200:hover {
  border-color: #94a3b8;
}
CSS;
  file_put_contents($css, $s);
}
echo "ok\n";
