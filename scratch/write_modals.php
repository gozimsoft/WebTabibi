<?php
$compDir = 'D:/Github/Utopia_react/frontend/src/components';

// PosCashModal.jsx
$cashModal = <<<'JS'
import React, { useState } from 'react';
import { X, CreditCard, Banknote, FileText, CheckCircle2, RotateCcw, Printer } from 'lucide-react';

const BILLS = [
  { val: 5, color: 'bg-emerald-600', text: '5 €' },
  { val: 10, color: 'bg-rose-600', text: '10 €' },
  { val: 20, color: 'bg-blue-600', text: '20 €' },
  { val: 50, color: 'bg-amber-600', text: '50 €' },
  { val: 100, color: 'bg-teal-600', text: '100 €' },
  { val: 200, color: 'bg-yellow-600', text: '200 €' },
  { val: 500, color: 'bg-purple-600', text: '500 €' }
];

const COINS = [
  { val: 0.01, text: '1c' },
  { val: 0.02, text: '2c' },
  { val: 0.05, text: '5c' },
  { val: 0.10, text: '10c' },
  { val: 0.20, text: '20c' },
  { val: 0.50, text: '50c' },
  { val: 1.00, text: '1 €' },
  { val: 2.00, text: '2 €' }
];

const MODES = [
  { id: 'ESPECE', label: 'ESPECE', color: 'border-emerald-400 bg-emerald-50 text-emerald-800' },
  { id: 'CB', label: 'CARTE DE CREDIT', color: 'border-rose-400 bg-rose-50 text-rose-800' },
  { id: 'CHEQUE', label: 'CHEQUE', color: 'border-indigo-400 bg-indigo-50 text-indigo-800' },
  { id: 'VIREMENT', label: 'VIRREMENT', color: 'border-amber-400 bg-amber-50 text-amber-800' },
  { id: 'DIFFERE', label: 'Paiement différés', color: 'border-slate-300 bg-slate-50 text-slate-600' },
  { id: 'AVOIR', label: 'Avoir', color: 'border-slate-300 bg-slate-50 text-slate-600' },
  { id: 'TICKET_RESTAU', label: 'Ticket Restau', color: 'border-amber-300 bg-amber-50 text-amber-700' },
  { id: 'CHEQUE_VOYAGE', label: 'Chèque Voyage', color: 'border-amber-300 bg-amber-50 text-amber-700' },
];

