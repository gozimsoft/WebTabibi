<?php
$compDir = 'D:/Github/Utopia_react/frontend/src/components';

// TopBanner.jsx
$topBanner = <<<'JS'
import React from 'react';
import { Minus, Square, X, Headphones, Sparkles } from 'lucide-react';

export default function TopBanner() {
  return (
    <div className="h-14 bg-gradient-to-r from-sky-50 via-slate-100 to-sky-50 border-b border-slate-300 flex items-center justify-between px-3 select-none">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white shadow-md">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="flex items-baseline space-x-2">
            <h1 className="text-xl font-black text-slate-700 tracking-tight">Utopya <span className="text-sky-600">V1.0 2024</span></h1>
            <span className="text-xs italic text-slate-500 font-medium">L'utopie De la gestion</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] font-semibold text-slate-400">
            <span>France 2024</span>
            <span>•</span>
            <span className="text-slate-600">Version Standards</span>
            <span>•</span>
            <span className="text-rose-500 font-bold">Mono Poste</span>
          </div>
        </div>
      </div>

      {/* Center info */}
      <div className="hidden lg:flex items-center text-xs text-slate-400 italic">
        Connecté au serveur MariaDB local (utopia_db)
      </div>

      {/* Customer service & Window Controls */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => alert('Support Client Utopya: 062542154 / gozimsoft@gmail.com')}
          className="flex flex-col items-center justify-center hover:bg-sky-100 px-2 py-1 rounded transition text-slate-600 hover:text-sky-700"
          title="Customer Service"
        >
          <div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center shadow">
            <Headphones className="w-4 h-4" />
          </div>
          <span className="text-[9px] font-extrabold tracking-tighter uppercase mt-0.5">CUSTOMER SERVICE</span>
        </button>

        {/* Windows Buttons */}
        <div className="flex items-center space-x-1 pl-2 border-l border-slate-300">
          <button className="w-7 h-7 hover:bg-slate-200 rounded flex items-center justify-center text-slate-500">
            <Minus className="w-4 h-4" />
          </button>
          <button className="w-7 h-7 hover:bg-slate-200 rounded flex items-center justify-center text-slate-500">
            <Square className="w-3.5 h-3.5" />
          </button>
          <button className="w-7 h-7 hover:bg-rose-500 hover:text-white rounded flex items-center justify-center text-slate-500 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
JS;
file_put_contents("$compDir/TopBanner.jsx", $topBanner);

// Sidebar.jsx
$sidebar = <<<'JS'
import React from 'react';
import { 
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
  return (
    <aside className="w-28 bg-white border-r border-slate-300 flex flex-col items-center py-2 select-none">
      {MODULES.map((mod) => {
        const Icon = mod.icon;
        const isActive = activeModule === mod.id;
        return (
          <button
            key={mod.id}
            onClick={() => onChangeModule(mod.id)}
            className={`w-full py-4 px-1 flex flex-col items-center justify-center transition border-b border-slate-100 ${
              isActive 
                ? `${mod.activeBg} font-bold shadow-inner` 
                : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-1.5 transition ${
              isActive ? 'scale-110 drop-shadow' : ''
            }`}>
              <Icon className={`w-8 h-8 ${mod.color}`} strokeWidth={1.75} />
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
file_put_contents("$compDir/Sidebar.jsx", $sidebar);

// BottomBar.jsx
$bottomBar = <<<'JS'
import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Users2, 
  Sliders, 
  Calendar, 
  Keyboard, 
  ArrowRightCircle,
  Monitor
} from 'lucide-react';

export default function BottomBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dayNumber = time.getDate();
  const monthNumber = time.getMonth() + 1;
  const dayName = time.toLocaleDateString('fr-FR', { weekday: 'long' });
  const timeStr = time.toTimeString().split(' ')[0];

  return (
    <footer className="h-14 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 border-t border-slate-300 flex items-center justify-between px-2 select-none z-10">
      {/* Big Date and Clock Badge */}
      <div className="flex items-center space-x-3">
        <div className="bg-rose-500 text-white rounded-lg px-3 py-1 shadow flex flex-col items-center justify-center leading-tight">
          <div className="text-base font-black tracking-tight">{dayNumber}/{monthNumber}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider">{dayName}</div>
          <div className="text-[11px] font-digital font-bold text-rose-100 tracking-wider mt-0.5">{timeStr}</div>
        </div>

        {/* Station and Store info */}
        <div className="flex items-center space-x-3 text-xs pl-2">
          <div className="flex items-center space-x-1.5 font-bold text-slate-700">
            <span>Nom Poste :</span>
            <span className="text-amber-600">Post2</span>
            <Monitor className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 pl-2">Poste :</span>
            <span className="text-amber-600 font-bold">2</span>
          </div>

          <div className="flex items-center space-x-2 pl-3 border-l border-slate-300">
            <select className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-700 shadow-sm outline-none">
              <option>Windows</option>
              <option>Dark Mode</option>
            </select>
            <select className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-700 shadow-sm outline-none font-semibold">
              <option>Store Principale</option>
              <option>Dépôt Secondaire</option>
            </select>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="flex items-center space-x-2">
        <button title="Synchronisation" className="w-9 h-9 rounded-lg border border-teal-300 bg-teal-50 hover:bg-teal-100 flex items-center justify-center text-teal-600 shadow-sm transition">
          <RefreshCw className="w-5 h-5" />
        </button>
        <button title="Rôles & Utilisateurs" className="w-9 h-9 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 flex items-center justify-center text-rose-500 shadow-sm transition">
          <Users2 className="w-5 h-5" />
        </button>
        <button title="Configuration Rapide" className="w-9 h-9 rounded-lg border border-red-300 bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 shadow-sm transition">
          <Sliders className="w-5 h-5" />
        </button>
        <button title="Calendrier" className="w-9 h-9 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 flex items-center justify-center text-amber-500 shadow-sm transition">
          <Calendar className="w-5 h-5" />
        </button>
        <button title="Clavier Virtuel" className="w-9 h-9 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-500 shadow-sm transition">
          <Keyboard className="w-5 h-5" />
        </button>
        <button title="Fermer / Quitter" className="w-9 h-9 rounded-lg border border-pink-400 bg-pink-500 hover:bg-pink-600 flex items-center justify-center text-white shadow transition">
          <ArrowRightCircle className="w-6 h-6" />
        </button>
      </div>
    </footer>
  );
}
JS;
file_put_contents("$compDir/BottomBar.jsx", $bottomBar);

echo "TopBanner, Sidebar and BottomBar generated.\n";
