const fs = require('fs');

const posPageCode = `import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag,
  Coins,
  Calendar,
  FileText,
  RotateCcw,
  Edit3,
  CheckSquare,
  CreditCard,
  FileSpreadsheet,
  Send,
  Printer,
  Search,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import LaCaisseWindow from '../components/LaCaisseWindow';

export default function PosPage({ onOpenCaisse, onReturnDashboard }) {
  const [internalCaisseOpen, setInternalCaisseOpen] = useState(false);
  const [salesList, setSalesList] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '04/10/2023 00:01:01', end: '18/06/2024 23:59:59' });

  const handleOpenCaisse = () => {
    if (onOpenCaisse) {
      onOpenCaisse();
    } else {
      setInternalCaisseOpen(true);
    }
  };

  useEffect(() => {
    fetch('/api/sales')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          const formatted = data.data.map((s, idx) => ({
            type: Number(s.isFacture) === 1 ? 'Facture' : 'Ticket',
            reference: s.Reference || s.CodeVente || \`CF-\${String(idx + 1).padStart(8, '0')}\`,
            date: s.DateInvoice ? new Date(s.DateInvoice).toLocaleString('fr-FR') : (s.DateVente ? new Date(s.DateVente).toLocaleString('fr-FR') : '14/06/2024 14:31:11'),
            totalTTC: parseFloat(s.Total_TTC || s.TotalTTC || 0),
            paiement: Number(s.PayementStatus) === 1 ? 'Paid' : 'Non payé',
            client: s.ClientName || 'Client passage'
          }));
          setSalesList(formatted);
          setSelectedSale(formatted[0]);
        } else {
          // Default initial sales matching screenshot
          const fallback = [
            { type: 'Ticket', reference: 'CF-00000009', date: '14/06/2024 14:31:11', totalTTC: 277.66, paiement: 'Paid', client: 'khaledrandji' },
            { type: 'Ticket', reference: 'CF-00000008', date: '06/06/2024 19:58:37', totalTTC: 149.40, paiement: 'Paid', client: 'khaledrandji' },
            { type: 'Ticket', reference: 'CF-00000007', date: '06/06/2024 15:11:22', totalTTC: 389.69, paiement: 'Paid', client: 'khaledrandji' },
            { type: 'Ticket', reference: 'CF-00000006', date: '06/06/2024 13:48:20', totalTTC: 9.74, paiement: 'Paid', client: 'Amar gozim' },
            { type: 'Ticket', reference: 'CF-00000005', date: '05/06/2024 19:53:58', totalTTC: 323.72, paiement: 'Paid', client: 'khaledrandji' },
            { type: 'Ticket', reference: 'CF-00000004', date: '05/06/2024 16:56:29', totalTTC: 345.60, paiement: 'Paid', client: 'khaledrandji' },
            { type: 'Ticket', reference: 'CF-00000003', date: '05/06/2024 16:56:09', totalTTC: 58.44, paiement: 'Paid', client: 'khaledrandji' },
            { type: 'Ticket', reference: 'CF-00000002', date: '05/06/2024 16:53:32', totalTTC: 180.22, paiement: 'Paid', client: 'khaledrandji' },
            { type: 'Ticket', reference: 'CF-00000001', date: '04/06/2024 21:37:27', totalTTC: 562.24, paiement: 'Paid', client: 'khaledrandji' }
          ];
          setSalesList(fallback);
          setSelectedSale(fallback[0]);
        }
      })
      .catch(() => {});
  }, []);

  const totalReglements = salesList.reduce((acc, s) => acc + s.totalTTC, 0);

  return (
    <div className="h-full flex overflow-hidden bg-slate-100 select-none">
      {/* Left Sub-Panel: Action Tiles with Master "Ventes En Caisse" Button (w-72) */}
      <div className="w-72 bg-slate-50 border-r border-slate-300 p-2.5 flex flex-col justify-between overflow-y-auto select-none shrink-0">
        <div className="space-y-2">
          {/* Top Master Button: Ventes En Caisse -> Ouvre la fenêtre séparée de la caisse */}
          <button
            onClick={handleOpenCaisse}
            className="w-full bg-[#111425] hover:bg-slate-900 border-2 border-slate-800 hover:border-amber-500/50 rounded-2xl p-3 shadow-md transition flex items-center space-x-3.5 text-left group active:scale-98"
            title="Ouvrir la fenêtre séparée de La Caisse"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-black shadow-md shadow-amber-500/20 group-hover:scale-105 transition shrink-0">
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center space-x-1.5">
                <h2 className="text-base font-black text-white tracking-wide truncate">
                  Ventes En Caisse
                </h2>
                <ExternalLink className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition" />
              </div>
              <span className="text-xs text-slate-400 font-semibold block truncate">
                Ouvrir la fenêtre de caisse
              </span>
            </div>
          </button>

          {/* Grid of Delphi Action Tiles */}
          <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
            {/* Row 1 */}
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[62px]">
              <Coins className="w-5 h-5 text-rose-500 mb-1" />
              <span>Désistement encours</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[62px]">
              <Calendar className="w-5 h-5 text-sky-600 mb-1" />
              <span>Clôture Journée</span>
            </button>

            {/* Row 2 */}
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[62px]">
              <FileText className="w-5 h-5 text-purple-600 mb-1" />
              <span>Saisie Doc vente</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[62px]">
              <RotateCcw className="w-5 h-5 text-rose-600 mb-1" />
              <span>Avoir Client</span>
            </button>

            {/* Row 3 */}
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[62px]">
              <Edit3 className="w-5 h-5 text-sky-600 mb-1" />
              <span>Corrections Doc</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[62px]">
              <CheckSquare className="w-5 h-5 text-emerald-600 mb-1" />
              <span>Clôtures Mois</span>
            </button>
          </div>

          {/* Row 4: 3-cols */}
          <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold text-slate-700">
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-1 rounded-lg text-center shadow-xs transition hover:shadow-sm active:scale-98">
              Fidélité
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-1 rounded-lg text-center shadow-xs transition hover:shadow-sm active:scale-98">
              Gestion Devis
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-1 rounded-lg text-center shadow-xs transition hover:shadow-sm active:scale-98">
              Bons d'Achat
            </button>
          </div>

          {/* Row 5: Cartes cadeaux & Payement encours */}
          <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[62px]">
              <span className="text-slate-500 font-mono font-bold text-xs">0.00 $</span>
              <span>Cartes cadeaux</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-98 min-h-[62px]">
              <CreditCard className="w-5 h-5 text-purple-600 mb-1" />
              <span>Paiement encours</span>
            </button>
          </div>

          {/* Row 6: 3-cols */}
          <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold text-slate-700">
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-1 rounded-lg text-center shadow-xs transition hover:shadow-sm active:scale-98">
              Correct. pay
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-1 rounded-lg text-center shadow-xs transition hover:shadow-sm active:scale-98">
              Bons d'avoirs
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-1 rounded-lg text-center shadow-xs transition hover:shadow-sm active:scale-98">
              Historique
            </button>
          </div>

          {/* Row 7: Chiffre d'Affaires, Année, Journées */}
          <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold text-slate-700">
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-1 rounded-lg text-center shadow-xs flex flex-col items-center transition hover:shadow-sm active:scale-98">
              <span className="text-amber-500 text-xs">💰</span>
              <span>C.A.</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-1 rounded-lg text-center shadow-xs flex flex-col items-center transition hover:shadow-sm active:scale-98">
              <span className="text-rose-500 text-xs font-mono font-black">+1y</span>
              <span>Année</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2.5 px-1 rounded-lg text-center shadow-xs flex flex-col items-center transition hover:shadow-sm active:scale-98">
              <span className="text-fuchsia-500 text-xs font-mono font-black">1</span>
              <span>Journées</span>
            </button>
          </div>
        </div>

        {/* Export / Document Action Icons */}
        <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
          <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 py-2 rounded-xl flex items-center justify-center text-emerald-600 shadow-xs transition hover:shadow-sm" title="Export PDF">
            <FileSpreadsheet className="w-4.5 h-4.5" />
          </button>
          <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 py-2 rounded-xl flex items-center justify-center text-amber-600 shadow-xs transition hover:shadow-sm" title="Envoyer">
            <Send className="w-4.5 h-4.5" />
          </button>
          <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 py-2 rounded-xl flex items-center justify-center text-rose-500 shadow-xs transition hover:shadow-sm" title="Imprimer Document">
            <Printer className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Right Main Area: Date Range Filter + Sales Table + Summary Bar */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Top Date Filter Header */}
        <div className="p-2.5 border-b border-rose-300 bg-rose-50/40 flex items-center justify-between text-xs select-none">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 bg-white border border-rose-200 rounded-lg px-2.5 py-1 font-mono text-slate-800 shadow-xs">
              <span>{dateRange.start}</span>
              <span className="text-rose-400">⌄</span>
            </div>
            <div className="w-6 h-6 rounded bg-rose-100 text-rose-600 flex items-center justify-center">
              ↔
            </div>
            <div className="flex items-center space-x-1.5 bg-white border border-rose-200 rounded-lg px-2.5 py-1 font-mono text-slate-800 shadow-xs">
              <span>{dateRange.end}</span>
              <span className="text-rose-400">⌄</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher ticket, client, montant..."
                className="bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1 text-xs outline-none focus:border-amber-500 w-64 shadow-xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>
            <button
              onClick={handleOpenCaisse}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Ouvrir La Caisse</span>
            </button>
          </div>
        </div>

        {/* Datagrid Matching User's Screenshot */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 text-[11px] select-none">
              <tr>
                <th className="py-2.5 px-3">TYPE DOCUMENT</th>
                <th className="py-2.5 px-3">RÉFÉRENCE</th>
                <th className="py-2.5 px-3">DATE FACTURE</th>
                <th className="py-2.5 px-3 text-right">TOTAL TTC</th>
                <th className="py-2.5 px-3 text-center">PAIEMENT</th>
                <th className="py-2.5 px-3">NOM COMPLET</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesList.map((sale, idx) => {
                const isSelected = selectedSale?.reference === sale.reference;
                return (
                  <tr 
                    key={idx}
                    onClick={() => setSelectedSale(sale)}
                    className={\`transition cursor-pointer \${
                      isSelected 
                        ? 'bg-rose-500 text-white font-bold' 
                        : 'hover:bg-amber-50/50 text-slate-800'
                    }\`}
                  >
                    <td className="py-2 px-3 flex items-center space-x-1.5">
                      <span className={isSelected ? 'text-white' : 'text-slate-400'}>📄</span>
                      <span>{sale.type}</span>
                    </td>
                    <td className="py-2 px-3 font-mono font-semibold">{sale.reference}</td>
                    <td className="py-2 px-3 font-mono text-[11px]">{sale.date}</td>
                    <td className={\`py-2 px-3 text-right font-mono font-black \${
                      isSelected ? 'text-white' : 'text-slate-900'
                    }\`}>
                      {sale.totalTTC.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={\`px-2 py-0.5 rounded text-[10px] font-bold \${
                        isSelected 
                          ? 'bg-white/20 text-white' 
                          : 'bg-emerald-100 text-emerald-800'
                      }\`}>
                        {sale.paiement}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-medium">{sale.client}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Summary Bar */}
        <div className="p-2 border-t border-slate-300 bg-slate-100 flex items-center justify-between text-xs select-none">
          <div className="flex items-center space-x-2">
            <button className="bg-white border border-slate-300 px-2 py-1 rounded text-slate-600 hover:bg-slate-50 font-bold">
              ≡ ▾
            </button>
          </div>

          <div className="flex items-center space-x-6 text-[11px] font-semibold text-slate-600">
            <div>Nbre Factures non payé : <span className="font-bold text-slate-900">0</span></div>
            <div>Nbre Remboursement : <span className="text-slate-400">...</span></div>
            <div>Nombre Factures payé : <span className="font-bold text-slate-900">{salesList.length}</span></div>
          </div>

          <div className="flex items-center space-x-6 text-[11px] font-semibold text-slate-600">
            <div>Total non payé : <span className="font-bold text-slate-900 font-mono">0,00 €</span></div>
            <div>Totale Rembourse : <span className="text-slate-400">...</span></div>
            <div className="bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Total Règlements : <span className="font-black text-emerald-700 font-mono text-xs">{totalReglements.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fenêtre séparée La Caisse (si ouverte en mode autonome interne) */}
      {internalCaisseOpen && (
        <LaCaisseWindow
          standalone={false}
          onClose={() => setInternalCaisseOpen(false)}
        />
      )}
    </div>
  );
}
`;

fs.writeFileSync('D:/Github/Utopia_react/frontend/src/pages/PosPage.jsx', posPageCode, 'utf8');
console.log('Successfully written simplified PosPage.jsx (Sales Hub)');
