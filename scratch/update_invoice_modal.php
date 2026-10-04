<?php
$invoiceModalFile = 'D:/Github/Utopia_react/frontend/src/components/InvoiceModal.jsx';

$content = <<<'JS'
import React from 'react';
import { X, Printer, Download, FileText, Monitor, Store } from 'lucide-react';

export default function InvoiceModal({ invoiceData, onClose }) {
  const { reference = 'CF-00000009', items = [], totalTTC = 277.66, totalHT = 231.38, totalTVA = 46.28, clientName = 'khaledrandji' } = invoiceData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-3 select-none">
      <div className="bg-white border-2 border-slate-300 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[96vh]">
        {/* Top Dark Header matching Signature Style */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-black shadow">
              <FileText className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wide">Facture A4 Standard</h2>
              <span className="text-xs text-slate-400 font-semibold">Utopya V1.0 2024 • Réf: {reference}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
            <div className="flex items-center space-x-1 bg-slate-700/60 px-3 py-1.5 rounded-lg border border-slate-600">
              <Monitor className="w-3.5 h-3.5 text-amber-400" />
              <span>Post2 (Caisse N° 2)</span>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-white transition ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable View */}
        <div className="p-8 bg-white text-slate-800 text-xs overflow-y-auto" id="invoice-print-area">
          {/* Top header: Logo + Title + Barcode */}
          <div className="flex justify-between items-start border-b-2 border-amber-500 pb-4">
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-wider flex items-center space-x-1">
                <span>O'MEGA</span>
              </div>
              <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">SERVICES</div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-800">Facture</h2>
              <span className="text-xs font-bold text-slate-500">{reference}</span>
            </div>

            <div className="text-right">
              <div className="bg-slate-900 text-white font-mono px-2 py-0.5 text-xs font-bold tracking-widest inline-block">
                |||| ||||| || ||||||
              </div>
              <div className="text-[10px] text-slate-500">14872901561414</div>
            </div>
          </div>

          {/* 3 Columns details */}
          <div className="grid grid-cols-3 gap-4 py-4 border-b border-slate-200 text-xs">
            <div className="border-l-2 border-amber-500 pl-2">
              <div className="font-bold text-slate-900">Gozimsoft</div>
              <div className="text-slate-600">messad</div>
              <div className="text-sky-600">www.gozimsoft.com</div>
            </div>

            <div className="border-l-2 border-amber-500 pl-2">
              <div className="font-bold text-slate-900">{clientName}</div>
              <div className="text-slate-600">13 rue de la République<br />69522 Lyon</div>
              <div className="text-slate-600">062542154</div>
              <div className="text-slate-600">khaledrandji@gmail.com</div>
            </div>

            <div className="border-l-2 border-amber-500 pl-2">
              <div className="font-bold text-slate-900">N° : {reference}</div>
              <div>Total TTC : <span className="font-bold text-emerald-700">{totalTTC.toFixed(2)} €</span></div>
              <div>Date : {new Date().toLocaleDateString('fr-FR')}</div>
              <div>Remise : 0,00 €</div>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[10px] text-slate-500 my-3">
            Cette facture contient un bien qui bénéficie auprès du vendeur d'une garantie légale de conformité d'une durée minimale de deux ans à compter de sa remise au consommateur.
          </div>

          {/* Table summary box */}
          <div className="grid grid-cols-4 gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-center text-xs mb-4">
            <div>Date Facture : {new Date().toLocaleDateString('fr-FR')}</div>
            <div>Montant HT : {totalHT.toFixed(2)} €</div>
            <div>Taux TVA : 20%</div>
            <div>Total TVA : {totalTVA.toFixed(2)} €</div>
          </div>

          {/* Invoice Datagrid */}
          <table className="w-full text-xs text-left mb-4">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200 text-[10px]">
              <tr>
                <th className="py-2 px-2">Réf</th>
                <th className="py-2 px-2">Désignation</th>
                <th className="py-2 px-2 text-center">Qté</th>
                <th className="py-2 px-2 text-right">P.U TTC</th>
                <th className="py-2 px-2 text-right">Total TTC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-2 font-mono text-slate-500">{it.id || idx + 1}</td>
                  <td className="py-2 px-2 font-bold text-slate-800">{it.designation}</td>
                  <td className="py-2 px-2 text-center">{it.quantity}</td>
                  <td className="py-2 px-2 text-right font-mono">{(it.price * 1.2).toFixed(2)} €</td>
                  <td className="py-2 px-2 text-right font-bold text-slate-900 font-mono">
                    {it.total ? it.total.toFixed(2) : (it.price * it.quantity * 1.2).toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total Display */}
          <div className="flex justify-end">
            <div className="w-64 bg-slate-900 text-white rounded-xl p-3 text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">TOTAL TTC NET</span>
              <span className="text-2xl font-black font-mono text-emerald-400">{totalTTC.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs shadow-sm transition"
          >
            Fermer
          </button>
          <button
            onClick={handlePrint}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wide shadow-md shadow-amber-500/25 flex items-center space-x-2 transition"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>Imprimer Facture A4</span>
          </button>
        </div>
      </div>
    </div>
  );
}
JS;

file_put_contents($invoiceModalFile, $content);
echo "Updated InvoiceModal.jsx successfully\n";
