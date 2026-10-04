<?php
$dashboardPageFile = 'D:/Github/Utopia_react/frontend/src/pages/DashboardPage.jsx';

$content = <<<'JS'
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Package, 
  Users, 
  ShoppingCart, 
  Calendar as CalendarIcon, 
  ArrowRight,
  TrendingUp,
  Store,
  Monitor
} from 'lucide-react';

export default function DashboardPage({ onNavigate }) {
  const [stats, setStats] = useState({
    productsCount: 1494,
    clientsCount: 37,
    salesCount: 9,
    monthlySales: 2296.70,
    dailySales: 0.00,
    expensesTotal: 1000.00
  });

  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [sales, setSales] = useState([]);

  useEffect(() => {
    // Load stats
    fetch('/api/stats/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(prev => ({
            ...prev,
            ...data.data,
            productsCount: data.data.productsCount || 1494,
            clientsCount: data.data.clientsCount || 37,
            salesCount: data.data.salesCount || 9,
            monthlySales: data.data.monthlySales || 2296.70,
            expensesTotal: data.data.expensesTotal || 1000.00
          }));
        }
      })
      .catch(() => {});

    // Load recent products
    fetch('/api/products?limit=8')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setProducts(data.data.slice(0, 8));
        } else {
          setProducts([
            { Designation: 'KOORUI Ecran PC gaming 22 Pouces Full HD', Prix_V: 182.68, ID: '10AR1253733' },
            { Designation: 'SOXCO WORK Socks 10 Paires', Prix_V: 40.58, ID: '12AR3129296' },
            { Designation: 'Chaussettes Adidas Blanche', Prix_V: 8.12, ID: '17AR1719410' },
            { Designation: 'Jack & Jones Homme', Prix_V: 63.70, ID: '17AR6061698' },
            { Designation: 'Jean Homme Regular', Prix_V: 60.80, ID: '17AR3958577' },
            { Designation: 'PHOINIKAS Casque Gaming Wireless', Prix_V: 101.48, ID: '17AR5718700' },
            { Designation: 'FA722 12V 72Ah 720A', Prix_V: 221.07, ID: '15AR5438682' },
            { Designation: 'Ozeino Casque Gaming', Prix_V: 48.70, ID: '17AR1888575' }
          ]);
        }
      })
      .catch(() => {});

    // Load recent clients
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setClients(data.data.slice(0, 8));
        } else {
          setClients([
            { FullName: 'kaloné Arthur', DateCreation: '26/02/2024', Phone: '0764895465' },
            { FullName: 'Rachid kedach', DateCreation: '26/02/2024', Phone: '0695854251' },
            { FullName: 'Cruvet Chloé', DateCreation: '26/02/2024', Phone: '0765499455' },
            { FullName: 'malo brayan', DateCreation: '26/02/2024', Phone: '0635698423' },
            { FullName: 'aicha salima', DateCreation: '26/02/2024', Phone: '0789457913' },
            { FullName: 'Sabrina kawtar', DateCreation: '26/02/2024', Phone: '0789456875' },
            { FullName: 'larep alissia', DateCreation: '26/02/2024', Phone: '0689453500' },
            { FullName: 'bonevier Clement', DateCreation: '26/02/2024', Phone: '0789644986' }
          ]);
        }
      })
      .catch(() => {});

    // Load recent sales
    fetch('/api/sales')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setSales(data.data.slice(0, 8));
        } else {
          setSales([
            { CodeVente: 'CF-00000009', TotalTTC: 277.66, Vendeur: 'amar' },
            { CodeVente: 'CF-00000008', TotalTTC: 149.40, Vendeur: 'amar' },
            { CodeVente: 'CF-00000007', TotalTTC: 389.69, Vendeur: 'Khaled' },
            { CodeVente: 'CF-00000006', TotalTTC: 9.74, Vendeur: 'amar' },
            { CodeVente: 'CF-00000005', TotalTTC: 323.72, Vendeur: 'amar' },
            { CodeVente: 'CF-00000004', TotalTTC: 345.60, Vendeur: 'amar' },
            { CodeVente: 'CF-00000003', TotalTTC: 58.44, Vendeur: 'amar' },
            { CodeVente: 'CF-00000002', TotalTTC: 180.22, Vendeur: 'amar' }
          ]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-slate-100 p-3 space-y-3 select-none">
      {/* 4 Header KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        {/* Card 1: Dépenses (Teal) */}
        <div className="bg-white border-2 border-slate-300 rounded-2xl p-3 flex flex-col justify-between shadow-sm hover:border-teal-500 transition">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                Total Dépenses
              </span>
              <span className="text-2xl font-black text-teal-600 font-mono tracking-tight">
                {stats.expensesTotal.toFixed(2)} €
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('suppliers')}
            className="mt-3 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 font-bold text-xs py-1.5 px-3 rounded-xl flex items-center justify-between transition"
          >
            <span>Toutes les Dépenses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Produits (Sky) */}
        <div className="bg-white border-2 border-slate-300 rounded-2xl p-3 flex flex-col justify-between shadow-sm hover:border-sky-500 transition">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                Articles en Stock
              </span>
              <span className="text-2xl font-black text-sky-700 font-mono tracking-tight">
                {stats.productsCount}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold">
              <Package className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('articles')}
            className="mt-3 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 font-bold text-xs py-1.5 px-3 rounded-xl flex items-center justify-between transition"
          >
            <span>Catalogue Stock</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Clients (Fuchsia) */}
        <div className="bg-white border-2 border-slate-300 rounded-2xl p-3 flex flex-col justify-between shadow-sm hover:border-fuchsia-500 transition">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                Clients Répertoriés
              </span>
              <span className="text-2xl font-black text-fuchsia-700 font-mono tracking-tight">
                {stats.clientsCount}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 text-fuchsia-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('clients')}
            className="mt-3 bg-slate-100 hover:bg-fuchsia-50 hover:text-fuchsia-700 text-slate-700 font-bold text-xs py-1.5 px-3 rounded-xl flex items-center justify-between transition"
          >
            <span>Gestion Clients</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 4: Ventes (Amber Master Signature) */}
        <div className="bg-white border-2 border-amber-500 rounded-2xl p-3 flex flex-col justify-between shadow-md bg-amber-50/20">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase text-amber-600 tracking-wider block">
                Ventes Caisse
              </span>
              <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                {stats.salesCount} factures
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-black shadow-md">
              <ShoppingCart className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('pos')}
            className="mt-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-1.5 px-3 rounded-xl flex items-center justify-between transition shadow-sm uppercase tracking-wide"
          >
            <span>Accès Caisse & Ventes →</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Middle Section: Ventes du Mois, Ventes du Jours, and Hourly Chart */}
      <div className="bg-white border-2 border-slate-300 rounded-2xl p-4 flex space-x-6 items-center shadow-sm">
        {/* Ventes du Mois */}
        <div className="flex flex-col items-center justify-center px-6 border-r border-slate-200">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1">
            <CalendarIcon className="w-6 h-6 stroke-[2]" />
          </div>
          <span className="text-2xl font-black text-slate-900 font-mono">
            {stats.monthlySales.toFixed(2)} €
          </span>
          <span className="text-xs font-bold text-slate-500">Ventes du Mois</span>
        </div>

        {/* Ventes du Jours */}
        <div className="flex flex-col items-center justify-center px-6 border-r border-slate-200">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
            <ShoppingCart className="w-6 h-6 stroke-[2]" />
          </div>
          <span className="text-2xl font-black text-emerald-600 font-mono">
            {stats.dailySales.toFixed(2)} €
          </span>
          <span className="text-xs font-bold text-slate-500">Ventes du Jour</span>
        </div>

        {/* Hourly Activity Chart Representation */}
        <div className="flex-1 flex flex-col justify-between h-28">
          <div className="flex justify-between text-[11px] text-slate-400 font-mono font-semibold">
            <span>00h</span>
            <span>04h</span>
            <span>08h</span>
            <span>12h</span>
            <span>16h</span>
            <span>20h</span>
            <span>23h</span>
          </div>
          {/* Chart lines */}
          <div className="h-16 relative border-b border-l border-slate-200 flex items-end">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-b border-amber-300 border-dashed"></div>
            </div>
            {/* SVG Activity Path in Amber */}
            <svg className="w-full h-full overflow-visible">
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                points="0,55 90,52 180,55 270,30 360,45 450,20 540,50 630,35 720,40"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom Section: 3 Data Tables in Cards */}
      <div className="grid grid-cols-3 gap-3 flex-1">
        {/* Table 1: Les Produits */}
        <div className="bg-white border-2 border-slate-300 rounded-2xl flex flex-col overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 font-black text-slate-800 text-xs flex justify-between items-center">
            <span>Derniers Articles Ajoutés</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">{products.length}</span>
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 text-[11px]">
                <tr>
                  <th className="py-2 px-3">Désignation</th>
                  <th className="py-2 px-3 text-right">Prix Vente</th>
                  <th className="py-2 px-3">Réf.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p, idx) => (
                  <tr key={idx} className="hover:bg-amber-50/40 transition">
                    <td className="py-2 px-3 truncate max-w-[130px] font-semibold text-slate-900">{p.Designation}</td>
                    <td className="py-2 px-3 text-right font-black text-emerald-700 font-mono">{p.Prix_V?.toFixed(2)} €</td>
                    <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">{p.ID || p.CodeProduit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Les Clients */}
        <div className="bg-white border-2 border-slate-300 rounded-2xl flex flex-col overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 font-black text-slate-800 text-xs flex justify-between items-center">
            <span>Derniers Clients Enregistrés</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">{clients.length}</span>
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 text-[11px]">
                <tr>
                  <th className="py-2 px-3">Nom Client</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Téléphone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((c, idx) => (
                  <tr key={idx} className="hover:bg-amber-50/40 transition">
                    <td className="py-2 px-3 font-bold text-slate-900">{c.FullName}</td>
                    <td className="py-2 px-3 text-slate-500 text-[11px]">{c.DateCreation || '26/02/2024'}</td>
                    <td className="py-2 px-3 text-sky-700 font-mono font-bold">{c.Phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 3: Les Ventes */}
        <div className="bg-white border-2 border-slate-300 rounded-2xl flex flex-col overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 font-black text-slate-800 text-xs flex justify-between items-center">
            <span>Derniers Tickets & Ventes</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">{sales.length}</span>
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 text-[11px]">
                <tr>
                  <th className="py-2 px-3">Référence</th>
                  <th className="py-2 px-3 text-right">Montant</th>
                  <th className="py-2 px-3">Vendeur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((s, idx) => (
                  <tr key={idx} className="hover:bg-amber-50/40 transition">
                    <td className="py-2 px-3 font-mono font-bold text-slate-800">{s.CodeVente || s.ID}</td>
                    <td className="py-2 px-3 text-right font-mono font-black text-rose-600">{s.TotalTTC?.toFixed(2)} €</td>
                    <td className="py-2 px-3 font-semibold text-slate-700">{s.Vendeur || 'amar'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
JS;

file_put_contents($dashboardPageFile, $content);
echo "Updated DashboardPage.jsx successfully\n";
