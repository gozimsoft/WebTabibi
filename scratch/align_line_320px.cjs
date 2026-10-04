const fs = require('fs');

const filePath = 'D:/Github/Utopia_react/frontend/src/components/LaCaisseWindow.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /\{\/\* 2\. TOP RIBBON: ARTICLE INFO[\s\S]*?\{\/\* 3\. MAIN WORKSPACE/;

const replacement = `{/* 2. TOP RIBBON: ARTICLE INFO, CLIENT, AND TOTAL CARD */}
      <div className="bg-white border-b-2 border-slate-300 flex items-stretch shadow-xs shrink-0 min-h-[96px]">
        {/* Left: Article & Client Details - Modern Badges & Chips Layout */}
        <div className="flex-1 flex flex-col justify-between p-3 space-y-1.5 min-w-0">
          {/* Row 1: Article Designation + Category + Pro Mode */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2 min-w-0">
              <span className="p-1 bg-sky-50 text-sky-600 rounded-md border border-sky-200 shadow-2xs shrink-0">
                <ShoppingBag className="w-3.5 h-3.5" />
              </span>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight truncate">
                {activeItem?.designation || 'Sélectionner un article'}
              </span>
              <span className="bg-sky-100/70 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-200/80 shrink-0">
                Energy
              </span>
            </div>

            {/* Pro Mode Toggle */}
            <label className="flex items-center space-x-1.5 cursor-pointer bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-md border border-slate-300 transition select-none shrink-0 shadow-2xs">
              <input 
                type="checkbox" 
                checked={client.isPro} 
                onChange={e => setClient({ ...client, isPro: e.target.checked })} 
                className="w-3.5 h-3.5 rounded text-sky-600 focus:ring-sky-500 cursor-pointer" 
              />
              <span className="text-[11px] font-bold text-slate-700">Client PRO</span>
            </label>
          </div>

          {/* Row 2: Metric Chips (Code, Stock, Qte, TVA, Remise) */}
          <div className="flex items-center flex-wrap gap-2 text-[11px]">
            {/* Code Article */}
            <div className="flex items-center space-x-1 bg-slate-100/90 border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
              <span className="text-slate-400 font-bold uppercase text-[9px]">Code</span>
              <span className="font-mono font-bold text-slate-700 text-[11px]">15AR5438682</span>
            </div>

            {/* Stock with Status Dot */}
            <div className="flex items-center space-x-1.5 bg-slate-100/90 border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-slate-400 ring-1 ring-slate-300"></span>
              <span className="text-slate-400 font-bold uppercase text-[9px]">Stock</span>
              <span className="font-mono font-bold text-slate-800 text-[11px]">0</span>
            </div>

            {/* Quantity Badge */}
            <div className="flex items-center space-x-1 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md shadow-2xs">
              <span className="text-rose-500 font-bold uppercase text-[9px]">Qté</span>
              <span className="font-mono font-black text-rose-700 text-[11px]">
                {activeItem?.quantity || 1}
              </span>
            </div>

            {/* TVA */}
            <div className="flex items-center space-x-1 bg-slate-100/90 border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
              <span className="text-slate-400 font-bold uppercase text-[9px]">TVA</span>
              <span className="font-bold text-slate-700 text-[11px]">20%</span>
            </div>

            {/* Remise */}
            <div className="flex items-center space-x-1 bg-slate-100/90 border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
              <span className="text-slate-400 font-bold uppercase text-[9px]">Remise</span>
              <span className="font-bold text-slate-600 text-[11px]">{discountPercent > 0 ? \`\${discountPercent}%\` : '0%'}</span>
            </div>
          </div>

          {/* Row 3: Client & Loyalty Badge */}
          <div className="flex items-center space-x-2.5 text-xs">
            <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-200 text-slate-700 shadow-2xs">
              <User className="w-3.5 h-3.5 text-sky-600" />
              <span className="text-slate-400 font-semibold text-[10px]">Client :</span>
              <span className="font-extrabold text-slate-800 text-[11px]">{client.name}</span>
            </div>

            <div className="flex items-center space-x-1 text-rose-600 font-extrabold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 shadow-2xs text-[11px]">
              <Heart className="w-3 h-3 fill-rose-500" />
              <span>{client.points} pts</span>
            </div>
          </div>
        </div>

        {/* Right: Separation line exactly 320px from right edge, perfectly aligned with the 320px keypad column below */}
        <div className="w-[320px] shrink-0 border-l border-slate-300 p-2.5 flex items-center justify-center bg-slate-50/50">
          <div className="bg-[#111425] text-white w-full max-w-[280px] h-[84px] px-4 py-2 rounded-2xl shadow-md border border-slate-800 flex flex-col justify-between select-none">
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase leading-tight">
              TOTAL TTC
            </div>
            <div className="text-2xl font-black tracking-tight text-white leading-none font-sans">
              {totalTTC.toFixed(2).replace('.', ',')} €
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
              <span>HT {totalHT.toFixed(2).replace('.', ',')} €</span>
              <span>TVA {totalTVA.toFixed(2).replace('.', ',')} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE`;

if (!regex.test(content)) {
  console.error("Regex did not match top ribbon!");
  process.exit(1);
}

content = content.replace(regex, replacement);
fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully set separation line at exactly 320px from right edge!");
