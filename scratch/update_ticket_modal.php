<?php
$ticketModalFile = 'D:/Github/Utopia_react/frontend/src/components/ThermalTicketModal.jsx';

$content = <<<'JS'
import React from 'react';
import { X, Printer, Monitor, Store } from 'lucide-react';

export default function ThermalTicketModal({ saleData, onClose }) {
  const { reference = 'CF-00000009', items = [], totalTTC = 277.66, totalHT = 231.38, totalTVA = 46.28, paymentMethod = 'Espèce', cashReceived = 300.00, changeGiven = 22.34 } = saleData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-3 select-none">
      <div className="bg-white border-2 border-slate-300 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col max-h-[96vh]">
        {/* Top Dark Header matching Signature Style */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-900 flex items-center justify-center font-black shadow">
              <Printer className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xs font-black tracking-wide">Ticket Thermique (80mm)</h2>
              <span className="text-[10px] text-slate-400 font-semibold">{reference}</span>
            </div>
          </div>

          <button onClick={onClose} className="p-1 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thermal Ticket Content */}
        <div className="p-4 bg-white font-mono text-xs overflow-y-auto leading-tight text-slate-800" id="thermal-print-area">
          {/* Logo Header */}
          <div className="text-center pb-2 border-b border-dashed border-slate-400">
            <div className="text-lg font-black tracking-widest text-slate-900">O'MEGA</div>
            <div className="text-[10px] font-bold tracking-wider text-slate-600">SERVICES</div>
            <div className="text-[10px] text-slate-500 mt-1">messad</div>
            {/* Barcode simulated */}
            <div className="bg-slate-900 text-white text-center py-1 tracking-widest font-black text-sm my-1">
              ||||| | |||| ||| |||||
            </div>
            <div className="text-[10px]">14872901561414</div>
            <div className="text-[11px] font-semibold mt-1">Caisse N° : 2 &nbsp;&nbsp; {new Date().toLocaleDateString('fr-FR')} {new Date().toLocaleTimeString('fr-FR')}</div>
          </div>

          <div className="py-2 border-b border-dashed border-slate-400 flex justify-between text-[11px]">
            <span className="font-bold">{reference}</span>
            <span>Tel: 062542154</span>
          </div>

          <div className="text-center py-1 text-[10px] text-slate-500 border-b border-dashed border-slate-400">
            Du LUNDI Au JEUDI : 8H00 à 20H00<br />VENDREDI ET SAMEDI
          </div>

          {/* Items Table */}
          <table className="w-full my-2 text-[11px]">
            <thead>
              <tr className="border-b border-slate-800 font-bold bg-slate-100">
                <th className="text-left py-1">Qte</th>
                <th className="text-left py-1">Désignation</th>
                <th className="text-right py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} className="border-b border-slate-200">
                  <td className="py-1">{it.quantity}</td>
                  <td className="py-1 pr-1">{it.designation}</td>
                  <td className="py-1 text-right font-bold font-mono">
                    {it.total ? it.total.toFixed(2) : (it.price * it.quantity * 1.2).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial summary */}
          <div className="space-y-1 pt-2 border-t border-dashed border-slate-400 text-[11px]">
            <div className="flex justify-between">
              <span>Total {items.length} articles :</span>
              <span>{(totalHT || (totalTTC * 0.8)).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span>Reste à payer :</span>
              <span className="font-bold text-sm">{totalTTC?.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span>{paymentMethod || 'Espèce'} :</span>
              <span>{cashReceived?.toFixed(2) || totalTTC?.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Rendu :</span>
              <span>{changeGiven?.toFixed(2) || '0.00'} €</span>
            </div>
          </div>

          {/* Footer message */}
          <div className="text-center pt-3 text-[10px] text-slate-600 border-t border-dashed border-slate-400 mt-2">
            MERCI DE VOTRE VISITE<br />À BIENTÔT
          </div>
        </div>

        {/* Action button */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-600 font-semibold px-3 py-1.5 hover:bg-slate-200 rounded-lg transition"
          >
            Fermer
          </button>
          <button
            onClick={handlePrint}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-wide shadow-md shadow-amber-500/25 flex items-center space-x-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Imprimer 80mm</span>
          </button>
        </div>
      </div>
    </div>
  );
}
JS;

file_put_contents($ticketModalFile, $content);
echo "Updated ThermalTicketModal.jsx successfully\n";