export default function PosCashModal({ totalTTC, onValidate, onClose }) {
  const [receivedCash, setReceivedCash] = useState(0);
  const [selectedMode, setSelectedMode] = useState('ESPECE');
  const [paymentsList, setPaymentsList] = useState([]);
  const [numpadInput, setNumpadInput] = useState('');

  const addBillOrCoin = (val) => {
    setReceivedCash(prev => parseFloat((prev + val).toFixed(2)));
  };

  const handleNumpad = (digit) => {
    if (digit === 'C') {
      setNumpadInput('');
    } else {
      setNumpadInput(prev => prev + digit);
    }
  };

  const addSplitPayment = () => {
    const amount = parseFloat(numpadInput) || receivedCash || totalTTC;
    if (amount <= 0) return;
    setPaymentsList(prev => [...prev, { mode: selectedMode, amount }]);
    setNumpadInput('');
  };

  const totalPaid = paymentsList.reduce((acc, p) => acc + p.amount, 0) + (receivedCash > 0 ? receivedCash : 0);
  const remaining = Math.max(0, parseFloat((totalTTC - totalPaid).toFixed(2)));
  const changeGiven = totalPaid >= totalTTC ? parseFloat((totalPaid - totalTTC).toFixed(2)) : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-2">
      <div className="bg-white border-2 border-emerald-500 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header with digital total */}
        <div className="bg-slate-100 border-b-2 border-emerald-500 px-4 py-2 flex items-center justify-between">
          <div className="text-xl font-black text-slate-700 uppercase tracking-wide">
            REGLEMENT
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-digital font-black text-emerald-600 bg-emerald-50 px-4 py-1 rounded-lg border border-emerald-200">
              {totalTTC.toFixed(2)} €
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-rose-100 rounded-lg text-slate-500 hover:text-rose-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-3 grid grid-cols-12 gap-3 overflow-y-auto">
          {/* Bills and Coins Touch Column */}
          <div className="col-span-2 bg-slate-50 p-2 rounded-lg border border-slate-200 flex flex-col space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase text-center">Billets & Pièces</span>
            <div className="grid grid-cols-1 gap-1">
              {BILLS.map(b => (
                <button
                  key={b.val}
                  onClick={() => addBillOrCoin(b.val)}
                  className={`${b.color} text-white font-extrabold text-sm py-1.5 rounded shadow active:scale-95 transition flex items-center justify-center`}
                >
                  {b.text}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1 pt-1 border-t border-slate-200">
              {COINS.map(c => (
                <button
                  key={c.val}
                  onClick={() => addBillOrCoin(c.val)}
                  className="bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs py-1 rounded shadow-xs active:scale-95 transition text-center"
                >
                  {c.text}
                </button>
              ))}
            </div>
          </div>

          {/* Central Area: Modes, Payments and Scanner */}
          <div className="col-span-6 flex flex-col space-y-3">
            {/* Modes de règlement tiles */}
            <div>
              <span className="text-xs font-bold text-slate-600 block mb-1">Liste des règlements :</span>
              <div className="grid grid-cols-4 gap-1.5">
                {MODES.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMode(m.id)}
                    className={`p-2 rounded-lg border text-center transition flex flex-col items-center justify-center text-[11px] font-extrabold shadow-xs ${
                      selectedMode === m.id ? 'ring-2 ring-emerald-500 ring-offset-1 font-black ' + m.color : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Remaining amount banner */}
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-2.5 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">Reste En cours :</span>
              <span className="text-xl font-black text-slate-800">{remaining.toFixed(2)} €</span>
              <button 
                onClick={() => { setReceivedCash(0); setPaymentsList([]); }}
                className="text-xs bg-white border border-slate-300 px-2 py-1 rounded font-bold text-slate-600 flex items-center space-x-1 hover:bg-slate-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recharger</span>
              </button>
            </div>

            {/* Split table */}
            <div className="border border-slate-300 rounded-lg bg-white flex-1 min-h-[120px] p-2 overflow-y-auto">
              <div className="text-[11px] font-bold text-slate-400 border-b pb-1 flex justify-between">
                <span>Mode de règlement</span>
                <span>Montant</span>
              </div>
              {paymentsList.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 italic">
                  {selectedMode} : {totalTTC.toFixed(2)} € (Règlement standard)
                </div>
              ) : (
                paymentsList.map((p, idx) => (
                  <div key={idx} className="flex justify-between py-1 text-xs border-b border-slate-100 font-semibold">
                    <span>{p.mode}</span>
                    <span className="text-emerald-700 font-bold">{p.amount.toFixed(2)} €</span>
                  </div>
                ))
              )}
            </div>

            {/* Change counters: Somme Reçue (green) / Somme à rendre (red) */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-emerald-50 border-2 border-emerald-400 rounded-lg p-2 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800">Somme Reçue</span>
                <span className="text-lg font-digital font-black text-emerald-600">{receivedCash.toFixed(2)} €</span>
              </div>
              <div className="bg-rose-50 border-2 border-rose-400 rounded-lg p-2 flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800">Somme à rendre</span>
                <span className="text-lg font-digital font-black text-rose-600">{changeGiven.toFixed(2)} €</span>
              </div>
            </div>

            {/* Barcode scan field */}
            <input 
              type="text" 
              placeholder="Scanner le code à barre (chèque/bon)..." 
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-emerald-500 shadow-inner"
            />
          </div>

          {/* Right Numpad & Final Action Buttons */}
          <div className="col-span-4 flex flex-col space-y-2">
            <div className="text-xs font-bold text-slate-600">Fractionner le règlement :</div>
            <div className="bg-slate-200 p-2 rounded text-right font-digital text-xl font-bold text-slate-800 h-9 flex items-center justify-end">
              {numpadInput || '0'}
            </div>

            {/* Numpad grid */}
            <div className="grid grid-cols-3 gap-1.5">
              {['7','8','9','4','5','6','1','2','3','0',',','C'].map(btn => (
                <button
                  key={btn}
                  onClick={() => handleNumpad(btn)}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg py-2.5 text-base font-bold text-slate-700 active:bg-slate-300 transition shadow-xs"
                >
                  {btn}
                </button>
              ))}
            </div>

            <button
              onClick={addSplitPayment}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-1.5 rounded-lg text-xs transition"
            >
              Ajouter au fractionnement
            </button>

            {/* Action Validation Buttons */}
            <div className="pt-2 border-t border-slate-200 flex flex-col space-y-1.5">
              <button
                onClick={() => onValidate({ mode: selectedMode, printTicket: true, printInvoice: false, receivedCash, changeGiven })}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 px-3 rounded-lg text-xs shadow flex items-center justify-center space-x-2 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Valider Avec Ticket</span>
              </button>
              <button
                onClick={() => onValidate({ mode: selectedMode, printTicket: false, printInvoice: false, receivedCash, changeGiven })}
                className="bg-slate-700 hover:bg-slate-800 text-white font-extrabold py-1.5 px-3 rounded-lg text-xs shadow flex items-center justify-center space-x-2 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Valider Sans Ticket</span>
              </button>
              <button
                onClick={() => onValidate({ mode: selectedMode, printTicket: false, printInvoice: true, receivedCash, changeGiven })}
                className="bg-sky-700 hover:bg-sky-800 text-white font-extrabold py-1.5 px-3 rounded-lg text-xs shadow flex items-center justify-center space-x-2 transition"
              >
                <FileText className="w-4 h-4" />
                <span>Valider Avec Facture</span>
              </button>
              <button
                onClick={onClose}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-1 px-3 rounded-lg text-xs transition text-center"
              >
                Retour
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
JS;
file_put_contents("$compDir/PosCashModal.jsx", $cashModal);

// ThermalTicketModal.jsx
$ticketModal = <<<'JS'
import React from 'react';
import { X, Printer } from 'lucide-react';

export default function ThermalTicketModal({ saleData, onClose }) {
  const { reference, items = [], totalTTC, totalHT, totalTVA, paymentMethod, cashReceived, changeGiven } = saleData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col max-h-[95vh]">
        <div className="bg-slate-800 text-white px-3 py-2 flex items-center justify-between">
          <span className="font-bold text-xs">Ticket de Caisse (80mm)</span>
          <button onClick={onClose} className="hover:text-rose-400">
            <X className="w-5 h-5" />
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
            <span className="font-bold">{reference || 'CF-00000009'}</span>
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
                  <td className="py-1 text-right font-bold">{it.total?.toFixed(2) || it.price?.toFixed(2)}</td>
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
              <span>Bon immédiat :</span>
              <span>0,00 €</span>
            </div>
            <div className="flex justify-between">
              <span>Reste à payer :</span>
              <span className="font-bold">{totalTTC?.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span>{paymentMethod || 'Espèce'} :</span>
              <span>{(cashReceived || totalTTC)?.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span>Rendu :</span>
              <span>{(changeGiven || 0).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-800 text-sm font-black">
              <span>TVA : {(totalTVA || (totalTTC * 0.2)).toFixed(2)} €</span>
              <span className="text-base">Net: {totalTTC?.toFixed(2)} €</span>
            </div>
          </div>

          {/* Privilege program */}
          <div className="mt-3 pt-2 border-t border-dashed border-slate-400 text-center text-[10px]">
            <div className="font-bold">Point Privilège Gozimsoft</div>
            <div>Solde Actuel : 0,00 €</div>
            <div>Solde Précédent : 0,00 €</div>
            <div className="mt-1 italic">En 2024, Grâce à la carte Gozimsoft : 0,00 €</div>
          </div>

          <div className="mt-3 text-center text-[10px] text-slate-500 border-t border-dashed border-slate-400 pt-2">
            gozimsoft@gmail.com • www.gozimsoft.com
            <div className="font-bold text-slate-800 mt-1">MERCI DE VOTRE VISITE</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="p-3 bg-slate-100 border-t flex justify-end space-x-2">
          <button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-4 rounded-lg text-xs flex items-center space-x-1.5 shadow">
            <Printer className="w-4 h-4" />
            <span>Imprimer</span>
          </button>
          <button onClick={onClose} className="bg-slate-300 hover:bg-slate-400 text-slate-700 font-bold py-1.5 px-4 rounded-lg text-xs">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
JS;
file_put_contents("$compDir/ThermalTicketModal.jsx", $ticketModal);

// InvoiceModal.jsx
$invoiceModal = <<<'JS'
import React from 'react';
import { X, Printer, Download } from 'lucide-react';

export default function InvoiceModal({ invoiceData, onClose }) {
  const { reference = 'CF-00000009', items = [], totalTTC = 277.66, totalHT = 231.38, totalTVA = 46.28, clientName = 'khaledrandji' } = invoiceData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[96vh]">
        <div className="bg-slate-800 text-white px-4 py-2 flex items-center justify-between">
          <span className="font-bold text-sm">Facture A4 ({reference})</span>
          <button onClick={onClose} className="hover:text-rose-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Printable View */}
        <div className="p-8 bg-white text-slate-800 text-xs overflow-y-auto" id="invoice-print-area">
          {/* Top header: Logo + Title + Barcode */}
          <div className="flex justify-between items-start border-b-2 border-rose-500 pb-4">
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
            <div className="border-l-2 border-rose-500 pl-2">
              <div className="font-bold text-slate-900">Gozimsoft</div>
              <div className="text-slate-600">messad</div>
              <div className="text-sky-600">www.gozimsoft.com</div>
            </div>

            <div className="border-l-2 border-rose-500 pl-2">
              <div className="font-bold text-slate-900">{clientName}</div>
              <div className="text-slate-600">13 re de lannee<br />69522 Djelfa</div>
              <div className="text-slate-600">062542154</div>
              <div className="text-slate-600">khaledrandji@gmail.com</div>
            </div>

            <div className="border-l-2 border-rose-500 pl-2">
              <div className="font-bold text-slate-900">N° : {reference}</div>
              <div>Total : <span className="font-bold">{totalTTC.toFixed(2)} €</span></div>
              <div>Date : {new Date().toLocaleDateString('fr-FR')}</div>
              <div>Remise : 0,00 €</div>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded p-2 text-[10px] text-slate-500 my-3">
            Cette facture contient un bien qui bénéficie auprès du vendeur d'une garantie légale de conformité d'une durée minimale de deux ans à compter de sa remise au consommateur.
          </div>

          {/* Table summary box */}
          <div className="grid grid-cols-4 gap-2 bg-slate-100 border border-slate-300 rounded p-2 font-semibold text-center text-xs mb-4">
            <div>Date Facture : {new Date().toLocaleDateString('fr-FR')}</div>
            <div>Montant HT : {totalHT.toFixed(2)} €</div>
            <div>Taux TVA : 20%</div>
            <div>Total TVA : {totalTVA.toFixed(2)} €</div>
          </div>

          {/* Items Table */}
          <table className="w-full border-collapse border border-slate-300 text-xs mb-4">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                <th className="border border-slate-300 p-2 text-center w-8">#</th>
                <th className="border border-slate-300 p-2 text-left">Désignation</th>
                <th className="border border-slate-300 p-2 text-center w-12">Qte</th>
                <th className="border border-slate-300 p-2 text-right w-20">Prix</th>
                <th className="border border-slate-300 p-2 text-center w-12">TVA</th>
                <th className="border border-slate-300 p-2 text-center w-12">Rem</th>
                <th className="border border-slate-300 p-2 text-right w-24">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} className="border-b border-slate-200">
                  <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                  <td className="border border-slate-300 p-2 font-medium">{it.designation}</td>
                  <td className="border border-slate-300 p-2 text-center">{it.quantity}</td>
                  <td className="border border-slate-300 p-2 text-right">{it.price?.toFixed(2)} €</td>
                  <td className="border border-slate-300 p-2 text-center">{it.tva || 20}%</td>
                  <td className="border border-slate-300 p-2 text-center">{it.remise || 0}</td>
                  <td className="border border-slate-300 p-2 text-right font-bold">{it.total?.toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bottom Totals Box */}
          <div className="flex justify-between items-end pt-2">
            <div className="text-xs font-bold text-slate-700">
              Mode Payement : ESPECE ({totalTTC.toFixed(2)} €)
            </div>

            <div className="border border-slate-400 rounded-lg overflow-hidden w-64 text-xs font-semibold">
              <div className="flex justify-between p-1.5 border-b border-slate-200 bg-slate-50">
                <span>Total HT :</span>
                <span>{totalHT.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between p-1.5 border-b border-slate-200 bg-slate-50">
                <span>Total TVA :</span>
                <span>{totalTVA.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between p-1.5 border-b border-slate-200 bg-slate-50">
                <span>Remise :</span>
                <span>0,00 €</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-800 text-white font-black text-sm">
                <span>Total TTC :</span>
                <span>{totalTTC.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-3 bg-slate-100 border-t flex justify-end space-x-2">
          <button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-4 rounded-lg text-xs flex items-center space-x-1.5 shadow">
            <Printer className="w-4 h-4" />
            <span>Imprimer</span>
          </button>
          <button onClick={onClose} className="bg-slate-300 hover:bg-slate-400 text-slate-700 font-bold py-1.5 px-4 rounded-lg text-xs">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
JS;
file_put_contents("$compDir/InvoiceModal.jsx", $invoiceModal);

// IntuitiveProductSearchModal.jsx
$searchModal = <<<'JS'
import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight, Search, Check, RotateCcw } from 'lucide-react';

export default function IntuitiveProductSearchModal({ products = [], onSelect, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [selectedRayon, setSelectedRayon] = useState('Tous');

  const filtered = products.filter(p => {
    const matchTerm = p.Designation.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (p.CodeBarre && p.CodeBarre.includes(searchTerm));
    const matchRayon = selectedRayon === 'Tous' || p.Rayon === selectedRayon;
    return matchTerm && matchRayon;
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-2">
      <div className="bg-white border-2 border-sky-500 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-50 to-slate-100 border-b border-sky-300 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center shadow">
              <Search className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-sm text-slate-800">Recherche Intuitive des produits</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-rose-100 rounded-lg text-slate-500 hover:text-rose-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center space-x-4 text-xs font-semibold">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Rechercher par désignation ou code à barre..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:border-sky-500 shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500">Rayon:</span>
            <select 
              value={selectedRayon}
              onChange={e => setSelectedRayon(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs"
            >
              <option value="Tous">Tous les rayons</option>
              <option value="alimentations">Alimentations</option>
              <option value="Meubles">Meubles</option>
              <option value="jardins">Jardins</option>
              <option value="Informatique">Informatique</option>
              <option value="Energy">Energy</option>
            </select>
          </div>
        </div>

        {/* Accordion list */}
        <div className="p-3 overflow-y-auto flex-1 space-y-2">
          {filtered.map(p => {
            const isExpanded = expandedId === p.ID;
            return (
              <div 
                key={p.ID}
                className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs transition"
              >
                {/* Header row */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : p.ID)}
                  className={`p-2.5 flex items-center justify-between cursor-pointer hover:bg-sky-50/60 transition ${
                    isExpanded ? 'bg-sky-50/80 border-b border-sky-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2 font-bold text-xs text-slate-800">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-rose-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-sky-600" />
                    )}
                    <span>{p.Designation}</span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs">
                    <span className="font-black text-sky-700">{p.Prix_V?.toFixed(2) || '0.00'} €</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(p);
                      }}
                      className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-2 py-0.5 rounded text-[11px] flex items-center space-x-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Sélectionner</span>
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="p-3 bg-slate-50/50 flex space-x-4 items-center">
                    {/* Thumbnail */}
                    <div className="w-28 h-24 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1 shadow-inner">
                      <span className="text-[10px] text-slate-400 font-bold text-center">Photo Article</span>
                    </div>

                    {/* Specifications */}
                    <div className="flex-1 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700">Désignation : {p.Designation}</span>
                        {/* 70% Margin Gauge */}
                        <div className="flex items-center space-x-1 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full text-amber-700 font-extrabold text-[11px]">
                          <span>Marge: 70%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded border border-slate-200">
                        <div>En Stock : <span className="font-bold text-emerald-600">10</span></div>
                        <div>Minim : <span className="font-bold text-slate-600">0</span></div>
                        <div>Maxi : <span className="font-bold text-slate-600">0</span></div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded border border-slate-200">
                        <div>Prix Achat : <span className="font-bold text-rose-600">{p.Prix_A?.toFixed(2) || '0.00'} €</span></div>
                        <div>Prix Vente : <span className="font-bold text-sky-600">{p.Prix_V?.toFixed(2) || '0.00'} €</span></div>
                        <div>TVA : <span className="font-bold text-pink-500">TVA 1 (20%)</span></div>
                      </div>

                      <div className="text-[11px] text-slate-500">
                        Rayon : <span className="font-semibold text-slate-700">{p.Rayon || 'Général'}</span> • 
                        Catégorie : <span className="font-semibold text-slate-700">{p.Categorie || 'Standard'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-slate-100 border-t border-slate-300 flex justify-end">
          <button onClick={onClose} className="bg-slate-300 hover:bg-slate-400 text-slate-700 font-bold py-1.5 px-4 rounded-lg text-xs">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
JS;
file_put_contents("$compDir/IntuitiveProductSearchModal.jsx", $searchModal);

echo "Interactive modals generated.\n";
