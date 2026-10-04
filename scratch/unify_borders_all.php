<?php
$css = 'D:/Github/Utopia_react/frontend/src/styles/globals.css';
$s = file_get_contents($css);
$s = preg_replace('#/\* Unified button border.*?\}\s*$#s', '', $s);
$s = rtrim($s) . "\n" . <<<'CSS'

/* Unified control border: 2px everywhere, like the caisse keypad digits.
   Element/attribute + class selectors outrank Tailwind's single-class .border (1px).
   Each control keeps its own border colour; only the thickness is unified. */
button.border,
button.border-2,
[role="button"].border,
.cursor-pointer.border,
input.border,
select.border,
textarea.border {
  border-width: 2px;
}
CSS;
file_put_contents($css, $s);
echo "ok\n";
