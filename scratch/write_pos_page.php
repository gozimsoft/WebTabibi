<?php
$pagesDir = 'D:/Github/Utopia_react/frontend/src/pages';
$srcDir = 'D:/Github/Utopia_react/frontend/src';

// PosPage.jsx
$posPage = <<<'JS'
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  RotateCcw, 
  User, 
  Heart, 
  CreditCard, 
  Gift, 
  Tag, 
  Printer, 
  Layers,
  Pause,
  Play,
  Percent,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import PosCashModal from '../components/PosCashModal';
import ThermalTicketModal from '../components/ThermalTicketModal';
import InvoiceModal from '../components/InvoiceModal';
import IntuitiveProductSearchModal from '../components/IntuitiveProductSearchModal';

const SAMPLE_QUICK_PRODUCTS = [
  { id: '1', designation: 'Farming Simulator', price: 53.15, rayon: 'Arcade', stock: 10 },
  { id: '2', designation: 'GTA 5', price: 30.45, rayon: 'Arcade', stock: 5 },
  { id: '3', designation: 'Forza horizon 5', price: 71.05, rayon: 'Arcade', stock: 8 },
  { id: '4', designation: 'Helldivers 2', price: 26.02, rayon: 'Arcade', stock: 12 },
  { id: '5', designation: 'Tekken 8', price: 97.42, rayon: 'Arcade', stock: 4 },
  { id: '6', designation: 'Balatro', price: 20.28, rayon: 'Arcade', stock: 15 },
  { id: '7', designation: 'FA722 12V 72Ah 720A', price: 221.07, rayon: 'batterie', stock: 7 },
  { id: '8', designation: 'KOORUI Ecran PC 24.5', price: 105.32, rayon: 'casque', stock: 3 },
  { id: '9', designation: 'PHOINIKAS Casque Gaming', price: 101.48, rayon: 'casque', stock: 9 },
  { id: '10', designation: 'Ozeino Casque Gaming', price: 48.70, rayon: 'casque', stock: 6 },
  { id: '11', designation: 'Câble USB-C RAMPOW', price: 13.48, rayon: 'Cables', stock: 25 },
  { id: '12', designation: 'Chaussettes Adidas 10 Paires', price: 8.12, rayon: 'chaussette', stock: 30 },
];

