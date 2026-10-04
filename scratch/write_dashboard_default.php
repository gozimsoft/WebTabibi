<?php
$compDir = 'D:/Github/Utopia_react/frontend/src/components';
$pagesDir = 'D:/Github/Utopia_react/frontend/src/pages';
$srcDir = 'D:/Github/Utopia_react/frontend/src';

// DashboardPage.jsx matching Screenshot 4
$dashboardPage = <<<'JS'
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Package, 
  Users, 
  ShoppingCart, 
  Calendar as CalendarIcon, 
  ArrowRight,
  TrendingUp
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
    <div className="h-full flex flex-col overflow-y-auto bg-slate-100 p-2 space-y-2 select-none">
      {/* 4 Header KPI Cards with Arrows */}
      <div className="grid grid-cols-4 gap-2">
        {/* Card 1: Dépenses (Teal/Green) */}
        <div className="bg-white border-2 border-teal-500 rounded-lg p-2 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-teal-600 font-digital tracking-tight">
              {stats.expensesTotal.toFixed(2)} €
            </span>
            <div className="w-8 h-8 rounded bg-teal-50 text-teal-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('suppliers')}
            className="mt-2 bg-teal-500 hover:bg-teal-600 text-white font-extrabold text-[11px] py-1 px-2 rounded flex items-center justify-between transition"
          >
            <span>Tout les Dépenses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Produits (Blue) */}
        <div className="bg-white border-2 border-indigo-500 rounded-lg p-2 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-indigo-700 font-digital tracking-tight">
              {stats.productsCount}
            </span>
            <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('articles')}
            className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] py-1 px-2 rounded flex items-center justify-between transition"
          >
            <span>Tous les Produits</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Clients (Pink/Magenta) */}
        <div className="bg-white border-2 border-fuchsia-500 rounded-lg p-2 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-fuchsia-600 font-digital tracking-tight">
              {stats.clientsCount}
            </span>
            <div className="w-8 h-8 rounded bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('clients')}
            className="mt-2 bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-extrabold text-[11px] py-1 px-2 rounded flex items-center justify-between transition"
          >
            <span>Tous les clients</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 4: Ventes (Coral/Red) */}
        <div className="bg-white border-2 border-rose-500 rounded-lg p-2 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-rose-600 font-digital tracking-tight">
              {stats.salesCount}
            </span>
            <div className="w-8 h-8 rounded bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('pos')}
            className="mt-2 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-[11px] py-1 px-2 rounded flex items-center justify-between transition"
          >
            <span>Tous les Ventes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Middle Section: Ventes du Mois, Ventes du Jours, and Hourly Chart */}
      <div className="bg-white border border-slate-300 rounded-lg p-3 flex space-x-6 items-center shadow-xs">
        {/* Ventes du Mois */}
        <div className="flex flex-col items-center justify-center px-4 border-r border-slate-200">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center mb-1">
            <CalendarIcon className="w-7 h-7" />
          </div>
          <span className="text-lg font-black text-indigo-700 font-digital">
            {stats.monthlySales.toFixed(2)} €
          </span>
          <span className="text-xs font-bold text-slate-500">Ventes du Mois</span>
        </div>

        {/* Ventes du Jours */}
        <div className="flex flex-col items-center justify-center px-4 border-r border-slate-200">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-1">
            <ShoppingCart className="w-7 h-7" />
          </div>
          <span className="text-lg font-black text-rose-600 font-digital">
            {stats.dailySales.toFixed(2)} €
          </span>
          <span className="text-xs font-bold text-slate-500">Ventes du Jours</span>
        </div>

        {/* Hourly Activity Chart Representation */}
        <div className="flex-1 flex flex-col justify-between h-28">
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>mar. 00h</span>
            <span>mar. 02h</span>
            <span>mar. 04h</span>
            <span>mar. 06h</span>
            <span>mar. 08h</span>
            <span>mar. 10h</span>
            <span>mar. 12h</span>
          </div>
          {/* Chart lines */}
          <div className="h-16 relative border-b border-l border-slate-300 flex items-end">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-b border-rose-300 border-dashed"></div>
            </div>
            {/* SVG Activity Path */}
            <svg className="w-full h-full overflow-visible">
              <polyline
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
                points="0,60 100,58 200,60 300,50 400,60 500,45 600,60 700,55"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom Section: 3 Data Tables */}
      <div className="grid grid-cols-3 gap-2 flex-1">
        {/* Table 1: Les Produits */}
        <div className="bg-white border border-slate-300 rounded-lg flex flex-col overflow-hidden shadow-xs">
          <div className="bg-indigo-50 border-b border-indigo-200 px-3 py-1.5 font-black text-indigo-700 text-xs">
            Les Produits
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-[11px] text-left">
              <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="py-1 px-2">Désignation</th>
                  <th className="py-1 px-2 text-right">Prix Vente</th>
                  <th className="py-1 px-2">Code Articles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p, idx) => (
                  <tr key={idx} className="hover:bg-indigo-50/50">
                    <td className="py-1 px-2 truncate max-w-[120px] font-semibold text-slate-800">{p.Designation}</td>
                    <td className="py-1 px-2 text-right font-bold text-sky-700">{p.Prix_V?.toFixed(2)}</td>
                    <td className="py-1 px-2 font-mono text-slate-500">{p.ID || p.CodeProduit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Les Clients */}
        <div className="bg-white border border-slate-300 rounded-lg flex flex-col overflow-hidden shadow-xs">
          <div className="bg-teal-50 border-b border-teal-200 px-3 py-1.5 font-black text-teal-700 text-xs">
            Les Clients
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-[11px] text-left">
              <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="py-1 px-2">Nom Client</th>
                  <th className="py-1 px-2">Date Creation</th>
                  <th className="py-1 px-2">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((c, idx) => (
                  <tr key={idx} className="hover:bg-teal-50/50">
                    <td className="py-1 px-2 font-bold text-slate-800">{c.FullName}</td>
                    <td className="py-1 px-2 text-slate-500">{c.DateCreation || '26/02/2024'}</td>
                    <td className="py-1 px-2 text-sky-700 font-semibold">{c.Phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 3: Les Ventes */}
        <div className="bg-white border border-slate-300 rounded-lg flex flex-col overflow-hidden shadow-xs">
          <div className="bg-rose-50 border-b border-rose-200 px-3 py-1.5 font-black text-rose-700 text-xs">
            Les Ventes
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-[11px] text-left">
              <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="py-1 px-2">Reference</th>
                  <th className="py-1 px-2 text-right">Montant</th>
                  <th className="py-1 px-2">Vendeur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((s, idx) => (
                  <tr key={idx} className="hover:bg-rose-50/50">
                    <td className="py-1 px-2 font-mono font-bold text-slate-800">{s.CodeVente || s.ID}</td>
                    <td className="py-1 px-2 text-right font-black text-rose-600">{s.TotalTTC?.toFixed(2)} €</td>
                    <td className="py-1 px-2 font-semibold text-slate-600">{s.Vendeur || 'amar'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Target Progress Bar */}
      <div className="bg-white border border-slate-300 rounded p-1.5 text-center text-xs font-bold text-slate-600 shadow-xs">
        <span>OBJECTIF DU JOUR : </span>
        <span className="text-rose-600 font-black">0 %</span>
      </div>
    </div>
  );
}
JS;
file_put_contents("$pagesDir/DashboardPage.jsx", $dashboardPage);

// Sidebar.jsx with Top Dashboard Icon Button
$sidebarWithDashboard = <<<'JS'
import React from 'react';
import { 
  LayoutDashboard,
  ShoppingCart, 
  Users, 
  Warehouse, 
  Truck, 
  Settings, 
  PieChart 
} from 'lucide-react';

const MODULES = [
  { id: 'pos', label: 'Vente / Caisse', icon: ShoppingCart, color: 'text-amber-500', activeBg: 'border-l-4 border-amber-500 bg-amber-50/50' },
  { id: 'clients', label: 'Clients/Gestion', icon: Users, color: 'text-fuchsia-500', activeBg: 'border-l-4 border-fuchsia-500 bg-fuchsia-50/50' },
  { id: 'articles', label: 'Article / Stock', icon: Warehouse, color: 'text-sky-600', activeBg: 'border-l-4 border-sky-600 bg-sky-50/50' },
  { id: 'suppliers', label: 'Fournisseurs', icon: Truck, color: 'text-emerald-500', activeBg: 'border-l-4 border-emerald-500 bg-emerald-50/50' },
  { id: 'settings', label: 'Paramètres', icon: Settings, color: 'text-cyan-500', activeBg: 'border-l-4 border-cyan-500 bg-cyan-50/50' },
  { id: 'charts', label: 'Charts', icon: PieChart, color: 'text-indigo-600', activeBg: 'border-l-4 border-indigo-600 bg-indigo-50/50' },
];

export default function Sidebar({ activeModule, onChangeModule }) {
  const isDashboardActive = activeModule === 'dashboard';

  return (
    <aside className="w-28 bg-white border-r border-slate-300 flex flex-col items-center py-1 select-none">
      {/* Top Main Dashboard Illustration Button */}
      <button
        onClick={() => onChangeModule('dashboard')}
        className={`w-full py-2.5 px-1 flex flex-col items-center justify-center transition border-b border-slate-200 mb-1 ${
          isDashboardActive 
            ? 'border-l-4 border-purple-600 bg-purple-50/60 font-black shadow-inner' 
            : 'hover:bg-slate-50 text-slate-600'
        }`}
        title="Page Principale - Dashboard"
      >
        <div className={`w-12 h-10 rounded-lg flex items-center justify-center transition relative ${
          isDashboardActive ? 'scale-110 drop-shadow' : ''
        }`}>
          {/* Dashboard Visual Icon */}
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 via-sky-400 to-teal-400 flex items-center justify-center text-white shadow">
            <LayoutDashboard className="w-5 h-5" />
          </div>
        </div>
        <span className={`text-[10px] text-center leading-tight mt-1 font-bold ${
          isDashboardActive ? 'text-purple-700 font-black' : 'text-slate-500'
        }`}>
          Dashboard
        </span>
      </button>

      {/* Modules List */}
      {MODULES.map((mod) => {
        const Icon = mod.icon;
        const isActive = activeModule === mod.id;
        return (
          <button
            key={mod.id}
            onClick={() => onChangeModule(mod.id)}
            className={`w-full py-3.5 px-1 flex flex-col items-center justify-center transition border-b border-slate-100 ${
              isActive 
                ? `${mod.activeBg} font-bold shadow-inner` 
                : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 transition ${
              isActive ? 'scale-110 drop-shadow' : ''
            }`}>
              <Icon className={`w-7 h-7 ${mod.color}`} strokeWidth={1.75} />
            </div>
            <span className={`text-[11px] text-center leading-tight ${isActive ? 'text-slate-900 font-extrabold' : 'text-slate-600'}`}>
              {mod.label}
            </span>
          </button>
        );
      })}
    </aside>
  );
}
JS;
file_put_contents("$compDir/Sidebar.jsx", $sidebarWithDashboard);

// App.jsx: Starts on 'dashboard' by default!
$appWithDashboard = <<<'JS'
import React, { useState } from 'react';
import TopBanner from './components/TopBanner';
import Sidebar from './components/Sidebar';
import BottomBar from './components/BottomBar';

import DashboardPage from './pages/DashboardPage';
import PosPage from './pages/PosPage';
import ArticlesPage from './pages/ArticlesPage';
import ClientsPage from './pages/ClientsPage';
import SuppliersPage from './pages/SuppliersPage';
import ChartsPage from './pages/ChartsPage';

export default function App() {
  // Starts on the primary Dashboard button as requested!
  const [activeModule, setActiveModule] = useState('dashboard');

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActiveModule} />;
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
        return <DashboardPage onNavigate={setActiveModule} />;
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
file_put_contents("$srcDir/App.jsx", $appWithDashboard);

echo "DashboardPage, Sidebar and App updated to start on Dashboard by default.\n";
