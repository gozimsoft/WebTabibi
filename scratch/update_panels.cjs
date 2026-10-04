const fs = require('fs');

// 1. ArticlesPage.jsx
{
  const filePath = 'D:/Github/Utopia_react/frontend/src/pages/ArticlesPage.jsx';
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace panel opening tag and header card
  const oldPanelSection = `      {/* 12 Action Tiles Left Sub-Panel */}
      <div className="w-64 bg-slate-50 border-r border-slate-300 p-2.5 flex flex-col justify-between select-none">
        <div>
          {/* Header Tile matching Signature Style */}
          <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white rounded-xl p-3 mb-2.5 flex items-center space-x-3 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-black shadow">
              <Package className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-black text-white text-sm tracking-wide">Gestion des Articles</h2>
              <span className="text-[11px] text-slate-400 font-semibold">{products.length} articles en stock</span>
            </div>
          </div>

          {/* 12 Delphi Action Tiles with Clean Borders & Hover */}
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold text-slate-700">
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <span className="text-sky-600 mb-1 font-black text-sm">📊</span>
              <span>État de Stock</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <Edit3 className="w-4 h-4 text-emerald-600 mb-1" />
              <span>Modifier Article</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <RotateCcw className="w-4 h-4 text-amber-600 mb-1" />
              <span>Historique Stocks</span>
            </button>
            <button className="bg-white hover:bg-rose-50 border border-rose-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition text-rose-700">
              <Trash2 className="w-4 h-4 text-rose-600 mb-1" />
              <span>Supprimer</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <ArrowDownLeft className="w-4 h-4 text-teal-600 mb-1" />
              <span>Entrée Stock</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <span className="text-indigo-600 mb-1 font-black text-sm">⚡</span>
              <span>Entrée Rapide</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <ArrowUpRight className="w-4 h-4 text-rose-500 mb-1" />
              <span>Sortie Stock</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <Barcode className="w-4 h-4 text-slate-700 mb-1" />
              <span>Imprimer Barcode</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <ClipboardList className="w-4 h-4 text-sky-600 mb-1" />
              <span>Mouvements</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <FileText className="w-4 h-4 text-purple-600 mb-1" />
              <span>Imp. Articles</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <TrendingDown className="w-4 h-4 text-red-500 mb-1" />
              <span>Dépréciations</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <span className="text-emerald-600 mb-1 font-black text-sm">📋</span>
              <span>Inventaire</span>
            </button>
          </div>
        </div>

        {/* Intuitive search button in Signature Amber */}
        <button
          onClick={() => setShowIntuitive(true)}
          className="mt-3 w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow-md shadow-amber-500/25 flex items-center justify-center space-x-2 transition active:scale-98"
        >
          <Search className="w-4 h-4 stroke-[2.5]" />
          <span>Recherche Intuitive (Photos/Marge)</span>
        </button>
      </div>`;

  const newPanelSection = `      {/* 12 Action Tiles Left Sub-Panel */}
      <div className="w-72 bg-slate-50 border-r border-slate-300 p-2.5 flex flex-col justify-between overflow-y-auto select-none shrink-0">
        <div>
          {/* Header Tile matching Utopia Signature Style */}
          <div className="bg-[#111425] border-2 border-slate-800 rounded-2xl p-3 mb-2.5 shadow-md flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
              <Package className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-base font-black text-white tracking-wide truncate">
                Gestion des Articles
              </h2>
              <span className="text-xs text-slate-400 font-semibold block truncate">
                {products.length} articles en stock
              </span>
            </div>
          </div>

          {/* 12 Delphi Action Tiles with Clean Borders & Hover */}
          <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <span className="text-sky-600 mb-1.5 font-black text-base">📊</span>
              <span>État de Stock</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <Edit3 className="w-5 h-5 text-emerald-600 mb-1.5" />
              <span>Modifier Article</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <RotateCcw className="w-5 h-5 text-amber-600 mb-1.5" />
              <span>Historique Stocks</span>
            </button>
            <button className="bg-white hover:bg-rose-50 border border-rose-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 text-rose-700 min-h-[64px]">
              <Trash2 className="w-5 h-5 text-rose-600 mb-1.5" />
              <span>Supprimer</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <ArrowDownLeft className="w-5 h-5 text-teal-600 mb-1.5" />
              <span>Entrée Stock</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <span className="text-indigo-600 mb-1.5 font-black text-base">⚡</span>
              <span>Entrée Rapide</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <ArrowUpRight className="w-5 h-5 text-rose-500 mb-1.5" />
              <span>Sortie Stock</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <Barcode className="w-5 h-5 text-slate-700 mb-1.5" />
              <span>Imprimer Barcode</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <ClipboardList className="w-5 h-5 text-sky-600 mb-1.5" />
              <span>Mouvements</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <FileText className="w-5 h-5 text-purple-600 mb-1.5" />
              <span>Imp. Articles</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <TrendingDown className="w-5 h-5 text-red-500 mb-1.5" />
              <span>Dépréciations</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <span className="text-emerald-600 mb-1.5 font-black text-base">📋</span>
              <span>Inventaire</span>
            </button>
          </div>
        </div>

        {/* Intuitive search button in Signature Amber */}
        <button
          onClick={() => setShowIntuitive(true)}
          className="mt-3 w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-3 rounded-xl text-xs shadow-md shadow-amber-500/25 flex items-center justify-center space-x-2 transition active:scale-98"
        >
          <Search className="w-4.5 h-4.5 stroke-[2.5]" />
          <span>Recherche Intuitive (Photos/Marge)</span>
        </button>
      </div>`;

  if (content.includes(oldPanelSection)) {
    content = content.replace(oldPanelSection, newPanelSection);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated ArticlesPage.jsx');
  } else {
    console.error('Could not find oldPanelSection in ArticlesPage.jsx');
  }
}

