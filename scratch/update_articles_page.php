<?php
$articlesPageFile = 'D:/Github/Utopia_react/frontend/src/pages/ArticlesPage.jsx';

$content = <<<'JS'
import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  Barcode, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ClipboardList, 
  TrendingDown, 
  FileText,
  Filter,
  Sliders
} from 'lucide-react';
import IntuitiveProductSearchModal from '../components/IntuitiveProductSearchModal';

export default function ArticlesPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showIntuitive, setShowIntuitive] = useState(false);

  useEffect(() => {
    fetch(`/api/products?search=${encodeURIComponent(search)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setProducts(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search]);

  return (
    <div className="h-full flex overflow-hidden bg-slate-100 select-none">
      {/* 12 Action Tiles Left Sub-Panel */}
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
      </div>

      {/* Main Datagrid */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Search header matching Signature Card Surface */}
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center space-x-2">
            <span>Catalogue de stock & Tarification</span>
            <span className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {products.length} réf.
            </span>
          </div>
          <div className="w-80 relative">
            <input
              type="text"
              placeholder="Rechercher article, désignation, code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none focus:border-amber-500 shadow-inner font-semibold"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
          </div>
        </div>

        {/* Table with Compact 36px lines and clear contrast */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 border-b border-slate-200 text-[11px] select-none">
              <tr>
                <th className="py-2.5 px-3 w-8"><input type="checkbox" className="rounded" /></th>
                <th className="py-2.5 px-3">Code Article</th>
                <th className="py-2.5 px-3">Désignation</th>
                <th className="py-2.5 px-3 text-right">Dernier Prix Achat</th>
                <th className="py-2.5 px-3 text-right">Prix Vente</th>
                <th className="py-2.5 px-3 text-right">CMUP</th>
                <th className="py-2.5 px-3">Code à Barre</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-slate-400 font-semibold">
                    Chargement des données MariaDB...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-slate-400 font-semibold">
                    Aucun article trouvé.
                  </td>
                </tr>
              ) : (
                products.map((p, idx) => (
                  <tr key={idx} className="hover:bg-amber-50/40 transition cursor-pointer group">
                    <td className="py-2 px-3"><input type="checkbox" className="rounded" /></td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-700 group-hover:text-amber-800">
                      {p.ID || p.CodeProduit}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-900">{p.Designation}</td>
                    <td className="py-2 px-3 text-right text-rose-600 font-bold font-mono">
                      {p.Prix_A ? p.Prix_A.toFixed(2) : '0.00'} €
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-700 font-black font-mono">
                      {p.Prix_V ? p.Prix_V.toFixed(2) : '0.00'} €
                    </td>
                    <td className="py-2 px-3 text-right text-slate-500 font-mono">
                      {p.CMUP ? p.CMUP.toFixed(2) : '0.00'} €
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-600">{p.CodeBarre || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showIntuitive && (
        <IntuitiveProductSearchModal
          products={products}
          onSelect={(p) => { setShowIntuitive(false); }}
          onClose={() => setShowIntuitive(false)}
        />
      )}
    </div>
  );
}
JS;

file_put_contents($articlesPageFile, $content);
echo "Updated ArticlesPage.jsx successfully\n";