export default function PosPage() {
  const [cart, setCart] = useState([
    { id: '9', designation: 'PHOINIKAS Casque Gaming Wireless', quantity: 1, price: 101.48, tva: 20, remise: 0, total: 121.78 },
    { id: '7', designation: 'FA722 12V 72Ah 720A Pice', quantity: 1, price: 221.07, tva: 20, remise: 0, total: 265.28 },
    { id: '10', designation: 'Ozeino Casque Gaming Pice', quantity: 1, price: 48.70, tva: 20, remise: 0, total: 58.44 },
    { id: '8', designation: 'KOORUI Ecran PC Gaming 24.5 Pouces', quantity: 1, price: 105.32, tva: 20, remise: 0, total: 126.38 }
  ]);

  const [activeRayon, setActiveRayon] = useState('Tous');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [client, setClient] = useState({ name: 'khaledrandji', points: 10.12, isPro: false });
  const [activeItem, setActiveItem] = useState(cart[1] || cart[0]);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [lastSaleData, setLastSaleData] = useState(null);

  // Financial calculations
  const totalHT = cart.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  const totalTVA = totalHT * 0.20;
  const totalTTC = cart.reduce((acc, it) => acc + (it.total || (it.price * it.quantity * 1.2)), 0);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id 
          ? { ...p, quantity: p.quantity + 1, total: parseFloat(((p.quantity + 1) * p.price * 1.2).toFixed(2)) }
          : p
        );
      } else {
        const newItem = {
          id: product.id,
          designation: product.designation,
          quantity: 1,
          price: product.price,
          tva: 20,
          remise: 0,
          total: parseFloat((product.price * 1.2).toFixed(2))
        };
        setActiveItem(newItem);
        return [...prev, newItem];
      }
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(p => p.id !== id));
  };

  const handleValidateSale = async (paymentDetails) => {
    const salePayload = {
      client: client.name,
      totalHT,
      totalTVA,
      totalTTC,
      paymentMethod: paymentDetails.mode,
      cashReceived: paymentDetails.receivedCash || totalTTC,
      changeGiven: paymentDetails.changeGiven || 0,
      vendor: 'amar',
      items: cart
    };

    try {
      const res = await fetch('/api/sales/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salePayload)
      });
      const data = await res.json();
      
      setLastSaleData({
        ...salePayload,
        reference: data.reference || 'CF-00000010'
      });

      setShowCashModal(false);

      if (paymentDetails.printInvoice) {
        setShowInvoiceModal(true);
      } else if (paymentDetails.printTicket) {
        setShowTicketModal(true);
      } else {
        alert(`Vente validée avec succès ! Référence: ${data.reference}`);
      }

      setCart([]);
    } catch (e) {
      console.error(e);
      alert('Erreur lors de l\'enregistrement de la vente.');
    }
  };

  const rayons = ['Tous', 'Alcool', 'Arcade', 'batterie', 'Boisson', 'bonbon', 'Cables', 'canapé', 'casque', 'chaussette'];

  const filteredQuickProducts = activeRayon === 'Tous' 
    ? SAMPLE_QUICK_PRODUCTS 
    : SAMPLE_QUICK_PRODUCTS.filter(p => p.rayon.toLowerCase() === activeRayon.toLowerCase());

  return (
    <div className="h-full flex flex-col bg-slate-100 overflow-hidden">
      {/* Top Banner for Active Product & Client */}
      <div className="bg-white border-b border-slate-300 p-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-6 text-xs">
          <div>
            <span className="text-slate-400 font-semibold">Libellé : </span>
            <span className="font-extrabold text-slate-800 text-sm">{activeItem?.designation || 'Sélectionner un article'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold">Rayon : </span>
            <span className="font-bold text-sky-700">Energy</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold">Qte Article : </span>
            <span className="font-black text-rose-600">{activeItem?.quantity || 1}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-slate-400 font-semibold">Code Produit : </span>
            <span className="font-bold text-sky-600">15AR5438682</span>
          </div>
          <div className="flex items-center space-x-1 pl-4 border-l border-slate-200">
            <User className="w-4 h-4 text-fuchsia-600" />
            <span className="text-slate-400 font-semibold">Client : </span>
            <span className="font-extrabold text-amber-700">{client.name}</span>
          </div>
          <div className="flex items-center space-x-1 text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <Heart className="w-3.5 h-3.5 fill-rose-500" />
            <span>{client.points} pts</span>
          </div>
        </div>

        {/* Digital Green Totals Banner */}
        <div className="flex items-center space-x-4">
          <div className="text-right text-xs space-y-0.5 text-sky-800 font-bold">
            <div>Total HT : {totalHT.toFixed(2)} €</div>
            <div>TOTAL TVA : {totalTVA.toFixed(2)} €</div>
            <div>TOTAL TTC : {totalTTC.toFixed(2)} €</div>
          </div>
          <div className="bg-slate-900 border-2 border-slate-700 px-4 py-1 rounded-lg shadow-inner">
            <div className="text-3xl font-digital font-black text-emerald-400 tracking-wider">
              {totalTTC.toFixed(2)} €
            </div>
          </div>
        </div>
      </div>

      {/* Main POS Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Cart Area */}
        <div className="flex-1 flex flex-col border-r border-slate-300 bg-white">
          {/* Scanner search input */}
          <div className="p-2 border-b border-slate-200 flex items-center space-x-2 bg-slate-50">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Scanner un produit ou saisir code à barre..."
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:border-sky-500 font-semibold"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
            </div>
            <button 
              onClick={() => setShowSearchModal(true)}
              className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 shadow-xs"
            >
              <span>Recherche Intuitive</span>
            </button>
            <button 
              onClick={() => setCart([])}
              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg"
              title="Vider le panier"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Cart items datagrid */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[11px] sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Désignation</th>
                  <th className="py-2 px-3 text-center">Quantité</th>
                  <th className="py-2 px-3 text-right">Prix</th>
                  <th className="py-2 px-3 text-center">TVA</th>
                  <th className="py-2 px-3 text-center">Remise</th>
                  <th className="py-2 px-3 text-right">Total</th>
                  <th className="py-2 px-2 text-center w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-16 text-slate-400 italic">
                      Aucun article dans le panier. Scannez un article ou cliquez sur un produit ci-dessous.
                    </td>
                  </tr>
                ) : (
                  cart.map((item, idx) => (
                    <tr 
                      key={idx}
                      onClick={() => setActiveItem(item)}
                      className={`cursor-pointer transition ${
                        activeItem?.id === item.id ? 'bg-sky-50 font-bold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2 px-3 font-semibold text-slate-800">{item.designation}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-black text-slate-700">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">{item.price.toFixed(2)}</td>
                      <td className="py-2 px-3 text-center">{item.tva}%</td>
                      <td className="py-2 px-3 text-center">{item.remise}</td>
                      <td className="py-2 px-3 text-right font-black text-sky-700">{item.total.toFixed(2)} €</td>
                      <td className="py-2 px-2 text-center">
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}
                          className="text-slate-300 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Touch Control Panel & Numpad */}
        <div className="w-80 bg-slate-50 flex flex-col p-2 select-none border-l border-slate-300">
          {/* Cashier Badge */}
          <div className="bg-white border border-slate-200 rounded-lg p-1.5 mb-2 text-center shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Vendeur : </span>
            <span className="font-extrabold text-slate-800 text-sm uppercase">amar</span>
          </div>

          {/* Control Tabs */}
          <div className="grid grid-cols-3 gap-1 mb-2 text-[11px] font-bold">
            <button className="bg-white border border-slate-300 py-1 rounded text-sky-700 shadow-xs font-black">Saisie</button>
            <button className="bg-slate-100 py-1 rounded text-slate-600 hover:bg-white">Documents</button>
            <button className="bg-slate-100 py-1 rounded text-slate-600 hover:bg-white">Options</button>
          </div>

          {/* POS Quick Function Tiles */}
          <div className="grid grid-cols-2 gap-1 mb-2 text-[11px] font-bold text-slate-700">
            <button className="bg-white border border-slate-200 hover:bg-slate-100 p-1.5 rounded shadow-xs text-center flex items-center justify-center space-x-1">
              <Play className="w-3 h-3 text-sky-600" />
              <span>Reprise vente</span>
            </button>
            <button className="bg-white border border-slate-200 hover:bg-slate-100 p-1.5 rounded shadow-xs text-center flex items-center justify-center space-x-1">
              <Pause className="w-3 h-3 text-amber-600" />
              <span>Mise en attente</span>
            </button>
            <button 
              onClick={() => setShowSearchModal(true)}
              className="bg-white border border-slate-200 hover:bg-slate-100 p-1.5 rounded shadow-xs text-center flex items-center justify-center space-x-1"
            >
              <Search className="w-3 h-3 text-indigo-600" />
              <span>Chercher article</span>
            </button>
            <button className="bg-white border border-slate-200 hover:bg-slate-100 p-1.5 rounded shadow-xs text-center flex items-center justify-center space-x-1">
              <Tag className="w-3 h-3 text-rose-600" />
              <span>Gestion Prix</span>
            </button>
            <button className="bg-white border border-slate-200 hover:bg-slate-100 p-1.5 rounded shadow-xs text-center flex items-center justify-center space-x-1">
              <User className="w-3 h-3 text-purple-600" />
              <span>Appel Client</span>
            </button>
            <button className="bg-white border border-slate-200 hover:bg-slate-100 p-1.5 rounded shadow-xs text-center flex items-center justify-center space-x-1">
              <Percent className="w-3 h-3 text-teal-600" />
              <span>Remise G (%)</span>
            </button>
            <button className="bg-white border border-slate-200 hover:bg-slate-100 p-1.5 rounded shadow-xs text-center flex items-center justify-center space-x-1">
              <Gift className="w-3 h-3 text-fuchsia-600" />
              <span>Vendre Carte KDO</span>
            </button>
            <button className="bg-white border border-slate-200 hover:bg-slate-100 p-1.5 rounded shadow-xs text-center flex items-center justify-center space-x-1">
              <Heart className="w-3 h-3 text-pink-600" />
              <span>Fidélité</span>
            </button>
          </div>

          {/* Touch Numpad */}
          <div className="flex-1 bg-white p-2 rounded-lg border border-slate-300 shadow-xs flex flex-col justify-between">
            {/* Direct modifier buttons */}
            <div className="grid grid-cols-4 gap-1 text-[10px] font-bold text-slate-700 mb-1">
              <button className="bg-slate-100 hover:bg-slate-200 py-1 rounded">Code</button>
              <button className="bg-slate-100 hover:bg-slate-200 py-1 rounded">Calc.</button>
              <button className="bg-slate-100 hover:bg-slate-200 py-1 rounded">Quantité</button>
              <button className="bg-slate-100 hover:bg-slate-200 py-1 rounded">Prix</button>
            </div>

            {/* Digits Grid */}
            <div className="grid grid-cols-3 gap-1.5 text-base font-black text-slate-800">
              {['9','8','7','6','5','4','3','2','1','0',',','+/-'].map(d => (
                <button
                  key={d}
                  onClick={() => {}}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2 rounded-lg shadow-xs active:bg-slate-200 transition"
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Big Green Encaisser Button */}
            <button
              onClick={() => setShowCashModal(true)}
              disabled={cart.length === 0}
              className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black py-3 rounded-lg text-lg shadow-md flex items-center justify-center space-x-2 transition uppercase tracking-wider"
            >
              <DollarSign className="w-6 h-6 stroke-[3]" />
              <span>ENCAISSER</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Horizontal Quick-Pick Articles */}
      <div className="h-44 bg-slate-900 border-t-2 border-sky-600 flex flex-col select-none">
        {/* Rayons Tab Bar */}
        <div className="bg-slate-800 px-2 py-1 flex items-center space-x-1 overflow-x-auto">
          {rayons.map(r => (
            <button
              key={r}
              onClick={() => setActiveRayon(r)}
              className={`px-3 py-1 rounded text-xs font-bold tracking-tight transition whitespace-nowrap ${
                activeRayon === r 
                  ? 'bg-sky-600 text-white shadow' 
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Quick Product Tiles */}
        <div className="flex-1 p-2 overflow-x-auto flex space-x-2">
          {filteredQuickProducts.map(p => (
            <div
              key={p.id}
              onClick={() => addToCart(p)}
              className="w-32 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-sky-500 rounded-lg p-1.5 flex flex-col justify-between cursor-pointer transition shadow group shrink-0"
            >
              <div className="w-full h-16 bg-slate-900 rounded flex items-center justify-center overflow-hidden border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold text-center px-1 group-hover:text-sky-400">
                  {p.designation}
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between text-xs">
                <span className="font-digital font-black text-rose-400">{p.price.toFixed(2)} €</span>
                <span className="text-[10px] text-slate-400 font-semibold">{p.stock} st</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showCashModal && (
        <PosCashModal
          totalTTC={totalTTC}
          onValidate={handleValidateSale}
          onClose={() => setShowCashModal(false)}
        />
      )}

      {showTicketModal && lastSaleData && (
        <ThermalTicketModal
          saleData={lastSaleData}
          onClose={() => setShowTicketModal(false)}
        />
      )}

      {showInvoiceModal && lastSaleData && (
        <InvoiceModal
          invoiceData={lastSaleData}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}

      {showSearchModal && (
        <IntuitiveProductSearchModal
          products={SAMPLE_QUICK_PRODUCTS}
          onSelect={(p) => { addToCart(p); setShowSearchModal(false); }}
          onClose={() => setShowSearchModal(false)}
        />
      )}
    </div>
  );
}
JS;
file_put_contents("$pagesDir/PosPage.jsx", $posPage);

echo "PosPage generated.\n";