// 2. ClientsPage.jsx
{
  const filePath = 'D:/Github/Utopia_react/frontend/src/pages/ClientsPage.jsx';
  let content = fs.readFileSync(filePath, 'utf8');

  const oldPanelSection = `      {/* 12 Action Tiles Left */}
      <div className="w-64 bg-slate-50 border-r border-slate-300 p-2.5 flex flex-col justify-between select-none">
        <div>
          {/* Header Tile matching Signature Style */}
          <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white rounded-xl p-3 mb-2.5 flex items-center space-x-3 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-black shadow">
              <Users className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-black text-white text-sm tracking-wide">Gestion Clients</h2>
              <span className="text-[11px] text-slate-400 font-semibold">{clients.length} comptes répertoriés</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold text-slate-700">
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <Edit3 className="w-4 h-4 text-emerald-600 mb-1" />
              <span>Modifier</span>
            </button>
            <button className="bg-white hover:bg-rose-50 border border-rose-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition text-rose-700">
              <Trash2 className="w-4 h-4 text-rose-600 mb-1" />
              <span>Supprimer</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <span className="text-amber-600 mb-1 font-black text-sm">📅</span>
              <span>Liste Échéances</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <Search className="w-4 h-4 text-sky-600 mb-1" />
              <span>Recherche Client</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <span className="text-fuchsia-600 mb-1 font-black text-sm">💳</span>
              <span>Gestion Fidélité</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <span className="text-emerald-600 mb-1 font-black text-sm">💰</span>
              <span>Payement Encours</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <Gift className="w-4 h-4 text-fuchsia-600 mb-1" />
              <span>Carte Cadeau</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <History className="w-4 h-4 text-indigo-600 mb-1" />
              <span>Historique</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <span className="text-amber-500 mb-1 font-black text-sm">🎟️</span>
              <span>Bon d'achat</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <Send className="w-4 h-4 text-teal-600 mb-1" />
              <span>Envoyer</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <span className="text-purple-600 mb-1 font-black text-sm">🧾</span>
              <span>Saisie Doc Vente</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <span className="text-rose-600 mb-1 font-black text-sm">⚖️</span>
              <span>Correction Règ.</span>
            </button>
          </div>
        </div>

        {/* Export buttons in Signature Style */}
        <div className="flex space-x-2 pt-2 border-t border-slate-200">
          <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 py-2 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center space-x-1.5 shadow-xs transition">
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Imprimer</span>
          </button>
          <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 py-2 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center space-x-1.5 shadow-xs transition">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
          </button>
        </div>
      </div>`;

  const newPanelSection = `      {/* 12 Action Tiles Left */}
      <div className="w-72 bg-slate-50 border-r border-slate-300 p-2.5 flex flex-col justify-between overflow-y-auto select-none shrink-0">
        <div>
          {/* Header Tile matching Utopia Signature Style */}
          <div className="bg-[#111425] border-2 border-slate-800 rounded-2xl p-3 mb-2.5 shadow-md flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
              <Users className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-base font-black text-white tracking-wide truncate">
                Gestion Clients
              </h2>
              <span className="text-xs text-slate-400 font-semibold block truncate">
                {clients.length} comptes répertoriés
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <Edit3 className="w-5 h-5 text-emerald-600 mb-1.5" />
              <span>Modifier</span>
            </button>
            <button className="bg-white hover:bg-rose-50 border border-rose-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 text-rose-700 min-h-[64px]">
              <Trash2 className="w-5 h-5 text-rose-600 mb-1.5" />
              <span>Supprimer</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <span className="text-amber-600 mb-1.5 font-black text-base">📅</span>
              <span>Liste Échéances</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <Search className="w-5 h-5 text-sky-600 mb-1.5" />
              <span>Recherche Client</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <span className="text-fuchsia-600 mb-1.5 font-black text-base">💳</span>
              <span>Gestion Fidélité</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <span className="text-emerald-600 mb-1.5 font-black text-base">💰</span>
              <span>Payement Encours</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <Gift className="w-5 h-5 text-fuchsia-600 mb-1.5" />
              <span>Carte Cadeau</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <History className="w-5 h-5 text-indigo-600 mb-1.5" />
              <span>Historique</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <span className="text-amber-500 mb-1.5 font-black text-base">🎟️</span>
              <span>Bon d'achat</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <Send className="w-5 h-5 text-teal-600 mb-1.5" />
              <span>Envoyer</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <span className="text-purple-600 mb-1.5 font-black text-base">🧾</span>
              <span>Saisie Doc Vente</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <span className="text-rose-600 mb-1.5 font-black text-base">⚖️</span>
              <span>Correction Règ.</span>
            </button>
          </div>
        </div>

        {/* Export buttons in Signature Style */}
        <div className="flex space-x-2 pt-2 border-t border-slate-200">
          <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 py-2.5 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center space-x-1.5 shadow-xs transition hover:shadow-sm active:scale-98">
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Imprimer</span>
          </button>
          <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 py-2.5 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center space-x-1.5 shadow-xs transition hover:shadow-sm active:scale-98">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel</span>
          </button>
        </div>
      </div>`;

  if (content.includes(oldPanelSection)) {
    content = content.replace(oldPanelSection, newPanelSection);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated ClientsPage.jsx');
  } else {
    console.error('Could not find oldPanelSection in ClientsPage.jsx');
  }
}

