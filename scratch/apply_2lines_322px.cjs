const fs = require('fs');

const filePath = 'D:/Github/Utopia_react/frontend/src/components/LaCaisseWindow.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /\{\/\* 2\. TOP RIBBON: ARTICLE INFO[\s\S]*?\{\/\* 3\. MAIN WORKSPACE/;

const replacement = `{/* 2. TOP RIBBON: ARTICLE INFO, CLIENT, AND TOTAL CARD (2-LINE CREATIVE DESIGN) */}
      <div className="bg-white border-b-2 border-slate-300 flex items-stretch shadow-xs shrink-0 min-h-[92px]">
        {/* Left: Article & Client Details in 2 Clean Creative Lines */}
        <div className="flex-1 flex flex-col justify-center px-4 py-2 space-y-2 min-w-0">
          
          {/* LINE 1: Article Identity, Category Pill, Code & PRO Toggle */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5 min-w-0 flex-wrap gap-y-1">
              {/* Product Icon */}
              <div className="p-1.5 bg-gradient-to-br from-sky-50 to-indigo-50 text-sky-600 rounded-lg border border-sky-200/90 shadow-2xs shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>

              {/* Designation */}
              <span className="font-black text-slate-900 text-sm tracking-tight truncate max-w-md">
                {activeItem?.designation || 'Sélectionner un article'}
              </span>

              {/* Category / Rayon Pill (Creative Styling) */}
              <div className="flex items-center space-x-1 bg-amber-50 text-amber-700 border border-amber-300/80 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide shadow-2xs shrink-0">
                <Tag className="w-3 h-3 text-amber-600" />
                <span>Energy</span>
              </div>

              {/* Barcode / Ref */}
              <div className="flex items-center space-x-1.5 bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold shadow-2xs shrink-0">
                <span className="text-slate-400 font-semibold text-[9px] uppercase tracking-wider">REF</span>
                <span>15AR5438682</span>
              </div>
            </div>

            {/* Client PRO Toggle */}
            <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3 py-1 rounded-lg border border-slate-300 transition select-none shrink-0 shadow-2xs">
              <input 
                type="checkbox" 
                checked={client.isPro} 
                onChange={e => setClient({ ...client, isPro: e.target.checked })} 
                className="w-3.5 h-3.5 rounded text-sky-600 focus:ring-sky-500 cursor-pointer" 
              />
              <span className="text-[11px] font-extrabold text-slate-700">Client PRO</span>
            </label>
          </div>

          {/* LINE 2: Operational Metrics (Stock, Qte, TVA, Remise) + Client Profile & Loyalty */}
          <div className="flex items-center justify-between gap-3 text-xs flex-wrap">
            {/* Left Group: Metric Chips */}
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              {/* Stock Indicator */}
              <div className="flex items-center space-x-1.5 bg-slate-100/90 border border-slate-200 px-2.5 py-0.5 rounded-md shadow-2xs text-[11px]">
                <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-200 shrink-0"></span>
                <span className="text-slate-400 font-bold uppercase text-[9px]">Stock</span>
                <span className="font-mono font-bold text-slate-800">0</span>
              </div>

              {/* Selected Quantity */}
              <div className="flex items-center space-x-1.5 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-md shadow-2xs text-[11px]">
                <span className="text-rose-500 font-bold uppercase text-[9px]">Qté</span>
                <span className="font-mono font-black text-rose-700">
                  {activeItem?.quantity || 1}
                </span>
              </div>

              {/* TVA */}
              <div className="flex items-center space-x-1 bg-indigo-50/80 border border-indigo-200 px-2.5 py-0.5 rounded-md shadow-2xs text-[11px]">
                <span className="text-indigo-400 font-bold uppercase text-[9px]">TVA</span>
                <span className="font-bold text-indigo-700">20%</span>
              </div>

              {/* Remise */}
              <div className="flex items-center space-x-1 bg-emerald-50/80 border border-emerald-200 px-2.5 py-0.5 rounded-md shadow-2xs text-[11px]">
                <span className="text-emerald-500 font-bold uppercase text-[9px]">Remise</span>
                <span className="font-bold text-emerald-700">
                  {discountPercent > 0 ? \`\${discountPercent}%\` : '0%'}
                </span>
              </div>
            </div>

            {/* Right Group: Client Card & Loyalty Points */}
            <div className="flex items-center space-x-2.5">
              {/* Client Name Badge */}
              <div className="flex items-center space-x-2 bg-slate-100/80 hover:bg-slate-200/70 transition px-3 py-0.5 rounded-lg border border-slate-300 text-slate-800 shadow-2xs">
                <User className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-slate-400 font-bold text-[10px] uppercase">Client</span>
                <span className="font-extrabold text-slate-900 text-[11px]">{client.name}</span>
              </div>

              {/* Loyalty Points Pill */}
              <div className="flex items-center space-x-1.5 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-600 font-extrabold px-3 py-0.5 rounded-lg border border-rose-200/90 shadow-2xs text-[11px]">
                <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                <span>{client.points} pts</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Separation line at exactly 322PX from right edge */}
        <div className="w-[322px] shrink-0 border-l border-slate-300 p-2 flex items-center justify-center bg-slate-50/50">
          <div className="bg-[#111425] text-white w-full max-w-[280px] h-[82px] px-4 py-1.5 rounded-2xl shadow-md border border-slate-800 flex flex-col justify-between select-none">
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
  console.error("Regex did not match top ribbon in LaCaisseWindow.jsx");
  process.exit(1);
}

content = content.replace(regex, replacement);
fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully updated top ribbon to 2 creative lines and 322px separation line!");
