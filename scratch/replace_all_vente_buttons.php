<?php
$posPageFile = 'D:/Github/Utopia_react/frontend/src/pages/PosPage.jsx';
$content = file_get_contents($posPageFile);

$replacement = <<<'JS'
<button
            onClick={() => setPosMode('login')}
            className="w-full bg-[#111425] hover:bg-slate-900 border-2 border-slate-800 hover:border-amber-500/50 rounded-2xl p-3 shadow-md transition flex items-center space-x-3.5 text-left group active:scale-98"
            title="Ouvrir la caisse et lancer les ventes"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-black shadow-md shadow-amber-500/20 group-hover:scale-105 transition shrink-0">
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-base font-black text-white tracking-wide truncate">
                Ventes En Caisse
              </h2>
              <span className="text-xs text-slate-400 font-semibold block truncate">
                {salesList.length} ventes répertoriées
              </span>
            </div>
          </button>
JS;

$newContent = preg_replace(
    '#<button\s+onClick=\{\(\)\s*=>\s*setPosMode\(\'login\'\)\}\s+className="w-full bg-white.*?<\/button>#s',
    $replacement,
    $content
);

if ($newContent !== $content) {
    file_put_contents($posPageFile, $newContent);
    echo "Replaced Ventes button with dark card and amber icon!\n";
} else {
    echo "Pattern not found!\n";
}
