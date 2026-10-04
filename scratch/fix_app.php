<?php
$appPath = 'D:/Github/Utopia_react/frontend/src/App.jsx';

$appUpdated = <<<'JS'
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
      <TopBanner />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeModule={activeModule} onChangeModule={setActiveModule} />
        <main className="flex-1 overflow-hidden">
          {renderActiveModule()}
        </main>
      </div>

      <BottomBar />
    </div>
  );
}
JS;
file_put_contents($appPath, $appUpdated);
echo "Successfully updated App.jsx\n";
