const fs = require('fs');

const filePath = 'D:/Github/Utopia_react/frontend/src/components/LaCaisseWindow.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /\{\/\* 2\. TOP RIBBON: ARTICLE INFO[\s\S]*?\{\/\* 3\. MAIN WORKSPACE/;

const replacement = `{/* 2. TOP RIBBON: ARTICLE INFO, CLIENT, AND TOTAL CARD */}
      <div className="bg-white border-b-2 border-slate-300 px-3 py-2 flex items-center justify-between shadow-xs shrink-0 min-h-[112px]">
        {/* Left: Article & Client Details */}
        <div className="flex-1 space-y-1.5 text-xs pr-4">
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-slate-500 font-bold">Libellé : </span>
              <span className="font-black text-slate-900 text-sm">
                {activeItem?.designation || 'Sélectionner un article'}
              </span>
            </div>
            <label className="flex items-center space-x-1.5 cursor-pointer ml-auto pr-4">
              <input type="checkbox" checked={client.isPro} onChange={e => setClient({ ...client, isPro: e.target.checked })} className="rounded text-sky-600" />
              <span className="text-xs font-bold text-slate-600">Pro</span>
            </label>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-slate-600 font-medium">
            <div>
              <span className="text-slate-500 font-bold">Rayon : </span>
              <span className="font-bold text-sky-700">Energy</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold">Qte Article : </span>
              <span className="font-black text-rose-600 font-mono text-xs">{activeItem?.quantity || 1}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold">Remise : </span>
              <span className="text-slate-400">........</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold">Taux : </span>
              <span className="text-slate-400">20%</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <div>
              <span className="text-slate-500 font-bold">Code Produit : </span>
              <span className="font-black text-sky-700 font-mono">15AR5438682</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold">Stock : </span>
              <span className="font-bold text-slate-700 font-mono">0</span>
            </div>
            <div className="flex items-center space-x-1 pl-2 border-l border-slate-300">
              <span className="text-slate-500 font-bold">Client : </span>
              <span className="font-extrabold text-amber-700">{client.name}</span>
            </div>
            <div className="flex items-center space-x-1 text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              <Heart className="w-3 h-3 fill-rose-500" />
              <span>{client.points} pts</span>
            </div>
          </div>
        </div>

        {/* Right: Separation line pushed right + 320px Wide Tall Card (Exactly like picture) */}
        <div className="pl-4 border-l border-slate-300 shrink-0 flex items-center">
          <div className="bg-[#111425] text-white w-[320px] h-[98px] px-5 py-3 rounded-2xl shadow-lg border border-slate-800 flex flex-col justify-between select-none">
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              TOTAL TTC
            </div>
            <div className="text-3xl font-black tracking-tight text-white leading-none font-sans">
              {totalTTC.toFixed(2).replace('.', ',')} €
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>HT {totalHT.toFixed(2).replace('.', ',')} €</span>
              <span>TVA {totalTVA.toFixed(2).replace('.', ',')} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE`;

if (!regex.test(content)) {
  console.error("Could not find matching top ribbon regex in LaCaisseWindow.jsx");
  process.exit(1);
}

content = content.replace(regex, replacement);
fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully updated top ribbon with 320px card and pushed separation line!");
