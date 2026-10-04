<?php
$posPageFile = 'D:/Github/Utopia_react/frontend/src/pages/PosPage.jsx';

$content = file_get_contents($posPageFile);

// Replace the Ventes En Caisse button in Sales Hub with the exact dark badge style from the user photo
$target = <<<'JS'
          {/* Top Master Button: Ventes En Caisse -> Opens Cashier Login */}
          <button
            onClick={() => setPosMode('login')}
            className="w-full bg-white hover:bg-amber-50 border-2 border-amber-500 rounded-2xl p-3 shadow-md transition flex items-center space-x-3 text-left group active:scale-98"
            title="Ouvrir la caisse et lancer les ventes"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-black shadow-md shadow-amber-500/25 group-hover:scale-105 transition">
              {/* Cash register visual icon */}
              <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-base font-black text-slate-900 tracking-tight block">
                Ventes En Caisse
              </span>
              <span className="text-[11px] text-amber-600 font-bold block">
                Identification du vendeur →
              </span>
            </div>
          </button>
JS;

$replacement = <<<'JS'
          {/* Top Master Button: Ventes En Caisse matching exact User Photo Style */}
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

if (strpos($content, $target) !== false) {
    $content = str_replace($target, $replacement, $content);
    file_put_contents($posPageFile, $content);
    echo "Successfully updated Ventes button to match exact photo style\n";
} else {
    echo "Target string not found in PosPage.jsx\n";
}
