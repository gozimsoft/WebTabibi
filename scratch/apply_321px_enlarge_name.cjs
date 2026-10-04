const fs = require('fs');

const filePath = 'D:/Github/Utopia_react/frontend/src/components/LaCaisseWindow.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace 322px with 321px
content = content.replace('w-[322px] shrink-0 border-l', 'w-[321px] shrink-0 border-l');
content = content.replace('/* Right: Separation line at exactly 322PX', '/* Right: Separation line at exactly 321PX');

// Replace Line 1 with larger product name and wider allocated space
const targetLine1 = `          {/* LINE 1: Article Identity, Category Pill, Code & PRO Toggle */}
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
            </div>`;

const replacementLine1 = `          {/* LINE 1: Article Identity, Category Pill, Code & PRO Toggle */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              {/* Product Icon */}
              <div className="p-1.5 bg-gradient-to-br from-sky-50 to-indigo-50 text-sky-600 rounded-lg border border-sky-200/90 shadow-2xs shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>

              {/* Designation - Increased Font Size & Wide Container */}
              <div className="min-w-0 max-w-xl lg:max-w-2xl">
                <span className="font-black text-slate-900 text-base lg:text-[17px] tracking-tight truncate block" title={activeItem?.designation}>
                  {activeItem?.designation || 'Sélectionner un article'}
                </span>
              </div>

              {/* Category / Rayon Pill (Creative Styling) */}
              <div className="flex items-center space-x-1.5 bg-amber-50 text-amber-700 border border-amber-300/80 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide shadow-2xs shrink-0">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                <span>Energy</span>
              </div>

              {/* Barcode / Ref */}
              <div className="flex items-center space-x-1.5 bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-md font-mono text-xs font-bold shadow-2xs shrink-0">
                <span className="text-slate-400 font-semibold text-[9px] uppercase tracking-wider">REF</span>
                <span>15AR5438682</span>
              </div>
            </div>`;

if (!content.includes(targetLine1)) {
  console.error("targetLine1 not found exactly, doing regex replacement...");
  const regexLine1 = /\{\/\* LINE 1: Article Identity[\s\S]*?\{\/\* Client PRO Toggle \*\/\}/;
  content = content.replace(regexLine1, replacementLine1 + "\n\n            {/* Client PRO Toggle */}");
} else {
  content = content.replace(targetLine1, replacementLine1);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully updated to 321px and enlarged product name and allocated width!");