// 3. SuppliersPage.jsx
{
  const filePath = 'D:/Github/Utopia_react/frontend/src/pages/SuppliersPage.jsx';
  let content = fs.readFileSync(filePath, 'utf8');

  const oldPanelSection = `      {/* 12 Action Tiles Left */}
      <div className="w-64 bg-slate-50 border-r border-slate-300 p-2.5 flex flex-col justify-between select-none">
        <div>
          {/* Header Tile matching User Photo Style exactly */}
          <div className="bg-[#111425] border-2 border-slate-800 rounded-2xl p-3 mb-2.5 shadow-md flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
              <Truck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-base font-black text-white tracking-wide truncate">
                Fournisseurs
              </h2>
              <span className="text-xs text-slate-400 font-semibold block truncate">
                {suppliers.length} tiers répertoriés
              </span>
            </div>
          </div>

          {/* 12 Delphi Action Tiles */}
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold text-slate-700">
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <Edit3 className="w-4 h-4 text-emerald-600 mb-1" />
              <span>Modifier</span>
            </button>
            <button className="bg-white hover:bg-rose-50 border border-rose-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition text-rose-700">
              <Trash2 className="w-4 h-4 text-rose-600 mb-1" />
              <span>Supprimer</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <Package className="w-4 h-4 text-sky-600 mb-1" />
              <span>État de stock</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <span className="text-indigo-600 mb-1 font-black text-sm">⚡</span>
              <span>Entrée Rapide</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <ArrowDownLeft className="w-4 h-4 text-teal-600 mb-1" />
              <span>Entrée Stock</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <Clock className="w-4 h-4 text-purple-600 mb-1" />
              <span>Historique</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <RotateCcw className="w-4 h-4 text-rose-600 mb-1" />
              <span>Return Achats</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <DollarSign className="w-4 h-4 text-amber-600 mb-1" />
              <span>Mes Dépenses</span>
            </button>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex space-x-2 pt-2 border-t border-slate-200">
          <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 py-2 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center space-x-1.5 shadow-xs transition">
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Imprimer</span>
          </button>
          <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 py-2 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center space-x-1.5 shadow-xs transition">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
          </button>
        </div>
      </div>`;

  const newPanelSection = `      {/* 12 Action Tiles Left */}
      <div className="w-72 bg-slate-50 border-r border-slate-300 p-2.5 flex flex-col justify-between overflow-y-auto select-none shrink-0">
        <div>
          {/* Header Tile matching User Photo Style exactly */}
          <div className="bg-[#111425] border-2 border-slate-800 rounded-2xl p-3 mb-2.5 shadow-md flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
              <Truck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-base font-black text-white tracking-wide truncate">
                Fournisseurs
              </h2>
              <span className="text-xs text-slate-400 font-semibold block truncate">
                {suppliers.length} tiers répertoriés
              </span>
            </div>
          </div>

          {/* 12 Delphi Action Tiles */}
          <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <Edit3 className="w-5 h-5 text-emerald-600 mb-1.5" />
              <span>Modifier</span>
            </button>
            <button className="bg-white hover:bg-rose-50 border border-rose-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 text-rose-700 min-h-[64px]">
              <Trash2 className="w-5 h-5 text-rose-600 mb-1.5" />
              <span>Supprimer</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <Package className="w-5 h-5 text-sky-600 mb-1.5" />
              <span>État de stock</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <span className="text-indigo-600 mb-1.5 font-black text-base">⚡</span>
              <span>Entrée Rapide</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <ArrowDownLeft className="w-5 h-5 text-teal-600 mb-1.5" />
              <span>Entrée Stock</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <Clock className="w-5 h-5 text-purple-600 mb-1.5" />
              <span>Historique</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <RotateCcw className="w-5 h-5 text-rose-600 mb-1.5" />
              <span>Return Achats</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-3 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[64px]">
              <DollarSign className="w-5 h-5 text-amber-600 mb-1.5" />
              <span>Mes Dépenses</span>
            </button>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex space-x-2 pt-2 border-t border-slate-200">
          <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 py-2.5 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center space-x-1.5 shadow-xs transition hover:shadow-sm active:scale-98">
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Imprimer</span>
          </button>
          <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 py-2.5 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center space-x-1.5 shadow-xs transition hover:shadow-sm active:scale-98">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel</span>
          </button>
        </div>
      </div>`;

  if (content.includes(oldPanelSection)) {
    content = content.replace(oldPanelSection, newPanelSection);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated SuppliersPage.jsx');
  } else {
    console.error('Could not find oldPanelSection in SuppliersPage.jsx');
  }
}

