<?php
// 1. Update PosPage.jsx (Vente)
$posPageFile = 'D:/Github/Utopia_react/frontend/src/pages/PosPage.jsx';
$posContent = file_get_contents($posPageFile);

// Normalize newlines for reliable matching
$posContent = str_replace("\r\n", "\n", $posContent);

$targetPos = <<<'JS'
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

$replacePos = <<<'JS'
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

if (strpos($posContent, $targetPos) !== false) {
    $posContent = str_replace($targetPos, $replacePos, $posContent);
    file_put_contents($posPageFile, $posContent);
    echo "Successfully updated PosPage.jsx (Vente)\n";
} else {
    echo "Target string in PosPage not found\n";
}

// 2. Update SuppliersPage.jsx (Fournisseurs)
$supPageFile = 'D:/Github/Utopia_react/frontend/src/pages/SuppliersPage.jsx';

$supContent = <<<'JS'
import React, { useState, useEffect } from 'react';
import { Truck, Search, Plus, Trash2, Edit3, Printer, FileSpreadsheet, Package, ArrowDownLeft, RotateCcw, DollarSign, Clock } from 'lucide-react';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [tab, setTab] = useState('Tous');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/suppliers')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setSuppliers(data.data);
        } else {
          setSuppliers([
            { id: 1, name: 'Sarl Electro Distrib', contact: 'Marc Dupont', phone: '0478951236', email: 'contact@electrodistrib.fr', city: 'Lyon', encours: 1450.00 },
            { id: 2, name: 'Import Tech France', contact: 'Sophie Martin', phone: '0145896235', email: 'compta@importtech.fr', city: 'Paris', encours: 2890.50 },
            { id: 3, name: 'Global Textile & Work', contact: 'Ahmed Benali', phone: '0491234567', email: 'sales@globaltextile.com', city: 'Marseille', encours: 620.00 },
            { id: 4, name: 'Batteries & Accu Pro', contact: 'Jean Lefevre', phone: '0320457812', email: 'info@batteriespro.fr', city: 'Lille', encours: 3100.00 }
          ]);
        }
        setLoading(false);
      })
      .catch(() => {
        setSuppliers([
          { id: 1, name: 'Sarl Electro Distrib', contact: 'Marc Dupont', phone: '0478951236', email: 'contact@electrodistrib.fr', city: 'Lyon', encours: 1450.00 },
          { id: 2, name: 'Import Tech France', contact: 'Sophie Martin', phone: '0145896235', email: 'compta@importtech.fr', city: 'Paris', encours: 2890.50 },
          { id: 3, name: 'Global Textile & Work', contact: 'Ahmed Benali', phone: '0491234567', email: 'sales@globaltextile.com', city: 'Marseille', encours: 620.00 },
          { id: 4, name: 'Batteries & Accu Pro', contact: 'Jean Lefevre', phone: '0320457812', email: 'info@batteriespro.fr', city: 'Lille', encours: 3100.00 }
        ]);
        setLoading(false);
      });
  }, []);

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.contact && s.contact.toLowerCase().includes(search.toLowerCase())) ||
    (s.city && s.city.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="h-full flex overflow-hidden bg-slate-100 select-none">
      {/* 12 Action Tiles Left */}
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
      </div>

      {/* Main Datagrid */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Search header */}
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center space-x-2">
            <span>Répertoire des Fournisseurs & Comptes Achats</span>
            <span className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {filtered.length} tiers
            </span>
          </div>
          <div className="w-80 relative">
            <input
              type="text"
              placeholder="Rechercher fournisseur, contact, ville..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none focus:border-amber-500 shadow-inner font-semibold"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 border-b border-slate-200 text-[11px] select-none">
              <tr>
                <th className="py-2.5 px-3">Raison Sociale / Nom</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">Téléphone</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Ville</th>
                <th className="py-2.5 px-3 text-right">Encours Dû</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-slate-400 font-semibold">
                    Chargement des fournisseurs...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-slate-400 font-semibold">
                    Aucun fournisseur trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((s, idx) => (
                  <tr key={idx} className="hover:bg-amber-50/40 transition cursor-pointer group">
                    <td className="py-2.5 px-3 font-bold text-slate-900 group-hover:text-amber-800">
                      {s.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">
                      {s.contact || '-'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                      {s.phone || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">
                      {s.email || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {s.city || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                      {s.encours ? `${s.encours.toFixed(2)} €` : '0,00 €'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
JS;

file_put_contents($supPageFile, $supContent);
echo "Successfully updated SuppliersPage.jsx\n";
