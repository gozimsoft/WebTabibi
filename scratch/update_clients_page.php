<?php
$clientsPageFile = 'D:/Github/Utopia_react/frontend/src/pages/ClientsPage.jsx';

$content = <<<'JS'
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Edit3, 
  Trash2, 
  CreditCard, 
  Gift, 
  History, 
  Send, 
  Printer, 
  FileSpreadsheet, 
  FileText 
} from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clients?search=${encodeURIComponent(search)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setClients(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search]);

  return (
    <div className="h-full flex overflow-hidden bg-slate-100 select-none">
      {/* 12 Action Tiles Left */}
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
      </div>

      {/* Main Datagrid */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center space-x-2">
            <span>Répertoire des clients & Comptes tiers</span>
            <span className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {clients.length} clients
            </span>
          </div>
          <div className="w-80 relative">
            <input
              type="text"
              placeholder="Rechercher nom, société, téléphone..."
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
                <th className="py-2.5 px-3">Nom Complet</th>
                <th className="py-2.5 px-3">Raison Sociale</th>
                <th className="py-2.5 px-3">Téléphone</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Ville</th>
                <th className="py-2.5 px-3 text-right">Échéances</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-slate-400 font-semibold">
                    Chargement des clients MariaDB...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-slate-400 font-semibold">
                    Aucun client trouvé.
                  </td>
                </tr>
              ) : (
                clients.map((c, idx) => (
                  <tr key={idx} className="hover:bg-amber-50/40 transition cursor-pointer group">
                    <td className="py-2.5 px-3 font-bold text-slate-900 group-hover:text-amber-800">
                      {c.FullName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">
                      {c.RaisonSocial || '-'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                      {c.Phone || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">
                      {c.Email || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {c.City || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                      {c.Echeances ? `${c.Echeances} €` : '0,00 €'}
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

file_put_contents($clientsPageFile, $content);
echo "Updated ClientsPage.jsx successfully\n";
