<?php
$root = 'D:/Github/Utopia_react/frontend';

// 1. Restore the "Changer" button in La Caisse top bar
$pos = "$root/src/pages/PosPage.jsx";
$c = file_get_contents($pos);
$changer = <<<'JS'
<button
              onClick={() => setPosMode('login')}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-xs"
              title="Changer de vendeur"
            >
              <Lock className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
              <span>Changer</span>
            </button>
JS;
// only the occurrence inside the caisse top bar (right after the Vendeur badge)
$c = preg_replace(
  '#(Vendeur : <span className="uppercase text-amber-600">\{currentCashier\.cashier\}</span>\s*</div>\s*)<button\s+onClick=\{\(\) => setPosMode\(\'login\'\)\}.*?</button>#s',
  '$1' . $changer, $c, 1, $n1);
file_put_contents($pos, $c);
echo "Changer restored: $n1\n";

// 2. Rename StellarSoft / Utopya -> Utopia
$files = array_merge(
  glob("$root/src/*.{tsx,jsx,ts}", GLOB_BRACE),
  glob("$root/src/*/*.{tsx,jsx,ts}", GLOB_BRACE),
  glob("$root/src/*/*/*.{tsx,jsx,ts}", GLOB_BRACE),
  ["$root/index.html", "$root/README.md"]
);
$total = 0;
foreach ($files as $f) {
  $s = file_get_contents($f);
  $o = $s;
  $s = str_replace('support@stellarsoft.fr', 'support@utopia.fr', $s);
  $s = str_replace(['StellarSoft', 'Utopya', 'stellarsoft'], 'Utopia', $s);
  $s = str_replace('(anciennement Utopia V1.0 2024)', '(Utopia V1.0 2024)', $s);
  if ($s !== $o) { file_put_contents($f, $s); $total++; echo "renamed in: " . basename($f) . "\n"; }
}
echo "files renamed: $total\n";

// 3. Unified 2px border for every bordered button (same as the caisse digits)
$css = "$root/src/styles/globals.css";
$s = file_get_contents($css);
if (strpos($s, 'Unified button border') === false) {
  $s .= <<<'CSS'

/* Unified button border: every bordered button uses 2px, like the caisse keypad digits.
   Element + class selector outranks Tailwind's single-class .border (1px). */
button.border,
button.border-2,
[role="button"].border {
  border-width: 2px;
}
CSS;
  file_put_contents($css, $s);
  echo "border rule added\n";
}
