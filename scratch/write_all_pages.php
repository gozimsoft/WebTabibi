<?php
$pagesDir = 'D:/Github/Utopia_react/frontend/src/pages';
$srcDir = 'D:/Github/Utopia_react/frontend/src';

// ArticlesPage.jsx
$articlesPage = <<<'JS'
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
  FileText 
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
    <div className="h-full flex overflow-hidden bg-slate-100">
      {/* 12 Action Tiles Left Sub-Panel */}
      <div className="w-64 bg-slate-50 border-r border-slate-300 p-2 flex flex-col justify-between select-none">
        <div>
          {/* Header Tile */}
          <div className="bg-sky-50 border border-sky-300 rounded-lg p-3 mb-2 flex items-center space-x-3 shadow-xs">
            <Package className="w-8 h-8 text-sky-600" />
            <div>
              <h2 className="font-black text-slate-800 text-sm">Gestion des Articles</h2>
              <span className="text-[11px] text-slate-500 font-semibold">{products.length} articles trouvés</span>
            </div>
          </div>

          {/* 12 Colored Tiles */}
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold text-slate-700">
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <span className="text-sky-600 mb-1 font-black">📊</span>
              <span>État de Stock</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <Edit3 className="w-4 h-4 text-emerald-600 mb-1" />
              <span>Modifier Article</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <RotateCcw className="w-4 h-4 text-amber-600 mb-1" />
              <span>Historique Stocks</span>
            </button>
            <button className="bg-white hover:bg-rose-50 border border-rose-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition text-rose-700">
              <Trash2 className="w-4 h-4 text-rose-600 mb-1" />
              <span>Supprimer</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <ArrowDownLeft className="w-4 h-4 text-teal-600 mb-1" />
              <span>Entrée Stock</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <span className="text-indigo-600 mb-1 font-black">⚡</span>
              <span>Entrée Rapide</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <ArrowUpRight className="w-4 h-4 text-rose-500 mb-1" />
              <span>Sortie Stock</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <Barcode className="w-4 h-4 text-slate-700 mb-1" />
              <span>Imprimer Barcode</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <ClipboardList className="w-4 h-4 text-sky-600 mb-1" />
              <span>Mouvements</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <FileText className="w-4 h-4 text-purple-600 mb-1" />
              <span>Imp. Articles</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <TrendingDown className="w-4 h-4 text-red-500 mb-1" />
              <span>Dépréciations</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <span className="text-emerald-600 mb-1 font-black">📋</span>
              <span>Inventaire</span>
            </button>
          </div>
        </div>

        {/* Intuitive search button */}
        <button
          onClick={() => setShowIntuitive(true)}
          className="mt-2 w-full bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 text-white font-black py-2 px-3 rounded-lg text-xs shadow flex items-center justify-center space-x-1.5 transition"
        >
          <Search className="w-4 h-4" />
          <span>Recherche Intuitive (Photos/Marge)</span>
        </button>
      </div>

      {/* Main Datagrid */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Search header */}
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Catalogue de stock & Tarification
          </div>
          <div className="w-72 relative">
            <input
              type="text"
              placeholder="Rechercher article, désignation, code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:border-sky-500 shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-2 px-3 w-8"><input type="checkbox" className="rounded" /></th>
                <th className="py-2 px-3">Code Article</th>
                <th className="py-2 px-3">Désignation</th>
                <th className="py-2 px-3 text-right">Dernier Prix Achat</th>
                <th className="py-2 px-3 text-right">Prix Vente</th>
                <th className="py-2 px-3 text-right">CMUP</th>
                <th className="py-2 px-3">Code à Barre</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">Chargement des données MariaDB...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">Aucun article trouvé.</td>
                </tr>
              ) : (
                products.map((p, idx) => (
                  <tr key={idx} className="hover:bg-sky-50/50 transition cursor-pointer">
                    <td className="py-2 px-3"><input type="checkbox" className="rounded" /></td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-700">{p.ID || p.CodeProduit}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">{p.Designation}</td>
                    <td className="py-2 px-3 text-right text-rose-600 font-bold">{p.Prix_A ? p.Prix_A.toFixed(2) : '0.00'}</td>
                    <td className="py-2 px-3 text-right text-sky-700 font-black">{p.Prix_V ? p.Prix_V.toFixed(2) : '0.00'}</td>
                    <td className="py-2 px-3 text-right text-slate-500">{p.CMUP ? p.CMUP.toFixed(2) : '0.00'}</td>
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
file_put_contents("$pagesDir/ArticlesPage.jsx", $articlesPage);

// ClientsPage.jsx
$clientsPage = <<<'JS'
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
    <div className="h-full flex overflow-hidden bg-slate-100">
      {/* 12 Action Tiles Left */}
      <div className="w-64 bg-slate-50 border-r border-slate-300 p-2 flex flex-col justify-between select-none">
        <div>
          <div className="bg-fuchsia-50 border border-fuchsia-300 rounded-lg p-3 mb-2 flex items-center space-x-3 shadow-xs">
            <Users className="w-8 h-8 text-fuchsia-600" />
            <div>
              <h2 className="font-black text-slate-800 text-sm">Gestion Clients</h2>
              <span className="text-[11px] text-slate-500 font-semibold">{clients.length} clients répertoriés</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold text-slate-700">
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <Edit3 className="w-4 h-4 text-emerald-600 mb-1" />
              <span>Modifier</span>
            </button>
            <button className="bg-white hover:bg-rose-50 border border-rose-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition text-rose-700">
              <Trash2 className="w-4 h-4 text-rose-600 mb-1" />
              <span>Supprimer</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <span>📅</span>
              <span>Liste Échéances</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <Search className="w-4 h-4 text-sky-600 mb-1" />
              <span>Recherche Client</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <span>💳</span>
              <span>Gestion Fidélité</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <span>💰</span>
              <span>Payement Encours</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <Gift className="w-4 h-4 text-fuchsia-600 mb-1" />
              <span>Carte Cadeau</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <History className="w-4 h-4 text-indigo-600 mb-1" />
              <span>Historique</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <span>🎟️</span>
              <span>Bon d'achat</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <Send className="w-4 h-4 text-teal-600 mb-1" />
              <span>Envoyer</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <span>🧾</span>
              <span>Saisie Doc Vente</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <span>⚖️</span>
              <span>Correction Règ.</span>
            </button>
          </div>
        </div>

        {/* Export buttons */}
        <div className="flex space-x-2 pt-2 border-t border-slate-200">
          <button className="flex-1 bg-white border border-slate-300 py-1 rounded text-xs font-bold text-slate-700 flex items-center justify-center space-x-1 shadow-xs hover:bg-slate-100">
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Imprimer</span>
          </button>
          <button className="flex-1 bg-white border border-slate-300 py-1 rounded text-xs font-bold text-slate-700 flex items-center justify-center space-x-1 shadow-xs hover:bg-slate-100">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Main Datagrid */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Répertoire des clients & Comptes tiers
          </div>
          <div className="w-72 relative">
            <input
              type="text"
              placeholder="Rechercher nom, société, téléphone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:border-fuchsia-500 shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-2 px-3">Nom Complet</th>
                <th className="py-2 px-3">Raison Social</th>
                <th className="py-2 px-3">Téléphone</th>
                <th className="py-2 px-3">Email</th>
                <th className="py-2 px-3">CP</th>
                <th className="py-2 px-3">Ville</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">Chargement des clients MariaDB...</td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">Aucun client trouvé.</td>
                </tr>
              ) : (
                clients.map((c, idx) => (
                  <tr key={idx} className="hover:bg-fuchsia-50/50 transition cursor-pointer">
                    <td className="py-2 px-3 font-bold text-slate-900">{c.FullName || '-'}</td>
                    <td className="py-2 px-3 text-slate-600">{c.RaisonSocial || '-'}</td>
                    <td className="py-2 px-3 text-sky-700 font-semibold">{c.Phone || '-'}</td>
                    <td className="py-2 px-3 text-slate-500">{c.Email || '-'}</td>
                    <td className="py-2 px-3 text-slate-700">{c.CP || '-'}</td>
                    <td className="py-2 px-3 text-slate-800 font-semibold">{c.City || '-'}</td>
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
file_put_contents("$pagesDir/ClientsPage.jsx", $clientsPage);

// SuppliersPage.jsx
$suppliersPage = <<<'JS'
import React, { useState, useEffect } from 'react';
import { Truck, Search, Plus, Trash2, Edit3, Printer, FileSpreadsheet } from 'lucide-react';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [tab, setTab] = useState('Tous');

  useEffect(() => {
    fetch('/api/suppliers')
      .then(res => res.json())
      .then(data => {
        if (data.success) setSuppliers(data.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="h-full flex overflow-hidden bg-slate-100">
      {/* 12 Action Tiles Left */}
      <div className="w-64 bg-slate-50 border-r border-slate-300 p-2 flex flex-col justify-between select-none">
        <div>
          <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 mb-2 flex items-center space-x-3 shadow-xs">
            <Truck className="w-8 h-8 text-emerald-600" />
            <div>
              <h2 className="font-black text-slate-800 text-sm">Fiche Fournisseur</h2>
              <span className="text-[11px] text-slate-500 font-semibold">Gestion des Achats & Stocks</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold text-slate-700">
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <Edit3 className="w-4 h-4 text-emerald-600 mb-1" />
              <span>Modifier</span>
            </button>
            <button className="bg-white hover:bg-rose-50 border border-rose-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition text-rose-700">
              <Trash2 className="w-4 h-4 text-rose-600 mb-1" />
              <span>Supprimer</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <span>📦</span>
              <span>État de stock</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <span>⚡</span>
              <span>Entrée Rapide</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <span>📥</span>
              <span>Entrée Stock</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <span>📜</span>
              <span>Historique</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <span>↩️</span>
              <span>Return Achats</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-center justify-center text-center shadow-xs transition">
              <span>💸</span>
              <span>Mes Dépenses</span>
            </button>
          </div>
        </div>

        <div className="flex space-x-2 pt-2 border-t border-slate-200">
          <button className="flex-1 bg-white border border-slate-300 py-1 rounded text-xs font-bold text-slate-700 flex items-center justify-center space-x-1 shadow-xs hover:bg-slate-100">
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Imprimer</span>
          </button>
          <button className="flex-1 bg-white border border-slate-300 py-1 rounded text-xs font-bold text-slate-700 flex items-center justify-center space-x-1 shadow-xs hover:bg-slate-100">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Document type filter tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center justify-between">
          <div className="flex space-x-2">
            {['Tous', 'Factures', 'Bon Livraison', 'Bon Commande', 'Return Achats'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 rounded text-xs font-bold transition ${
                  tab === t 
                    ? 'bg-emerald-600 text-white shadow' 
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="w-64 relative">
            <input
              type="text"
              placeholder="Rechercher fournisseur..."
              className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1 text-xs outline-none focus:border-emerald-500 shadow-inner"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1.5" />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-2 px-3">Document</th>
                <th className="py-2 px-3">Date Document</th>
                <th className="py-2 px-3 text-right">Total HT</th>
                <th className="py-2 px-3">Raison Social</th>
                <th className="py-2 px-3 text-center">Total Quantité</th>
                <th className="py-2 px-3">Utilisateur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td colSpan="6" className="text-center py-16 text-slate-400 italic">
                  Aucun document d'achat pour la période sélectionnée.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
JS;
file_put_contents("$pagesDir/SuppliersPage.jsx", $suppliersPage);

// ChartsPage.jsx
$chartsPage = <<<'JS'
import React, { useState, useEffect } from 'react';
import { DollarSign, Package, Users, ShoppingCart, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

export default function ChartsPage() {
  const [stats, setStats] = useState({
    productsCount: 75,
    clientsCount: 37,
    salesCount: 9,
    monthlySales: 2296.70,
    dailySales: 0.00,
    expensesTotal: 1000.00,
    vendorsShare: [{ Vendeur: 'amar', amount: 1906.95 }, { Vendeur: 'Khaled', amount: 389.75 }]
  });

  useEffect(() => {
    fetch('/api/stats/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data.success) setStats(data.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-slate-100 p-3 space-y-3">
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        {/* Card 1: Dépenses (Green) */}
        <div className="bg-white border-2 border-emerald-500 rounded-xl p-3 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Dépenses</span>
            <span className="text-2xl font-black text-emerald-600">{stats.expensesTotal.toFixed(2)} €</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Produits (Blue) */}
        <div className="bg-white border-2 border-sky-500 rounded-xl p-3 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Tous les Produits</span>
            <span className="text-2xl font-black text-sky-600">{stats.productsCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Clients (Pink) */}
        <div className="bg-white border-2 border-fuchsia-500 rounded-xl p-3 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Tous les clients</span>
            <span className="text-2xl font-black text-fuchsia-600">{stats.clientsCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-fuchsia-100 text-fuchsia-700 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Ventes (Coral) */}
        <div className="bg-white border-2 border-rose-500 rounded-xl p-3 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Toutes les Ventes</span>
            <span className="text-2xl font-black text-rose-600">{stats.salesCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Analytical Cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Analyse des ventes */}
        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs">
          <h3 className="font-extrabold text-rose-600 text-sm mb-2 border-b pb-1">Analyse des ventes</h3>
          <div className="text-3xl font-black text-slate-800 mb-2">{stats.monthlySales.toFixed(2)} €</div>
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <div>Objectif : <span className="text-sky-600 font-bold">2 019,05 €</span></div>
            <div className="text-rose-600 flex items-center space-x-1">
              <TrendingDown className="w-4 h-4" />
              <span>Tendance : -59%</span>
            </div>
          </div>
        </div>

        {/* Analyse des achats */}
        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs">
          <h3 className="font-extrabold text-indigo-600 text-sm mb-2 border-b pb-1">Analyse des achats</h3>
          <div className="text-3xl font-black text-slate-800 mb-2">115,97 €</div>
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <div>Objectif : <span className="text-sky-600 font-bold">152 325.36 €</span></div>
            <div className="text-slate-500">Tendance : 0%</div>
          </div>
        </div>

        {/* Performance Jours */}
        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs">
          <h3 className="font-extrabold text-teal-600 text-sm mb-2 border-b pb-1">Performances Jours</h3>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div>Lundi : 0,00 €</div>
            <div>Vendredi : 0,00 €</div>
            <div>Mardi : 0,00 €</div>
            <div>Samedi : 0,00 €</div>
            <div>Mercredi : 0,00 €</div>
            <div>Dimanche : 0,00 €</div>
          </div>
        </div>
      </div>

      {/* Distribution charts & tables */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {/* Vendeurs share */}
        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <h4 className="font-bold text-xs uppercase text-slate-500 mb-2">Répartition par Vendeur</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>amar (83.03%)</span>
                <span>1 906,95 €</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-sky-600 h-3 rounded-full" style={{ width: '83%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Khaled (16.97%)</span>
                <span>389,75 €</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-teal-500 h-3 rounded-full" style={{ width: '17%' }}></div>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 italic text-right mt-4">Calculé sur la session active</div>
        </div>

        {/* Rayons share */}
        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <h4 className="font-bold text-xs uppercase text-slate-500 mb-2">Ventes par Rayon</h4>
          <div className="space-y-2 text-xs font-semibold">
            <div className="flex justify-between">
              <span>Informatique</span>
              <span className="font-bold text-slate-800">34.08%</span>
            </div>
            <div className="flex justify-between">
              <span>Électroménager</span>
              <span className="font-bold text-slate-800">24.17%</span>
            </div>
            <div className="flex justify-between">
              <span>Energy</span>
              <span className="font-bold text-slate-800">1.52%</span>
            </div>
            <div className="flex justify-between">
              <span>Alimentation & Épicerie</span>
              <span className="font-bold text-slate-800">0.90%</span>
            </div>
          </div>
          <div className="mt-2 text-center text-xs font-black text-emerald-600 bg-emerald-50 py-1 rounded border border-emerald-200">
            Objectif du Jour : 100% Atteint
          </div>
        </div>
      </div>
    </div>
  );
}
JS;
file_put_contents("$pagesDir/ChartsPage.jsx", $chartsPage);

// App.jsx
$appJs = <<<'JS'
import React, { useState } from 'react';
import TopBanner from './components/TopBanner';
import Sidebar from './components/Sidebar';
import BottomBar from './components/BottomBar';

import PosPage from './pages/PosPage';
import ArticlesPage from './pages/ArticlesPage';
import ClientsPage from './pages/ClientsPage';
import SuppliersPage from './pages/SuppliersPage';
import ChartsPage from './pages/ChartsPage';

export default function App() {
  const [activeModule, setActiveModule] = useState('pos');

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'pos':
        return <PosPage />;
      case 'articles':
        return <ArticlesPage />;
      case 'clients':
        return <ClientsPage />;
      case 'suppliers':
        return <SuppliersPage />;
      case 'charts':
        return <ChartsPage />;
      case 'settings':
        return (
          <div className="h-full flex items-center justify-center text-slate-400 font-bold text-base">
            Module Paramètres Système en cours de configuration.
          </div>
        );
      default:
        return <PosPage />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-200">
      {/* Top Banner */}
      <TopBanner />

      {/* Main Content Area: Left Sidebar + Central Module Workspace */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeModule={activeModule} onChangeModule={setActiveModule} />
        <main className="flex-1 overflow-hidden">
          {renderActiveModule()}
        </main>
      </div>

      {/* Bottom Status Bar */}
      <BottomBar />
    </div>
  );
}
JS;
file_put_contents("$srcDir/App.jsx", $appJs);

// main.jsx
$mainJs = <<<'JS'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
JS;
file_put_contents("$srcDir/main.jsx", $mainJs);

echo "All pages and App.jsx generated successfully.\n";
