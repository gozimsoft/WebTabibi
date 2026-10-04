<?php
$searchModalFile = 'D:/Github/Utopia_react/frontend/src/components/IntuitiveProductSearchModal.jsx';

$content = <<<'JS'
import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight, Search, Check, RotateCcw, Package, Monitor, Store } from 'lucide-react';

export default function IntuitiveProductSearchModal({ products = [], onSelect, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [selectedRayon, setSelectedRayon] = useState('Tous');

  const filtered = products.filter(p => {
    const matchTerm = (p.Designation && p.Designation.toLowerCase().includes(searchTerm.toLowerCase())) || 
                      (p.CodeBarre && p.CodeBarre.includes(searchTerm)) ||
                      (p.ID && p.ID.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchRayon = selectedRayon === 'Tous' || p.Rayon === selectedRayon;
    return matchTerm && matchRayon;
  });

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-3 select-none">
      <div className="bg-white border-2 border-slate-300 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Dark Header matching Signature Style */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-black shadow">
              <Search className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wide">Recherche Intuitive des Produits</h2>
              <span className="text-xs text-slate-400 font-semibold">Utopya V1.0 2024 • Catalogue & Tarifs</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
            <div className="flex items-center space-x-1 bg-slate-700/60 px-3 py-1.5 rounded-lg border border-slate-600">
              <Monitor className="w-3.5 h-3.5 text-amber-400" />
              <span>Post2 (Caisse N° 2)</span>
            </div>
            <button 
              onClick={onClose} 
              className="p-1 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-white transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center space-x-4 text-xs font-semibold">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Rechercher par désignation, référence ou code à barre..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-amber-500 shadow-inner font-semibold"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 uppercase tracking-wider text-[11px] font-bold">Rayon :</span>
            <select 
              value={selectedRayon}
              onChange={e => setSelectedRayon(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
            >
              <option value="Tous">Tous les rayons ({products.length})</option>
              <option value="alimentations">Alimentations</option>
              <option value="Meubles">Meubles</option>
              <option value="jardins">Jardins</option>
              <option value="Informatique">Informatique</option>
              <option value="Energy">Energy</option>
              <option value="Arcade">Arcade</option>
              <option value="casque">Casque</option>
              <option value="Cables">Câbles</option>
            </select>
          </div>
        </div>

        {/* Accordion list */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400 font-semibold italic">
              Aucun produit ne correspond à cette recherche.
            </div>
          ) : (
            filtered.map(p => {
              const isExpanded = expandedId === p.ID;
              const prixA = parseFloat(p.Prix_A || 0);
              const prixV = parseFloat(p.Prix_V || 0);
              const marge = prixV - prixA;
              const tauxMarge = prixV > 0 ? ((marge / prixV) * 100).toFixed(1) : '0.0';

              return (
                <div 
                  key={p.ID}
                  className={`border-2 rounded-xl overflow-hidden bg-white shadow-xs transition ${
                    isExpanded ? 'border-amber-500 shadow-md' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Header row */}
                  <div 
                    onClick={() => setExpandedId(isExpanded ? null : p.ID)}
                    className={`p-3 flex items-center justify-between cursor-pointer transition ${
                      isExpanded ? 'bg-amber-50/70 border-b border-amber-200' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 font-bold text-xs text-slate-800">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-slate-900">{p.Designation}</div>
                        <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-700">{p.ID}</span>
                          <span>•</span>
                          <span className="text-amber-700 font-bold">{p.Rayon || 'Général'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Prix Vente</span>
                        <span className="text-base font-black text-slate-900">{prixV.toFixed(2)} €</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelect(p); onClose(); }}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 shadow-sm transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Sélectionner</span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail box */}
                  {isExpanded && (
                    <div className="p-4 bg-slate-50 grid grid-cols-4 gap-3 text-xs">
                      <div className="bg-white border border-slate-200 p-2.5 rounded-xl shadow-xs">
                        <span className="text-slate-400 font-bold text-[10px] block uppercase">Prix Achat HT</span>
                        <span className="text-sm font-black text-rose-600">{prixA.toFixed(2)} €</span>
                      </div>
                      <div className="bg-white border border-slate-200 p-2.5 rounded-xl shadow-xs">
                        <span className="text-slate-400 font-bold text-[10px] block uppercase">Prix Vente TTC</span>
                        <span className="text-sm font-black text-emerald-600">{prixV.toFixed(2)} €</span>
                      </div>
                      <div className="bg-white border border-slate-200 p-2.5 rounded-xl shadow-xs">
                        <span className="text-slate-400 font-bold text-[10px] block uppercase">Marge brute</span>
                        <span className="text-sm font-black text-slate-800">{marge.toFixed(2)} € ({tauxMarge}%)</span>
                      </div>
                      <div className="bg-white border border-slate-200 p-2.5 rounded-xl shadow-xs">
                        <span className="text-slate-400 font-bold text-[10px] block uppercase">Code-barre</span>
                        <span className="text-xs font-mono font-bold text-slate-700">{p.CodeBarre || 'N/A'}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-between items-center">
          <span className="text-xs text-slate-500 font-bold">
            {filtered.length} produits trouvés sur {products.length}
          </span>
          <button
            onClick={onClose}
            className="border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs shadow-sm transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
JS;

file_put_contents($searchModalFile, $content);
echo "Updated IntuitiveProductSearchModal.jsx successfully\n";
