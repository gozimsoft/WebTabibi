<?php
$appFile = 'D:/Github/Utopia_react/frontend/src/App.tsx';

$content = <<<'TSX'
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
  const [activeModule, setActiveModule] = useState('dashboard');

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActiveModule} />;
      case 'pos':
        return <PosPage onReturnDashboard={() => setActiveModule('dashboard')} />;
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
          <div className="h-full flex items-center justify-center text-slate-500 font-bold text-base bg-slate-100">
            <div className="bg-white p-8 rounded-2xl border-2 border-slate-300 shadow-xl max-w-md text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-900 mx-auto flex items-center justify-center font-black shadow-md">
                ⚙️
              </div>
              <h3 className="text-lg font-black text-slate-800">Paramètres du Système</h3>
              <p className="text-xs text-slate-500 font-medium">
                Configuration des périphériques (imprimantes tickets 80mm, tiroir caisse, scanners) et sauvegardes MariaDB.
              </p>
            </div>
          </div>
        );
      default:
        return <DashboardPage onNavigate={setActiveModule} />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-200 select-none">
      {/* Top Banner with Dark Header & Amber Icon Badge */}
      <TopBanner />

      {/* Main Area: Original Left Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeModule={activeModule} onChangeModule={setActiveModule} />
        
        <main className="flex-1 overflow-hidden bg-slate-100">
          {renderActiveModule()}
        </main>
      </div>

      {/* Bottom Status Bar */}
      <BottomBar />
    </div>
  );
}
TSX;

file_put_contents($appFile, $content);
echo "Updated App.tsx successfully\n";
