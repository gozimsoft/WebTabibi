<?php
$appPath = 'D:/Github/Utopia_react/frontend/src/App.tsx';

$appContent = <<<'TS'
import React, { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import ArticlesPage from './features/articles/ArticlesPage';
import PosPage from './pages/PosPage';
import ClientsPage from './pages/ClientsPage';
import SuppliersPage from './pages/SuppliersPage';
import ChartsPage from './pages/ChartsPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const [activeModule, setActiveModule] = useState('articles');

  const renderModule = () => {
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
      case 'stats':
      case 'charts':
        return <ChartsPage />;
      case 'settings':
        return (
          <div className="h-full flex flex-col items-center justify-center text-nuit/40 space-y-2">
            <div className="font-heading font-bold text-base text-nuit">Paramètres du système</div>
            <div className="text-xs">Configuration des imprimantes tickets, TVA et sauvegardes.</div>
          </div>
        );
      default:
        return <ArticlesPage />;
    }
  };

  return (
    <AppLayout activeModule={activeModule} onSelectModule={setActiveModule}>
      {renderModule()}
    </AppLayout>
  );
}
TS;
file_put_contents($appPath, $appContent);
echo "App.tsx updated to use features/articles/ArticlesPage.\n";
