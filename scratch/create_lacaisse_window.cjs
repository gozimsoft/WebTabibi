const fs = require('fs');

const caisseWindowCode = `import React, { useState, useEffect } from 'react';
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
  DollarSign,
  LogOut,
  Lock,
  Calendar,
  FileText,
  Edit3,
  CheckSquare,
  Coins,
  Send,
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Banknote,
  Maximize2,
  Minimize2,
  ExternalLink,
  RefreshCw,
  ShoppingBasket
} from 'lucide-react';
import CashierLoginScreen from './CashierLoginScreen';
import PosCashModal from './PosCashModal';
import ThermalTicketModal from './ThermalTicketModal';
import InvoiceModal from './InvoiceModal';
import IntuitiveProductSearchModal from './IntuitiveProductSearchModal';

const SAMPLE_QUICK_PRODUCTS = [
  { id: '1', designation: 'Farming Simulator', price: 53.15, rayon: 'Arcade', stock: 10, img: '🚜' },
  { id: '2', designation: 'GTA 5', price: 30.45, rayon: 'Arcade', stock: 5, img: '🚗' },
  { id: '3', designation: 'Forza horizon 5', price: 71.05, rayon: 'Arcade', stock: 8, img: '🏎️' },
  { id: '4', designation: 'Helldivers 2', price: 26.02, rayon: 'Arcade', stock: 12, img: '🚀' },
  { id: '5', designation: 'Tekken 8', price: 97.42, rayon: 'Arcade', stock: 4, img: '🥊' },
  { id: '6', designation: 'Balatro', price: 20.28, rayon: 'Arcade', stock: 15, img: '🃏' },
  { id: '7', designation: 'FA722 12V 72Ah 720A', price: 221.07, rayon: 'batterie', stock: 7, img: '⚡' },
  { id: '8', designation: 'KOORUI Ecran PC 24.5', price: 105.32, rayon: 'casque', stock: 3, img: '🖥️' },
  { id: '9', designation: 'PHOINIKAS Casque Gaming', price: 101.48, rayon: 'casque', stock: 9, img: '🎧' },
  { id: '10', designation: 'Ozeino Casque Gaming', price: 48.70, rayon: 'casque', stock: 6, img: '🎙️' },
  { id: '11', designation: 'Câble USB-C RAMPOW', price: 13.48, rayon: 'Cables', stock: 25, img: '🔌' },
  { id: '12', designation: 'Chaussettes Adidas 10 Paires', price: 8.12, rayon: 'chaussette', stock: 30, img: '🧦' },
];

export default function LaCaisseWindow({ standalone = false, onClose }) {
  // Current active cashier
  const [currentCashier, setCurrentCashier] = useState({
    cashier: 'amar',
    role: 'Vendeur Principal (Caisse 2)',
    fondDeCaisse: 150.00
  });
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Cart state
  const [cart, setCart] = useState([
    { id: '9', designation: 'PHOINIKAS Casque Gaming Wireless Pic', quantity: 1, price: 101.48, tva: 20, remise: 0, total: 121.78 },
    { id: '7', designation: 'FA722 12V 72Ah 720A Pice', quantity: 1, price: 221.07, tva: 20, remise: 0, total: 265.28 },
    { id: '10', designation: 'Ozeino Casque Gaming Pice', quantity: 1, price: 48.70, tva: 20, remise: 0, total: 58.44 },
    { id: '8', designation: 'KOORUI Ecran PC Gaming 24.5 Pouces, FH', quantity: 1, price: 105.32, tva: 20, remise: 0, total: 126.38 }
  ]);

  const [activeRayon, setActiveRayon] = useState('Tous');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [client, setClient] = useState({ name: 'khaledrandji', points: 10.12, isPro: false });
  const [activeItem, setActiveItem] = useState(cart[1] || cart[0]);
  const [activeTab, setActiveTab] = useState('saisie'); // 'saisie' | 'documents' | 'options'

  // Modals
  const [showCashModal, setShowCashModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [lastSaleData, setLastSaleData] = useState(null);
  const [numpadValue, setNumpadValue] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Calculations
  const totalHT = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalTVA = totalHT * 0.20;
  const rawTotalTTC = totalHT + totalTVA;
  const totalTTC = discountPercent > 0 ? rawTotalTTC * (1 - discountPercent / 100) : rawTotalTTC;

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price * 1.2 }
            : item
        );
      }
      const newItem = {
        id: product.id,
        designation: product.designation,
        quantity: 1,
        price: product.price,
        tva: 20,
        remise: 0,
        total: product.price * 1.2
      };
      setActiveItem(newItem);
      return [...prev, newItem];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
    if (activeItem?.id === id) {
      setActiveItem(cart[0] || null);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, total: newQty * item.price * 1.2 };
      }
      return item;
    }));
  };

  const handleNumpadPress = (val) => {
    if (val === 'Effacer') {
      setNumpadValue('');
    } else if (val === ',') {
      if (!numpadValue.includes('.')) setNumpadValue(prev => (prev || '0') + '.');
    } else {
      setNumpadValue(prev => prev + val);
    }
  };

  const toggleDiscount = () => {
    if (discountPercent === 0) setDiscountPercent(10);
    else if (discountPercent === 10) setDiscountPercent(20);
    else setDiscountPercent(0);
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
      vendor: currentCashier.cashier,
      items: cart
    };

    try {
      const res = await fetch('/api/sales/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salePayload)
      });
      const data = await res.json();
      const newRef = data.reference || \`CF-\${Date.now().toString().slice(-8)}\`;
      
      setLastSaleData({ ...salePayload, reference: newRef });
      setShowCashModal(false);

      if (paymentDetails.printInvoice) {
        setShowInvoiceModal(true);
      } else if (paymentDetails.printTicket) {
        setShowTicketModal(true);
      } else {
        alert(\`Vente validée avec succès ! Référence: \${newRef}\`);
      }

      setCart([]);
      setNumpadValue('');
    } catch (e) {
      console.error(e);
      alert('Erreur lors de l\\'enregistrement de la vente.');
    }
  };

  const rayons = ['Tous', 'Alcool', 'Arcade', 'batterie', 'Boisson', 'bonbon', 'Cables', 'canapé', 'casque', 'chaussette'];
  const filteredQuickProducts = activeRayon === 'Tous' 
    ? SAMPLE_QUICK_PRODUCTS 
    : SAMPLE_QUICK_PRODUCTS.filter(p => p.rayon.toLowerCase() === activeRayon.toLowerCase());

  const containerClasses = standalone
    ? "h-screen w-screen flex flex-col bg-slate-100 overflow-hidden select-none"
    : "fixed inset-0 z-50 flex flex-col bg-slate-100 overflow-hidden select-none shadow-2xl";

  return (
    <div className={containerClasses}>
      {/* 1. SEPARATE WINDOW TITLE BAR (Windows Delphi Style) */}
      <div className="h-8 bg-slate-200 border-b border-slate-300 flex items-center justify-between px-3 text-xs select-none shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-sky-600 flex items-center justify-center text-white text-[10px] font-black shadow-xs">
            U
          </div>
          <span className="font-bold text-slate-800 tracking-wide">La Caisse</span>
          <span className="text-[11px] text-slate-500 font-semibold pl-2 border-l border-slate-300">
            Post2 (Caisse N° 2) • Vendeur : <span className="font-black text-slate-700 uppercase">{currentCashier.cashier}</span>
          </span>
        </div>

        {/* Window Controls */}
        <div className="flex items-center space-x-1">
          {!standalone && (
            <button
              onClick={() => window.open('?mode=caisse', 'LaCaisse', 'width=1600,height=960')}
              className="px-2 py-0.5 hover:bg-slate-300 rounded text-slate-700 text-xs font-semibold mr-1 border border-slate-300 flex items-center space-x-1 transition"
              title="Détacher dans une fenêtre externe indépendante"
            >
              <ExternalLink className="w-3 h-3 text-sky-700" />
              <span>Détacher</span>
            </button>
          )}
          <button 
            className="w-7 h-6 hover:bg-slate-300 flex items-center justify-center rounded text-slate-700 font-bold transition"
            title="Réduire"
          >
            —
          </button>
          <button 
            className="w-7 h-6 hover:bg-slate-300 flex items-center justify-center rounded text-slate-700 font-bold transition"
            title="Agrandir"
          >
            □
          </button>
          <button 
            onClick={onClose}
            className="w-8 h-6 hover:bg-rose-600 hover:text-white flex items-center justify-center rounded text-slate-700 font-bold transition active:scale-95"
            title="Fermer La Caisse"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 2. TOP RIBBON: ARTICLE INFO, CLIENT, AND NEON DIGITAL DISPLAY */}
      <div className="bg-white border-b-2 border-slate-300 px-3 py-2 flex items-center justify-between shadow-xs shrink-0">
        {/* Left: Article & Client Details */}
        <div className="flex-1 grid grid-cols-12 gap-2 text-xs">
          <div className="col-span-8 space-y-1">
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-slate-500 font-bold">Libellé : </span>
                <span className="font-black text-slate-900 text-sm">
                  {activeItem?.designation || 'Sélectionner un article'}
                </span>
              </div>
              <label className="flex items-center space-x-1.5 cursor-pointer ml-auto pr-4">
                <input type="checkbox" checked={client.isPro} onChange={e => setClient({ ...client, isPro: e.target.checked })} className="rounded text-sky-600" />
                <span className="text-xs font-bold text-slate-600">Pro</span>
              </label>
            </div>

            <div className="flex items-center space-x-4 text-[11px] text-slate-600 font-medium">
              <div>
                <span className="text-slate-500 font-bold">Rayon : </span>
                <span className="font-bold text-sky-700">Energy</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold">Qte Article : </span>
                <span className="font-black text-rose-600 font-mono text-xs">{activeItem?.quantity || 1}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold">Remise : </span>
                <span className="text-slate-400">........</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold">Taux : </span>
                <span className="text-slate-400">20%</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-[11px]">
              <div>
                <span className="text-slate-500 font-bold">Code Produit : </span>
                <span className="font-black text-sky-700 font-mono">15AR5438682</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold">Stock : </span>
                <span className="font-bold text-slate-700 font-mono">0</span>
              </div>
              <div className="flex items-center space-x-1 pl-2 border-l border-slate-300">
                <span className="text-slate-500 font-bold">Client : </span>
                <span className="font-extrabold text-amber-700">{client.name}</span>
              </div>
              <div className="flex items-center space-x-1 text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                <Heart className="w-3 h-3 fill-rose-500" />
                <span>{client.points} pts</span>
              </div>
            </div>
          </div>

          {/* Right: Totals HT/TVA/TTC + Giant Green Neon LED Display */}
          <div className="col-span-4 flex items-center justify-end space-x-4 pl-3 border-l border-slate-300">
            <div className="text-right text-xs space-y-0.5">
              <div className="text-sky-700 font-bold">Total HT : <span className="font-mono">{totalHT.toFixed(2).replace('.', ',')} €</span></div>
              <div className="text-sky-700 font-bold">TOTAL TVA : <span className="font-mono">{totalTVA.toFixed(2).replace('.', ',')} €</span></div>
              <div className="text-sky-800 font-extrabold">TOTAL TTC : <span className="font-mono">{totalTTC.toFixed(2).replace('.', ',')} €</span></div>
            </div>

            {/* Giant Green Neon LED Display (Exact from Photo) */}
            <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-xl px-4 py-2 shadow-inner flex items-center justify-center min-w-[170px]">
              <span className="text-3xl font-black font-mono text-emerald-400 tracking-wider drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                {totalTTC.toFixed(2).replace('.', ',')} €
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: LEFT CART + CENTER TABS + RIGHT KEYPAD */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: SCANNER & BASKET TABLE */}
        <div className="flex-1 flex flex-col bg-white border-r border-slate-300">
          {/* Scanner Bar */}
          <div className="p-2 border-b border-slate-200 flex items-center space-x-2 bg-slate-50">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Scanner un produit..."
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                className="w-full bg-white border-2 border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none focus:border-amber-500 font-semibold shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
            </div>
            <button 
              onClick={() => setShowSearchModal(true)}
              className="p-1.5 bg-white border-2 border-slate-300 hover:bg-slate-100 rounded-xl text-slate-700 shadow-xs transition"
              title="Rechercher produit"
            >
              <RefreshCw className="w-4 h-4 text-sky-600" />
            </button>
          </div>

          {/* Table with Vertical Side Actions */}
          <div className="flex-1 flex overflow-hidden">
            {/* Table */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[11px] sticky top-0 border-b border-slate-200 select-none">
                  <tr>
                    <th className="py-2 px-2 text-center w-6"></th>
                    <th className="py-2 px-3">Désignation</th>
                    <th className="py-2 px-3 text-center">Quantité</th>
                    <th className="py-2 px-3 text-right">Prix</th>
                    <th className="py-2 px-3 text-center">Tva</th>
                    <th className="py-2 px-3 text-center">Remise</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-20 text-slate-400 italic font-semibold">
                        Panier vide. Scannez un article ou choisissez une vignette en bas.
                      </td>
                    </tr>
                  ) : (
                    cart.map((item, idx) => {
                      const isSelected = activeItem?.id === item.id;
                      return (
                        <tr 
                          key={idx}
                          onClick={() => setActiveItem(item)}
                          className={\`transition cursor-pointer \${
                            isSelected ? 'bg-amber-50/80 font-bold border-l-4 border-amber-500' : 'hover:bg-slate-50'
                          }\`}
                        >
                          <td className="py-2 px-2 text-center font-bold text-slate-800">
                            {isSelected ? '▶' : ''}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-900">{item.designation}</td>
                          <td className="py-2 px-3 text-center">
                            <span className="bg-slate-100 px-2 py-0.5 rounded font-mono font-bold text-slate-800">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-700">{item.price.toFixed(2)}</td>
                          <td className="py-2 px-3 text-center text-slate-500">{item.tva || 20}</td>
                          <td className="py-2 px-3 text-center text-slate-400">{item.remise || 0}</td>
                          <td className="py-2 px-3 text-right font-mono font-black text-slate-900">
                            {(item.price * item.quantity * 1.2).toFixed(2)} €
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Vertical Cart Actions: [+], [-], [Cart], [Trash] */}
            <div className="w-12 bg-slate-50 border-l border-slate-200 p-1 flex flex-col justify-between items-center select-none">
              <div className="space-y-1.5 w-full">
                <button
                  onClick={() => activeItem && updateQuantity(activeItem.id, 1)}
                  className="w-full h-10 bg-white hover:bg-emerald-50 border-2 border-slate-300 hover:border-emerald-500 rounded-xl flex items-center justify-center text-emerald-600 shadow-xs transition active:scale-95"
                  title="Augmenter quantité"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </button>
                <button
                  onClick={() => activeItem && updateQuantity(activeItem.id, -1)}
                  className="w-full h-10 bg-white hover:bg-rose-50 border-2 border-slate-300 hover:border-rose-500 rounded-xl flex items-center justify-center text-rose-600 shadow-xs transition active:scale-95"
                  title="Diminuer quantité"
                >
                  <Minus className="w-5 h-5 stroke-[2.5]" />
                </button>
                <button
                  onClick={() => setShowSearchModal(true)}
                  className="w-full h-10 bg-white hover:bg-amber-50 border-2 border-slate-300 hover:border-amber-500 rounded-xl flex items-center justify-center text-amber-600 shadow-xs transition active:scale-95"
                  title="Catalogue articles"
                >
                  <ShoppingBasket className="w-5 h-5 stroke-[2]" />
                </button>
              </div>

              <button
                onClick={() => setCart([])}
                className="w-full h-10 bg-white hover:bg-rose-50 border-2 border-slate-300 hover:border-rose-500 rounded-xl flex items-center justify-center text-rose-600 shadow-xs transition active:scale-95 mb-1"
                title="Vider tout le panier"
              >
                <Trash2 className="w-5 h-5 stroke-[2]" />
              </button>
            </div>
          </div>
        </div>

        {/* CENTER: DELPHI CASHIER ACTION TABS (Saisie, Documents, Options) */}
        <div className="w-[300px] bg-slate-50 border-r border-slate-300 flex flex-col select-none">
          {/* 3 Tabs Header */}
          <div className="flex border-b border-slate-300 text-xs font-bold text-slate-700 bg-slate-200">
            <button
              onClick={() => setActiveTab('saisie')}
              className={\`flex-1 py-2 text-center transition \${
                activeTab === 'saisie' ? 'bg-white border-t-2 border-sky-600 font-black text-sky-700' : 'hover:bg-slate-100 text-slate-600'
              }\`}
            >
              Saisie
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={\`flex-1 py-2 text-center transition \${
                activeTab === 'documents' ? 'bg-white border-t-2 border-sky-600 font-black text-sky-700' : 'hover:bg-slate-100 text-slate-600'
              }\`}
            >
              Documents
            </button>
            <button
              onClick={() => setActiveTab('options')}
              className={\`flex-1 py-2 text-center transition \${
                activeTab === 'options' ? 'bg-white border-t-2 border-sky-600 font-black text-sky-700' : 'hover:bg-slate-100 text-slate-600'
              }\`}
            >
              Options
            </button>
          </div>

          {/* Action Tiles Grid */}
          <div className="p-2 flex-1 overflow-y-auto space-y-1.5">
            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold text-slate-700">
              <button 
                onClick={() => alert('Reprise de vente.')}
                className="bg-white hover:bg-slate-100 border-2 border-slate-200 p-2.5 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-95"
              >
                <RotateCcw className="w-5 h-5 text-rose-500 mb-1" />
                <span>Reprise de vente</span>
              </button>
              <button 
                onClick={() => alert('Vente mise en attente.')}
                className="bg-white hover:bg-slate-100 border-2 border-slate-200 p-2.5 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-95"
              >
                <Pause className="w-5 h-5 text-amber-500 mb-1" />
                <span>Mise en attente</span>
              </button>

              <button 
                onClick={() => setShowSearchModal(true)}
                className="bg-white hover:bg-slate-100 border-2 border-slate-200 p-2.5 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-95"
              >
                <Search className="w-5 h-5 text-sky-600 mb-1" />
                <span>Chercher article</span>
              </button>
              <button 
                onClick={() => alert('Gestion Prix article.')}
                className="bg-white hover:bg-slate-100 border-2 border-slate-200 p-2.5 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-95"
              >
                <Tag className="w-5 h-5 text-purple-600 mb-1" />
                <span>Gestion Prix</span>
              </button>

              <button 
                onClick={() => alert('Appel Client.')}
                className="bg-white hover:bg-slate-100 border-2 border-slate-200 p-2.5 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-95"
              >
                <User className="w-5 h-5 text-fuchsia-600 mb-1" />
                <span>Appel Client</span>
              </button>
              <button 
                onClick={toggleDiscount}
                className="bg-white hover:bg-slate-100 border-2 border-slate-200 p-2.5 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-95"
              >
                <Percent className="w-5 h-5 text-rose-500 mb-1" />
                <span>Remise en +</span>
              </button>

              <button 
                className="bg-white hover:bg-slate-100 border-2 border-slate-200 p-2.5 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-95"
              >
                <Gift className="w-5 h-5 text-emerald-600 mb-1" />
                <span>Vendre chèque KDO</span>
              </button>
              <button 
                className="bg-white hover:bg-slate-100 border-2 border-slate-200 p-2.5 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-95"
              >
                <CreditCard className="w-5 h-5 text-sky-600 mb-1" />
                <span>Vendre Carte KDO</span>
              </button>

              <button 
                className="bg-white hover:bg-slate-100 border-2 border-slate-200 p-2.5 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-95"
              >
                <Coins className="w-5 h-5 text-teal-600 mb-1" />
                <span>Fidélité</span>
              </button>
              <button 
                className="bg-white hover:bg-slate-100 border-2 border-slate-200 p-2.5 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition hover:shadow-sm active:scale-95"
              >
                <FileText className="w-5 h-5 text-indigo-600 mb-1" />
                <span>Imp Facture</span>
              </button>
            </div>

            <button 
              onClick={() => setShowTicketModal(true)}
              className="w-full bg-white hover:bg-slate-100 border-2 border-slate-200 py-2 px-3 rounded-xl flex items-center justify-center space-x-2 text-xs font-bold text-slate-700 shadow-xs transition hover:shadow-sm"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Imprimer ticket</span>
            </button>
          </div>
        </div>

        {/* RIGHT: TOUCH NUMPAD & MASTER ENCAISSER BUTTON */}
        <div className="w-[320px] bg-slate-50 flex flex-col p-3 select-none justify-between overflow-y-auto">
          <div className="space-y-2.5">
            {/* Cashier Name Bar */}
            <div className="bg-slate-200 border border-slate-300 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Vendeur :</span>
              <span className="text-amber-600 font-extrabold uppercase">{currentCashier.cashier}</span>
              <button 
                onClick={() => setShowLoginModal(true)}
                className="text-[10px] bg-white border border-slate-300 hover:bg-slate-50 px-2 py-0.5 rounded text-slate-600 font-semibold"
              >
                Changer
              </button>
            </div>

            {/* Numpad Input Display */}
            <div className="bg-white border-2 border-slate-300 rounded-xl p-2.5 text-right font-mono text-xl font-bold text-slate-800 min-h-[44px] shadow-inner">
              {numpadValue || '0'}
            </div>

            {/* Function Row: Code, Calc, Qté, Rem%, Prix */}
            <div className="grid grid-cols-4 gap-1 text-[11px] font-bold text-slate-700">
              <button className="bg-white hover:bg-slate-100 border-2 border-slate-200 py-1.5 rounded-lg text-center shadow-xs">Code</button>
              <button className="bg-white hover:bg-slate-100 border-2 border-slate-200 py-1.5 rounded-lg text-center shadow-xs">Calc.</button>
              <button className="bg-white hover:bg-slate-100 border-2 border-slate-200 py-1.5 rounded-lg text-center shadow-xs">Quantité</button>
              <button className="bg-white hover:bg-slate-100 border-2 border-slate-200 py-1.5 rounded-lg text-center shadow-xs">Prix</button>
            </div>

            {/* Touch Numpad (Exact 4x3 Layout from User's Photo) */}
            <div className="grid grid-cols-3 gap-1.5">
              {['7', '8', '9'].map(d => (
                <button
                  key={d}
                  onClick={() => handleNumpadPress(d)}
                  className="bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-2xl py-3 text-2xl font-bold text-slate-900 shadow-xs flex items-center justify-center transition hover:shadow-sm active:scale-95"
                >
                  {d}
                </button>
              ))}

              {['4', '5', '6'].map(d => (
                <button
                  key={d}
                  onClick={() => handleNumpadPress(d)}
                  className="bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-2xl py-3 text-2xl font-bold text-slate-900 shadow-xs flex items-center justify-center transition hover:shadow-sm active:scale-95"
                >
                  {d}
                </button>
              ))}

              {['1', '2', '3'].map(d => (
                <button
                  key={d}
                  onClick={() => handleNumpadPress(d)}
                  className="bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-2xl py-3 text-2xl font-bold text-slate-900 shadow-xs flex items-center justify-center transition hover:shadow-sm active:scale-95"
                >
                  {d}
                </button>
              ))}

              {/* Row 4: Effacer | 0 | , */}
              <button
                onClick={() => handleNumpadPress('Effacer')}
                className="bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 text-rose-700 font-bold text-xs rounded-2xl py-3 flex items-center justify-center transition hover:shadow-sm active:scale-95"
              >
                Effacer
              </button>
              <button
                onClick={() => handleNumpadPress('0')}
                className="bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-2xl py-3 text-2xl font-bold text-slate-900 shadow-xs flex items-center justify-center transition hover:shadow-sm active:scale-95"
              >
                0
              </button>
              <button
                onClick={() => handleNumpadPress(',')}
                className="bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-2xl py-3 text-2xl font-bold text-slate-900 shadow-xs flex items-center justify-center transition hover:shadow-sm active:scale-95"
              >
                ,
              </button>
            </div>
          </div>

          {/* Master ENCAISSER Button (Giant Green Button) */}
          <button
            onClick={() => setShowCashModal(true)}
            className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 border-2 border-emerald-500 text-white rounded-2xl py-3.5 px-4 font-black text-lg tracking-wide shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-3 transition active:scale-98"
          >
            <Banknote className="w-7 h-7" />
            <span>ENCAISSER</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* 4. BOTTOM BAR: CATEGORY TABS & TOUCH PRODUCTS GRID */}
      <div className="h-32 bg-slate-900 border-t-2 border-slate-700 flex flex-col shrink-0 select-none">
        {/* Category Tabs */}
        <div className="bg-[#111425] border-b border-slate-800 px-2 py-1 flex items-center space-x-1 overflow-x-auto text-[11px] font-bold text-slate-300">
          {rayons.map(r => (
            <button
              key={r}
              onClick={() => setActiveRayon(r)}
              className={\`px-3 py-1 rounded-lg transition whitespace-nowrap \${
                activeRayon === r 
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs' 
                  : 'hover:bg-slate-800 text-slate-300'
              }\`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Quick Touch Products Horizontal Strip */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-2 grid grid-flow-col auto-cols-[140px] gap-2 overflow-x-auto">
            {filteredQuickProducts.map(p => (
              <div
                key={p.id}
                onClick={() => addToCart(p)}
                className="bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-amber-400 rounded-xl p-2 flex flex-col justify-between cursor-pointer transition shadow-xs group active:scale-95"
              >
                <div className="text-[11px] font-bold text-slate-200 truncate group-hover:text-amber-300 flex items-center space-x-1">
                  <span>{p.img || '📦'}</span>
                  <span className="truncate">{p.designation}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="font-mono font-black text-emerald-400">
                    {(p.price * 1.2).toFixed(2)} €
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded font-bold">
                    {p.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Right Control Icons & Exit Button */}
          <div className="w-20 bg-slate-950 border-l border-slate-800 flex flex-col justify-between items-center py-2 px-1">
            <button 
              onClick={() => setShowLoginModal(true)}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded-lg transition"
              title="Changer de vendeur"
            >
              <Lock className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-xl flex flex-col items-center justify-center font-bold text-[10px] shadow-sm transition active:scale-95"
              title="Quitter La Caisse et fermer la fenêtre"
            >
              <LogOut className="w-4 h-4 mb-0.5" />
              <span>Quitter</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
          <CashierLoginScreen
            onLoginSuccess={(session) => {
              setCurrentCashier(session);
              setShowLoginModal(false);
            }}
            onCancel={() => setShowLoginModal(false)}
          />
        </div>
      )}

      {showCashModal && (
        <PosCashModal
          totalTTC={totalTTC}
          onValidate={handleValidateSale}
          onClose={() => setShowCashModal(false)}
        />
      )}

      {showTicketModal && (
        <ThermalTicketModal
          saleData={lastSaleData || {
            reference: 'CF-00000009',
            totalHT,
            totalTVA,
            totalTTC,
            cashReceived: totalTTC,
            changeGiven: 0,
            paymentMethod: 'Espèce',
            vendor: currentCashier.cashier,
            items: cart,
            date: new Date().toLocaleString('fr-FR'),
            client: client.name
          }}
          onClose={() => setShowTicketModal(false)}
        />
      )}

      {showInvoiceModal && (
        <InvoiceModal
          invoiceData={lastSaleData || {
            reference: 'CF-00000009',
            totalHT,
            totalTVA,
            totalTTC,
            items: cart,
            client: client.name,
            date: new Date().toLocaleDateString('fr-FR'),
            vendor: currentCashier.cashier
          }}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}

      {showSearchModal && (
        <IntuitiveProductSearchModal
          products={SAMPLE_QUICK_PRODUCTS.map(p => ({
            ID: p.id,
            Designation: p.designation,
            Prix_A: p.price * 0.7,
            Prix_V: p.price * 1.2,
            Rayon: p.rayon,
            CodeBarre: \`37600000000\${p.id}\`
          }))}
          onSelect={(p) => {
            addToCart({ id: p.ID, designation: p.Designation, price: p.Prix_V / 1.2 });
          }}
          onClose={() => setShowSearchModal(false)}
        />
      )}
    </div>
  );
}
`;

fs.writeFileSync('D:/Github/Utopia_react/frontend/src/components/LaCaisseWindow.jsx', caisseWindowCode, 'utf8');
console.log('Successfully written LaCaisseWindow.jsx');
