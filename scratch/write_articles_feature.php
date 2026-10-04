<?php
$frontDir = 'D:/Github/Utopia_react/frontend';
@mkdir("$frontDir/src/features/articles", 0777, true);

// ArticlesTable.tsx using TanStack Table & the requested style
$tableComp = <<<'TS'
import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { 
  Package, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Trash2, 
  Barcode, 
  History, 
  Check, 
  AlertTriangle, 
  FileText,
  Printer,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Layers
} from 'lucide-react';
import { Article } from '../../api/types';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface ArticlesTableProps {
  articles: Article[];
  onEditArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
  onStockMovement: (article: Article) => void;
  onPrintBarcode: (article: Article) => void;
  density: 'compact' | 'comfortable';
}

const columnHelper = createColumnHelper<Article>();

export function ArticlesTable({
  articles,
  onEditArticle,
  onDeleteArticle,
  onStockMovement,
  onPrintBarcode,
  density
}: ArticlesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const columns = useMemo(() => [
    // Select checkbox
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="rounded border-slate-300 text-nebuleuse focus:ring-nebuleuse cursor-pointer"
          aria-label="Sélectionner tous les articles"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-slate-300 text-nebuleuse focus:ring-nebuleuse cursor-pointer"
          aria-label={`Sélectionner ${row.original.designation}`}
        />
      ),
      size: 32,
    }),

    // Code Article
    columnHelper.accessor('codeArticle', {
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="flex items-center space-x-1 font-heading font-semibold hover:text-nuit"
        >
          <span>Code article</span>
          {column.getIsSorted() === 'asc' ? <ArrowUp className="w-3 h-3 text-nebuleuse" /> :
           column.getIsSorted() === 'desc' ? <ArrowDown className="w-3 h-3 text-nebuleuse" /> :
           <ArrowUpDown className="w-3 h-3 text-nuit/30" />}
        </button>
      ),
      cell: info => (
        <span className="font-mono font-bold text-nuit/90 tracking-tight">
          {info.getValue()}
        </span>
      ),
    }),

    // Désignation
    columnHelper.accessor('designation', {
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="flex items-center space-x-1 font-heading font-semibold hover:text-nuit"
        >
          <span>Désignation</span>
          {column.getIsSorted() === 'asc' ? <ArrowUp className="w-3 h-3 text-nebuleuse" /> :
           column.getIsSorted() === 'desc' ? <ArrowDown className="w-3 h-3 text-nebuleuse" /> :
           <ArrowUpDown className="w-3 h-3 text-nuit/30" />}
        </button>
      ),
      cell: info => (
        <div className="font-medium text-nuit hover:text-nebuleuse transition truncate max-w-md">
          {info.getValue()}
        </div>
      ),
    }),

    // Rayon & Catégorie
    columnHelper.accessor('rayon', {
      header: 'Rayon',
      cell: info => (
        <span className="text-xs text-nuit/70 font-normal">
          {info.getValue() || 'Général'}
        </span>
      ),
    }),

    // Stock & Alert badge
    columnHelper.accessor('stock', {
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="flex items-center justify-end w-full space-x-1 font-heading font-semibold hover:text-nuit"
        >
          <span>Stock</span>
          {column.getIsSorted() === 'asc' ? <ArrowUp className="w-3 h-3 text-nebuleuse" /> :
           column.getIsSorted() === 'desc' ? <ArrowDown className="w-3 h-3 text-nebuleuse" /> :
           <ArrowUpDown className="w-3 h-3 text-nuit/30" />}
        </button>
      ),
      cell: info => {
        const stock = info.getValue() || 0;
        const min = info.row.original.stockMin || 5;
        let badgeVariant: 'orbite' | 'soleil' | 'nova' = 'orbite';
        if (stock === 0) badgeVariant = 'nova';
        else if (stock <= min) badgeVariant = 'soleil';

        return (
          <div className="flex justify-end items-center space-x-1.5">
            <Badge variant={badgeVariant} className="font-mono text-xs tabular-nums px-2 py-0.5">
              {stock} {info.row.original.unite || 'pcs'}
            </Badge>
          </div>
        );
      },
    }),

    // Dernier Prix d'Achat
    columnHelper.accessor('dernierPrixAchat', {
      header: () => <div className="text-right">Dernier PA</div>,
      cell: info => (
        <div className="text-right font-mono text-nuit/70 tabular-nums">
          {formatCurrency(info.getValue())}
        </div>
      ),
    }),

    // Prix Vente HT
    columnHelper.accessor('prixVenteHT', {
      header: () => <div className="text-right">Prix Vente HT</div>,
      cell: info => (
        <div className="text-right font-mono text-nuit/80 tabular-nums">
          {formatCurrency(info.getValue())}
        </div>
      ),
    }),

    // Prix Vente TTC
    columnHelper.accessor('prixVenteTTC', {
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="flex items-center justify-end w-full space-x-1 font-heading font-semibold hover:text-nuit"
        >
          <span>Prix TTC</span>
          {column.getIsSorted() === 'asc' ? <ArrowUp className="w-3 h-3 text-nebuleuse" /> :
           column.getIsSorted() === 'desc' ? <ArrowDown className="w-3 h-3 text-nebuleuse" /> :
           <ArrowUpDown className="w-3 h-3 text-nuit/30" />}
        </button>
      ),
      cell: info => (
        <div className="text-right font-mono font-bold text-nuit tabular-nums">
          {formatCurrency(info.getValue())}
        </div>
      ),
    }),

    // CMUP
    columnHelper.accessor('cmup', {
      header: () => <div className="text-right">CMUP</div>,
      cell: info => (
        <div className="text-right font-mono text-nuit/60 tabular-nums">
          {formatCurrency(info.getValue())}
        </div>
      ),
    }),

    // Code à Barre
    columnHelper.accessor('codeBarre', {
      header: 'Code-barres',
      cell: info => (
        <span className="font-mono text-xs text-nuit/60 tracking-wider">
          {info.getValue() || '—'}
        </span>
      ),
    }),

    // Actions
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center space-x-1">
          <button
            onClick={() => onEditArticle(row.original)}
            className="p-1 text-nuit/50 hover:text-nebuleuse hover:bg-brume rounded-md transition"
            title="Modifier l'article"
          >
            <Edit3 className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => onPrintBarcode(row.original)}
            className="p-1 text-nuit/50 hover:text-nuit hover:bg-brume rounded-md transition"
            title="Imprimer code-barres"
          >
            <Barcode className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => onDeleteArticle(row.original.id)}
            className="p-1 text-nuit/50 hover:text-nova hover:bg-nova-light rounded-md transition"
            title="Supprimer"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>
      ),
    }),
  ], [onEditArticle, onDeleteArticle, onPrintBarcode]);

  const table = useReactTable({
    data: articles,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  });

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-surface rounded-2xl border border-slate-300 shadow-sm m-2">
      {/* Selection Banner if multiple rows are selected */}
      {selectedCount > 0 && (
        <div className="bg-brume px-4 py-2 border-b border-slate-300 flex items-center justify-between text-xs font-semibold text-nuit">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-nebuleuse text-white flex items-center justify-center text-[10px] font-bold">
              {selectedCount}
            </span>
            <span>article(s) sélectionné(s) pour action groupée</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" className="h-7 text-xs bg-white">
              <Barcode className="w-3 h-3 mr-1" strokeWidth={1.5} />
              Imprimer étiquettes
            </Button>
            <Button size="sm" variant="destructive" className="h-7 text-xs">
              <Trash2 className="w-3 h-3 mr-1" strokeWidth={1.5} />
              Supprimer la sélection
            </Button>
          </div>
        </div>
      )}

      {/* Main TanStack Table Container */}
      <div className="flex-1 overflow-auto">
        <table className={`w-full text-xs text-left ${density === 'compact' ? 'table-compact' : 'table-comfortable'}`}>
          <thead className="bg-slate-100 text-nuit/70 uppercase text-[11px] font-heading font-semibold sticky top-0 z-10 border-b border-slate-200">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-3 py-2">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-16 text-slate-400 italic">
                  Aucun article trouvé pour les filtres sélectionnés.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className={`hover:bg-brume/40 transition cursor-pointer ${
                    row.getIsSelected() ? 'bg-brume/70 font-semibold' : ''
                  }`}
                  onClick={() => onEditArticle(row.original)}
                >
                  {row.getVisibleCells().map(cell => (
                    <td 
                      key={cell.id} 
                      className="px-3"
                      onClick={e => {
                        // Prevent opening detail dialog when clicking checkbox or action button
                        if (cell.column.id === 'select' || cell.column.id === 'actions') {
                          e.stopPropagation();
                        }
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="h-11 bg-slate-50 border-t border-slate-200 px-4 flex items-center justify-between text-xs text-nuit/60 select-none">
        <div className="flex items-center space-x-4">
          <span>
            Affichage de <strong>{table.getRowModel().rows.length}</strong> sur <strong>{articles.length}</strong> articles
          </span>
          <div className="flex items-center space-x-1">
            <span>Lignes par page :</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs outline-none"
            >
              {[15, 25, 50, 100].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span>
            Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount() || 1}
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Page précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Page suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
TS;
file_put_contents("$frontDir/src/features/articles/ArticlesTable.tsx", $tableComp);

// ArticlesToolbar.tsx
$toolbarComp = <<<'TS'
import React from 'react';
import { 
  Search, 
  Plus, 
  Layers, 
  History, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Barcode, 
  ClipboardList, 
  TrendingDown, 
  FileText,
  FileSpreadsheet,
  Printer,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface ArticlesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  rayonFilter: string;
  onRayonFilterChange: (value: string) => void;
  stockFilter: string;
  onStockFilterChange: (value: string) => void;
  rayons: string[];
  onNewArticle: () => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
  onQuickMovement: () => void;
  onInventory: () => void;
}

export function ArticlesToolbar({
  search,
  onSearchChange,
  rayonFilter,
  onRayonFilterChange,
  stockFilter,
  onStockFilterChange,
  rayons,
  onNewArticle,
  onExportPdf,
  onExportExcel,
  onQuickMovement,
  onInventory
}: ArticlesToolbarProps) {
  return (
    <div className="bg-surface border-b border-slate-300 px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs select-none">
      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-2 flex-1">
        {/* Search input */}
        <div className="relative w-64 md:w-80">
          <input
            type="text"
            placeholder="Rechercher code, désignation ou code-barres..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-nuit outline-none focus:border-nebuleuse focus:bg-white shadow-inner font-medium"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" strokeWidth={1.5} />
          {search && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-nuit text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Rayon selector */}
        <select
          value={rayonFilter}
          onChange={e => onRayonFilterChange(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-nuit outline-none font-medium cursor-pointer hover:bg-white"
        >
          <option value="Tous">Tous les rayons</option>
          {rayons.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        {/* Stock Filter Pills */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
          {['Tous', 'En stock', 'Stock bas', 'Rupture'].map(status => (
            <button
              key={status}
              onClick={() => onStockFilterChange(status)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                stockFilter === status 
                  ? 'bg-white text-nuit shadow-xs font-semibold' 
                  : 'text-nuit/60 hover:text-nuit'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Actions (replaces Delphi icons grid with modern buttons) */}
      <div className="flex items-center space-x-2">
        {/* Secondary grouped actions */}
        <div className="flex items-center space-x-1 border-r border-slate-300 pr-2">
          <Button size="sm" variant="outline" onClick={onQuickMovement} className="text-xs h-8">
            <ArrowDownLeft className="w-3.5 h-3.5 mr-1 text-orbite" strokeWidth={1.5} />
            <span>Mouvement</span>
          </Button>

          <Button size="sm" variant="outline" onClick={onInventory} className="text-xs h-8">
            <ClipboardList className="w-3.5 h-3.5 mr-1 text-nebuleuse" strokeWidth={1.5} />
            <span>Inventaire</span>
          </Button>

          <Button size="sm" variant="outline" onClick={onExportPdf} className="text-xs h-8" title="Export PDF">
            <FileText className="w-3.5 h-3.5 text-nova" strokeWidth={1.5} />
          </Button>

          <Button size="sm" variant="outline" onClick={onExportExcel} className="text-xs h-8" title="Export Excel">
            <FileSpreadsheet className="w-3.5 h-3.5 text-orbite" strokeWidth={1.5} />
          </Button>
        </div>

        {/* Unique Primary Action Button */}
        <Button size="sm" variant="default" onClick={onNewArticle} className="text-xs h-8 font-semibold shadow-subtle">
          <Plus className="w-3.5 h-3.5 mr-1" strokeWidth={2} />
          <span>Nouvel article</span>
        </Button>
      </div>
    </div>
  );
}
TS;
file_put_contents("$frontDir/src/features/articles/ArticlesToolbar.tsx", $toolbarComp);

// ArticlesPage.tsx assembling the view
$pageComp = <<<'TS'
import React, { useState, useEffect } from 'react';
import { Package, Store, Monitor, ShieldCheck } from 'lucide-react';
import { ArticlesToolbar } from './ArticlesToolbar';
import { ArticlesTable } from './ArticlesTable';
import { getArticles } from '../../api/articles.api';
import { Article } from '../../api/types';
import { fr } from '../../i18n/fr';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [rayonFilter, setRayonFilter] = useState('Tous');
  const [stockFilter, setStockFilter] = useState('Tous');
  const [density, setDensity] = useState<'compact' | 'comfortable'>('compact');

  useEffect(() => {
    loadArticles();
  }, [search, rayonFilter]);

  const loadArticles = async () => {
    setLoading(true);
    const data = await getArticles(search, rayonFilter);
    setArticles(data);
    setLoading(false);
  };

  // Extract distinct rayons
  const rayons = Array.from(new Set(articles.map(a => a.rayon).filter(Boolean)));

  // Filter by stock status
  const filteredArticles = articles.filter(a => {
    if (stockFilter === 'En stock') return a.stock > (a.stockMin || 5);
    if (stockFilter === 'Stock bas') return a.stock > 0 && a.stock <= (a.stockMin || 5);
    if (stockFilter === 'Rupture') return a.stock === 0;
    return true;
  });

  const handleEdit = (article: Article) => {
    alert(`Édition de l'article : ${article.designation} (${article.codeArticle})`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Confirmer la suppression de cet article du catalogue ?")) {
      setArticles(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleStockMovement = (article: Article) => {
    alert(`Saisie de mouvement de stock pour ${article.designation}`);
  };

  const handlePrintBarcode = (article: Article) => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-fond">
      {/* 1. Header Banner matching the user's preferred style */}
      <div className="bg-gradient-to-r from-slate-900 via-nuit to-slate-900 text-white px-5 py-3 flex items-center justify-between shadow-sm select-none shrink-0 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-black shadow-sm">
            <Package className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-base font-heading font-black tracking-tight text-white leading-tight">
              Catalogue des Articles & Gestion de Stock
            </h2>
            <div className="text-xs text-white/50 font-medium">
              {filteredArticles.length} article(s) référencé(s) • Tarification, TVA et niveaux de réapprovisionnement
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
          <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
            <Monitor className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.5} />
            <span>Poste 02</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
            <Store className="w-3.5 h-3.5 text-orbite" strokeWidth={1.5} />
            <span>Magasin Principal</span>
          </div>
        </div>
      </div>

      {/* 2. Toolbar (Search, Filter Pills & Grouped Actions) */}
      <ArticlesToolbar
        search={search}
        onSearchChange={setSearch}
        rayonFilter={rayonFilter}
        onRayonFilterChange={setRayonFilter}
        stockFilter={stockFilter}
        onStockFilterChange={setStockFilter}
        rayons={rayons}
        onNewArticle={() => alert('Création d’un nouvel article (Dialogue Étape 4)')}
        onExportPdf={() => window.print()}
        onExportExcel={() => alert('Export Excel en cours de génération...')}
        onQuickMovement={() => alert('Mouvements de stock')}
        onInventory={() => alert('Module d’inventaire physique')}
      />

      {/* 3. Main Data Table */}
      <div className="flex-1 flex overflow-hidden p-2">
        <ArticlesTable
          articles={filteredArticles}
          onEditArticle={handleEdit}
          onDeleteArticle={handleDelete}
          onStockMovement={handleStockMovement}
          onPrintBarcode={handlePrintBarcode}
          density={density}
        />
      </div>
    </div>
  );
}
TS;
file_put_contents("$frontDir/src/features/articles/ArticlesPage.tsx", $pageComp);

echo "Step 3 Articles/Stock feature components written.\n";
