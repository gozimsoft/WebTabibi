<?php
$topBannerFile = 'D:/Github/Utopia_react/frontend/src/components/TopBanner.jsx';

$content = <<<'JS'
import React from 'react';
import { Minus, Square, X, Headphones, Sparkles, Monitor, Store } from 'lucide-react';

export default function TopBanner() {
  return (
    <div className="h-14 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/80 text-white flex items-center justify-between px-3 select-none z-20 shadow-md">
      {/* Brand & Logo with Amber Badge */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
          <Sparkles className="w-5 h-5 text-slate-900" />
        </div>
        <div>
          <div className="flex items-baseline space-x-2">
            <h1 className="text-base font-black text-white tracking-wide">
              Utopya <span className="text-amber-400">V1.0 2024</span>
            </h1>
            <span className="text-xs italic text-slate-400 font-semibold">L'utopie De la gestion</span>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-semibold text-slate-400">
            <span>France 2024</span>
            <span>•</span>
            <span className="text-slate-300">Version Standards</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">Mono Poste</span>
          </div>
        </div>
      </div>

      {/* Center MariaDB Status Badge */}
      <div className="hidden lg:flex items-center space-x-2 bg-slate-800/80 border border-slate-700 px-3 py-1 rounded-lg text-xs text-slate-300">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>MariaDB : <strong className="text-white font-mono">utopia_db</strong> (ACID)</span>
      </div>

      {/* Right Pills & Window Controls */}
      <div className="flex items-center space-x-3">
        {/* Exact Glass Pills from Screenshot */}
        <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-200 backdrop-blur-sm">
          <Monitor className="w-3.5 h-3.5 text-amber-400" />
          <span>Post2 (Caisse N° 2)</span>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-teal-300 backdrop-blur-sm">
          <Store className="w-3.5 h-3.5 text-teal-400" />
          <span>Store Principale</span>
        </div>

        {/* Customer service button */}
        <button 
          onClick={() => alert('Support Client Utopya: 062542154 / gozimsoft@gmail.com')}
          className="flex items-center space-x-1.5 bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-bold text-slate-200 transition"
          title="Customer Service"
        >
          <Headphones className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline text-[10px] tracking-wide uppercase">Support</span>
        </button>

        {/* Windows Buttons */}
        <div className="flex items-center space-x-1 pl-2 border-l border-slate-700">
          <button className="w-7 h-7 hover:bg-slate-700 rounded flex items-center justify-center text-slate-400 hover:text-white transition">
            <Minus className="w-4 h-4" />
          </button>
          <button className="w-7 h-7 hover:bg-slate-700 rounded flex items-center justify-center text-slate-400 hover:text-white transition">
            <Square className="w-3.5 h-3.5" />
          </button>
          <button className="w-7 h-7 hover:bg-rose-500 hover:text-white rounded flex items-center justify-center text-slate-400 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
JS;

file_put_contents($topBannerFile, $content);
echo "Updated TopBanner.jsx successfully\n";
