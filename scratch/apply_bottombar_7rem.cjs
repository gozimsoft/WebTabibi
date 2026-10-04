const fs = require('fs');

const filePath = 'D:/Github/Utopia_react/frontend/src/components/BottomBar.jsx';

const newContent = `import React, { useState, useEffect } from 'react';
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
    <footer className="h-28 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 border-t border-slate-300 flex items-center justify-between pr-3 select-none z-10">
      {/* Big Date and Clock Badge - w-28 h-28 (7rem x 7rem) taking the width and height of 7rem */}
      <div className="flex items-center space-x-3 h-full">
        <div className="w-28 h-28 bg-rose-500 text-white shadow-sm flex flex-col items-center justify-center leading-tight shrink-0 border-r border-rose-600 select-none">
          <div className="text-2xl font-black tracking-tight">{dayNumber}/{monthNumber}</div>
          <div className="text-xs font-bold uppercase tracking-wider text-rose-100 mt-0.5">{dayName}</div>
          <div className="text-xs font-mono font-black text-white tracking-widest mt-1 bg-rose-600/60 px-2 py-0.5 rounded border border-rose-400/40">
            {timeStr}
          </div>
        </div>

        {/* Station and Store info */}
        <div className="flex flex-col justify-center space-y-1.5 text-xs pl-2">
          <div className="flex items-center space-x-2 font-bold text-slate-700">
            <span>Nom Poste :</span>
            <span className="text-amber-600 font-extrabold">Post2</span>
            <Monitor className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 pl-2">Poste :</span>
            <span className="text-amber-600 font-extrabold">2</span>
          </div>

          <div className="flex items-center space-x-2">
            <select className="bg-white border-2 border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-700 shadow-xs outline-none font-semibold">
              <option>Windows</option>
              <option>Dark Mode</option>
            </select>
            <select className="bg-white border-2 border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-700 shadow-xs outline-none font-bold">
              <option>Store Principale</option>
              <option>Dépôt Secondaire</option>
            </select>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="flex items-center space-x-2.5">
        <button title="Synchronisation" className="w-12 h-12 rounded-xl border-2 border-teal-300 bg-white hover:bg-teal-50 flex items-center justify-center text-teal-600 shadow-xs transition hover:shadow-sm active:scale-95">
          <RefreshCw className="w-6 h-6 stroke-[2]" />
        </button>
        <button title="Rôles & Utilisateurs" className="w-12 h-12 rounded-xl border-2 border-rose-300 bg-white hover:bg-rose-50 flex items-center justify-center text-rose-500 shadow-xs transition hover:shadow-sm active:scale-95">
          <Users2 className="w-6 h-6 stroke-[2]" />
        </button>
        <button title="Configuration Rapide" className="w-12 h-12 rounded-xl border-2 border-red-300 bg-white hover:bg-red-50 flex items-center justify-center text-red-500 shadow-xs transition hover:shadow-sm active:scale-95">
          <Sliders className="w-6 h-6 stroke-[2]" />
        </button>
        <button title="Calendrier" className="w-12 h-12 rounded-xl border-2 border-amber-300 bg-white hover:bg-amber-50 flex items-center justify-center text-amber-500 shadow-xs transition hover:shadow-sm active:scale-95">
          <Calendar className="w-6 h-6 stroke-[2]" />
        </button>
        <button title="Clavier Virtuel" className="w-12 h-12 rounded-xl border-2 border-blue-300 bg-white hover:bg-blue-50 flex items-center justify-center text-blue-500 shadow-xs transition hover:shadow-sm active:scale-95">
          <Keyboard className="w-6 h-6 stroke-[2]" />
        </button>
        <button title="Fermer / Quitter" className="w-12 h-12 rounded-xl border-2 border-pink-400 bg-pink-500 hover:bg-pink-600 flex items-center justify-center text-white shadow-xs transition hover:shadow-sm active:scale-95">
          <ArrowRightCircle className="w-7 h-7 stroke-[2.25]" />
        </button>
      </div>
    </footer>
  );
}
`;

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Successfully written new BottomBar.jsx with height: 7rem');
