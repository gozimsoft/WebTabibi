<?php
$posCashModalFile = 'D:/Github/Utopia_react/frontend/src/components/PosCashModal.jsx';

$content = <<<'JS'
import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Banknote, 
  FileText, 
  CheckCircle2, 
  RotateCcw, 
  Printer, 
  Coins, 
  Monitor, 
  Store, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

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
  { id: 'ESPECE', label: 'ESPÈCE', color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
  { id: 'CB', label: 'CARTE DE CRÉDIT', color: 'border-rose-400 bg-rose-50 text-rose-800' },
  { id: 'CHEQUE', label: 'CHÈQUE', color: 'border-indigo-400 bg-indigo-50 text-indigo-800' },
  { id: 'VIREMENT', label: 'VIREMENT', color: 'border-amber-400 bg-amber-50 text-amber-800' },
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
    if (digit === 'Effacer') {
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
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-3 select-none">
      <div className="bg-white border-2 border-slate-300 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[96vh]">
        {/* Top Dark Header matching Signature Style */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-black shadow">
              <Coins className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wide">Règlement & Encaissement Caisse</h2>
              <span className="text-xs text-slate-400 font-semibold">Utopya V1.0 2024 • Validation du Paiement</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
            <div className="flex items-center space-x-1 bg-slate-700/60 px-3 py-1.5 rounded-lg border border-slate-600">
              <Monitor className="w-3.5 h-3.5 text-amber-400" />
              <span>Post2 (Caisse N° 2)</span>
            </div>
            <div className="flex items-center space-x-1 bg-slate-700/60 px-3 py-1.5 rounded-lg border border-slate-600">
              <Store className="w-3.5 h-3.5 text-teal-400" />
              <span>Store Principale</span>
            </div>
            <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 px-3 py-1 rounded-lg font-mono font-black text-sm ml-2">
              NET À PAYER : {totalTTC.toFixed(2)} €
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="p-5 grid grid-cols-12 gap-5 overflow-y-auto">
          {/* Bills and Coins Touch Column */}
          <div className="col-span-3 bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-1">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Billets & Pièces (€)
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">Tactile</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {BILLS.map(b => (
                <button
                  key={b.val}
                  onClick={() => addBillOrCoin(b.val)}
                  className={`${b.color} text-white font-extrabold text-xs py-2 rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition flex items-center justify-center`}
                >
                  {b.text}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-200">
              {COINS.map(c => (
                <button
                  key={c.val}
                  onClick={() => addBillOrCoin(c.val)}
                  className="bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs py-1.5 rounded-lg shadow-xs active:scale-95 transition text-center"
                >
                  {c.text}
                </button>
              ))}
            </div>
          </div>

          {/* Central Area: Modes, Payments and Scanner */}
          <div className="col-span-5 flex flex-col space-y-3">
            {/* Modes de règlement tiles */}
            <div>
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider block mb-2">
                1. Mode de règlement
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {MODES.map(m => {
                  const isSelected = selectedMode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMode(m.id)}
                      className={`p-2.5 rounded-xl border-2 text-center transition flex items-center justify-center text-xs font-extrabold shadow-xs ${
                        isSelected 
                          ? 'border-amber-500 bg-amber-50/70 text-slate-900 shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Remaining amount banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold text-slate-500 block">Reste à percevoir :</span>
                <span className="text-xl font-black text-rose-600">{remaining.toFixed(2)} €</span>
              </div>
              <button 
                onClick={() => { setReceivedCash(0); setPaymentsList([]); }}
                className="text-xs bg-white border border-slate-300 hover:bg-slate-100 px-3 py-1.5 rounded-lg font-bold text-slate-700 flex items-center space-x-1.5 transition shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser</span>
              </button>
            </div>

            {/* Split table */}
            <div className="border border-slate-200 rounded-xl bg-white flex-1 min-h-[110px] p-2.5 overflow-y-auto">
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider border-b pb-1 flex justify-between">
                <span>Règlement</span>
                <span>Montant perçu</span>
              </div>
              {paymentsList.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 font-medium italic">
                  {selectedMode} : {totalTTC.toFixed(2)} € (Règlement intégral standard)
                </div>
              ) : (
                paymentsList.map((p, idx) => (
                  <div key={idx} className="flex justify-between py-1.5 text-xs border-b border-slate-100 font-semibold">
                    <span className="text-slate-700">{p.mode}</span>
                    <span className="text-emerald-700 font-bold">{p.amount.toFixed(2)} €</span>
                  </div>
                ))
              )}
            </div>

            {/* Change counters: Somme Reçue (green) / Somme à rendre (red) */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800">Somme Reçue</span>
                <span className="text-lg font-mono font-black text-emerald-700">{receivedCash.toFixed(2)} €</span>
              </div>
              <div className="bg-rose-50 border border-rose-300 rounded-xl p-2.5 flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800">À Rendre</span>
                <span className="text-lg font-mono font-black text-rose-600">{changeGiven.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Right Numpad & Final Action Buttons */}
          <div className="col-span-4 flex flex-col space-y-2">
            <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
              2. Saisie tactile montant
            </span>
            <div className="bg-slate-50 border-2 border-slate-300 p-2.5 rounded-xl text-right font-mono text-xl font-black text-slate-800 h-11 flex items-center justify-end">
              {numpadInput ? `${numpadInput} €` : '0,00 €'}
            </div>

            {/* Numpad grid with Styled Effacer Button */}
            <div className="grid grid-cols-3 gap-1.5">
              {['1','2','3','4','5','6','7','8','9','Effacer','0',','].map(btn => (
                <button
                  key={btn}
                  onClick={() => handleNumpad(btn)}
                  className={`py-2 rounded-xl text-base font-bold shadow-xs active:scale-95 transition ${
                    btn === 'Effacer'
                      ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 text-xs font-black'
                      : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-800'
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>

            <button
              onClick={addSplitPayment}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 rounded-xl text-xs transition shadow-sm"
            >
              + Ajouter fractionnement
            </button>

            {/* Barcode scan field */}
            <input 
              type="text" 
              placeholder="Scanner code chèque / bon..." 
              className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-amber-500 shadow-inner mt-1"
            />
          </div>
        </div>

        {/* Footer Actions matching Signature Style */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-sm text-xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Annuler / Retour</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onValidate({ mode: selectedMode, printTicket: false, printInvoice: true, receivedCash, changeGiven })}
              className="border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm flex items-center space-x-1.5 transition"
            >
              <FileText className="w-4 h-4 text-sky-600" />
              <span>Facture A4</span>
            </button>

            <button
              onClick={() => onValidate({ mode: selectedMode, printTicket: false, printInvoice: false, receivedCash, changeGiven })}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow flex items-center space-x-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Valider Sans Ticket</span>
            </button>

            <button
              onClick={() => onValidate({ mode: selectedMode, printTicket: true, printInvoice: false, receivedCash, changeGiven })}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wide shadow-md shadow-amber-500/25 flex items-center space-x-2 transition active:scale-95"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Valider Avec Ticket →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
JS;

file_put_contents($posCashModalFile, $content);
echo "Updated PosCashModal.jsx successfully\n";