// 4. PosPage.jsx
{
  const filePath = 'D:/Github/Utopia_react/frontend/src/pages/PosPage.jsx';
  let content = fs.readFileSync(filePath, 'utf8');

  // Add shrink-0 to panel and increase button sizes
  const oldPosPanel = `      {/* Left Sub-Panel: Action Tiles with Master "Ventes En Caisse" Button */}
      <div className="w-72 bg-slate-50 border-r border-slate-300 p-2.5 flex flex-col justify-between overflow-y-auto select-none">
        <div className="space-y-2">
          {/* Top Master Button: Ventes En Caisse -> Opens Cashier Login */}
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

          {/* Grid of Delphi Action Tiles from Screenshot */}
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold text-slate-700">
            {/* Row 1 */}
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <Coins className="w-5 h-5 text-rose-500 mb-1" />
              <span>Désistement encours</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <Calendar className="w-5 h-5 text-sky-600 mb-1" />
              <span>Clôture Journée</span>
            </button>

            {/* Row 2 */}
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <FileText className="w-5 h-5 text-purple-600 mb-1" />
              <span>Saisie Doc vente</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <RotateCcw className="w-5 h-5 text-rose-600 mb-1" />
              <span>Avoir Client</span>
            </button>

            {/* Row 3 */}
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <Edit3 className="w-5 h-5 text-sky-600 mb-1" />
              <span>Corrections Doc</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <CheckSquare className="w-5 h-5 text-emerald-600 mb-1" />
              <span>Clôtures Mois</span>
            </button>
          </div>

          {/* Row 4: 3-cols */}
          <div className="grid grid-cols-3 gap-1 text-[10px] font-bold text-slate-700">
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2 rounded-lg text-center shadow-xs">
              Fidélité
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2 rounded-lg text-center shadow-xs">
              Gestion Devis
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2 rounded-lg text-center shadow-xs">
              Bons d'Achat
            </button>
          </div>

          {/* Row 5: Cartes cadeaux & Payement encours */}
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold text-slate-700">
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs">
              <span className="text-slate-500 font-mono font-bold text-xs">0.00 $</span>
              <span>Cartes cadeaux</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs">
              <CreditCard className="w-5 h-5 text-purple-600 mb-1" />
              <span>Paiement encours</span>
            </button>
          </div>

          {/* Row 6: 3-cols */}
          <div className="grid grid-cols-3 gap-1 text-[10px] font-bold text-slate-700">
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2 rounded-lg text-center shadow-xs">
              Correct. pay
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2 rounded-lg text-center shadow-xs">
              Bons d'avoirs
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2 rounded-lg text-center shadow-xs">
              Historique
            </button>
          </div>

          {/* Row 7: Chiffre d'Affaires, Année, Journées */}
          <div className="grid grid-cols-3 gap-1 text-[10px] font-bold text-slate-700">
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2 rounded-lg text-center shadow-xs flex flex-col items-center">
              <span className="text-amber-500 text-xs">💰</span>
              <span>C.A.</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2 rounded-lg text-center shadow-xs flex flex-col items-center">
              <span className="text-rose-500 text-xs font-mono font-black">+1y</span>
              <span>Année</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2 rounded-lg text-center shadow-xs flex flex-col items-center">
              <span className="text-fuchsia-500 text-xs font-mono font-black">1</span>
              <span>Journées</span>
            </button>
          </div>
        </div>

        {/* Export / Document Action Icons */}
        <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
          <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 py-1.5 rounded-xl flex items-center justify-center text-emerald-600 shadow-xs" title="Export PDF">
            <FileSpreadsheet className="w-4 h-4" />
          </button>
          <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 py-1.5 rounded-xl flex items-center justify-center text-amber-600 shadow-xs" title="Envoyer">
            <Send className="w-4 h-4" />
          </button>
          <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 py-1.5 rounded-xl flex items-center justify-center text-rose-500 shadow-xs" title="Imprimer Document">
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>`;

  const newPosPanel = `      {/* Left Sub-Panel: Action Tiles with Master "Ventes En Caisse" Button */}
      <div className="w-72 bg-slate-50 border-r border-slate-300 p-2.5 flex flex-col justify-between overflow-y-auto select-none shrink-0">
        <div className="space-y-2">
          {/* Top Master Button: Ventes En Caisse -> Opens Cashier Login */}
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

          {/* Grid of Delphi Action Tiles from Screenshot */}
          <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
            {/* Row 1 */}
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[62px]">
              <Coins className="w-5 h-5 text-rose-500 mb-1" />
              <span>Désistement encours</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[62px]">
              <Calendar className="w-5 h-5 text-sky-600 mb-1" />
              <span>Clôture Journée</span>
            </button>

            {/* Row 2 */}
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[62px]">
              <FileText className="w-5 h-5 text-purple-600 mb-1" />
              <span>Saisie Doc vente</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[62px]">
              <RotateCcw className="w-5 h-5 text-rose-600 mb-1" />
              <span>Avoir Client</span>
            </button>

            {/* Row 3 */}
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[62px]">
              <Edit3 className="w-5 h-5 text-sky-600 mb-1" />
              <span>Corrections Doc</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[62px]">
              <CheckSquare className="w-5 h-5 text-emerald-600 mb-1" />
              <span>Clôtures Mois</span>
            </button>
          </div>

          {/* Row 4: 3-cols */}
          <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold text-slate-700">
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-1 rounded-lg text-center shadow-xs transition hover:shadow-sm active:scale-98">
              Fidélité
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-1 rounded-lg text-center shadow-xs transition hover:shadow-sm active:scale-98">
              Gestion Devis
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-1 rounded-lg text-center shadow-xs transition hover:shadow-sm active:scale-98">
              Bons d'Achat
            </button>
          </div>

          {/* Row 5: Cartes cadeaux & Payement encours */}
          <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[62px]">
              <span className="text-slate-500 font-mono font-bold text-xs">0.00 $</span>
              <span>Cartes cadeaux</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[62px]">
              <CreditCard className="w-5 h-5 text-purple-600 mb-1" />
              <span>Paiement encours</span>
            </button>
          </div>

          {/* Row 6: 3-cols */}
          <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold text-slate-700">
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-1 rounded-lg text-center shadow-xs transition hover:shadow-sm active:scale-98">
              Correct. pay
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-1 rounded-lg text-center shadow-xs transition hover:shadow-sm active:scale-98">
              Bons d'avoirs
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-1 rounded-lg text-center shadow-xs transition hover:shadow-sm active:scale-98">
              Historique
            </button>
          </div>

          {/* Row 7: Chiffre d'Affaires, Année, Journées */}
          <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold text-slate-700">
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-1 rounded-lg text-center shadow-xs flex flex-col items-center transition hover:shadow-sm active:scale-98">
              <span className="text-amber-500 text-xs">💰</span>
              <span>C.A.</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-1 rounded-lg text-center shadow-xs flex flex-col items-center transition hover:shadow-sm active:scale-98">
              <span className="text-rose-500 text-xs font-mono font-black">+1y</span>
              <span>Année</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-1 rounded-lg text-center shadow-xs flex flex-col items-center transition hover:shadow-sm active:scale-98">
              <span className="text-fuchsia-500 text-xs font-mono font-black">1</span>
              <span>Journées</span>
            </button>
          </div>
        </div>

        {/* Export / Document Action Icons */}
        <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
          <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 py-2 rounded-xl flex items-center justify-center text-emerald-600 shadow-xs transition hover:shadow-sm" title="Export PDF">
            <FileSpreadsheet className="w-4.5 h-4.5" />
          </button>
          <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 py-2 rounded-xl flex items-center justify-center text-amber-600 shadow-xs transition hover:shadow-sm" title="Envoyer">
            <Send className="w-4.5 h-4.5" />
          </button>
          <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 py-2 rounded-xl flex items-center justify-center text-rose-500 shadow-xs transition hover:shadow-sm" title="Imprimer Document">
            <Printer className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>`;

  if (content.includes(oldPosPanel)) {
    content = content.replace(oldPosPanel, newPosPanel);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated PosPage.jsx');
  } else {
    console.error('Could not find oldPosPanel in PosPage.jsx');
  }
}
