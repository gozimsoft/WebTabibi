const fs = require('fs');

const filePath = 'D:/Github/Utopia_react/frontend/src/components/LaCaisseWindow.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetSection = `          {/* Right: Totals HT/TVA/TTC + Giant Green Neon LED Display */}
          <div className="col-span-4 flex items-center justify-end space-x-4 pl-3 border-l border-slate-300">
            <div className="text-right text-xs space-y-0.5">
              <div className="text-sky-700 font-bold">Total HT : <span className="font-mono">{totalHT.toFixed(2).replace('.', ',')} €</span></div>
              <div className="text-sky-700 font-bold">TOTAL TVA : <span className="font-mono">{totalTVA.toFixed(2).replace('.', ',')} €</span></div>
              <div className="text-sky-800 font-extrabold">TOTAL TTC : <span className="font-mono">{totalTTC.toFixed(2).replace('.', ',')} €</span></div>
            </div>

            {/* Giant Green Neon LED Display (Exact from Photo) */}
            <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-xl px-4 py-2 shadow-inner flex items-center justify-center min-w-[170px]">
              <span className="text-3xl font-black font-mono text-emerald-400 tracking-wider drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                {totalTTC.toFixed(2).replace('.', ',')} €
              </span>
            </div>
          </div>`;

const replacementSection = `          {/* Right: Grand Carré Bleu Sombre (Total TTC + HT & TVA à l'intérieur, sans le petit TTC) */}
          <div className="col-span-4 flex items-center justify-end pl-3 border-l border-slate-300">
            <div className="bg-[#111425] text-white px-6 py-2.5 rounded-2xl shadow-lg border border-slate-800 min-w-[260px] flex flex-col justify-center">
              <div className="text-3xl font-black tracking-tight text-center font-sans leading-tight">
                {totalTTC.toFixed(2).replace('.', ',')} €
              </div>
              <div className="flex items-center justify-between space-x-6 text-xs text-slate-400 font-semibold pt-1.5 border-t border-slate-800/80 mt-1">
                <span>HT {totalHT.toFixed(2).replace('.', ',')} €</span>
                <span>TVA {totalTVA.toFixed(2).replace('.', ',')} €</span>
              </div>
            </div>
          </div>`;

if (!content.includes(targetSection)) {
  console.error("Target section not found! Trying flexible replacement...");
  // flexible regex
  const regex = /\{\/\* Right: Totals HT\/TVA\/TTC[\s\S]*?\{\/\* 3\. MAIN WORKSPACE/;
  if (regex.test(content)) {
    content = content.replace(regex, replacementSection + "\n        </div>\n      </div>\n\n      {/* 3. MAIN WORKSPACE");
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Successfully replaced with regex!");
  } else {
    console.error("Could not find matching regex either!");
    process.exit(1);
  }
} else {
  content = content.replace(targetSection, replacementSection);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully replaced exact section!");
}
