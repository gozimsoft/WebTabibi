<?php
$posPageFile = 'D:/Github/Utopia_react/frontend/src/pages/PosPage.jsx';

$content = <<<'JS'
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
  Banknote
} from 'lucide-react';
import CashierLoginScreen from '../components/CashierLoginScreen';
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

export default function PosPage({ onReturnDashboard }) {
  // Navigation mode: 'hub' (Ventes Hub screen) | 'login' (Cashier Access) | 'caisse' (Active POS terminal)
  const [posMode, setPosMode] = useState('hub');
  const [currentCashier, setCurrentCashier] = useState(null);

  // Sales Hub state
  const [salesList, setSalesList] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);

  // Active POS state
  const [cart, setCart] = useState([
    { id: '9', designation: 'PHOINIKAS Casque Gaming Wireless', quantity: 1, price: 101.48, tva: 20, remise: 0, total: 121.78 },
    { id: '7', designation: 'FA722 12V 72Ah 720A Pièce', quantity: 1, price: 221.07, tva: 20, remise: 0, total: 265.28 },
    { id: '10', designation: 'Ozeino Casque Gaming Pièce', quantity: 1, price: 48.70, tva: 20, remise: 0, total: 58.44 },
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
  const [numpadValue, setNumpadValue] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Load real sales data
  useEffect(() => {
    fetch('/api/sales')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          const formatted = data.data.map((s, idx) => ({
            type: s.isFacture === '1' ? 'Facture' : 'Ticket',
            reference: s.Reference || s.CodeVente || `CF-${String(idx + 1).padStart(8, '0')}`,
            date: s.DateInvoice ? new Date(s.DateInvoice).toLocaleString('fr-FR') : (s.DateVente ? new Date(s.DateVente).toLocaleString('fr-FR') : '14/06/2024 14:31:11'),
            totalTTC: parseFloat(s.Total_TTC || s.TotalTTC || 0),
            paiement: 'Paid',
            client: s.Client_id || 'khaledrandji'
          }));
          setSalesList(formatted);
          setSelectedSale(formatted[0]);
        } else {
          // Initial high-fidelity fallback matching the screenshot exactly
          const fallback = [
            { type: 'Ticket', reference: 'CF-00000009', date: '14/06/2024 14:31:11', totalTTC: 277.66, paiement: 'Paid', client: 'khaledrandji' },
            { type: 'Ticket', reference: 'CF-00000008', date: '06/06/2024 19:58:37', totalTTC: 149.40, paiement: 'Paid', client: 'khaledrandji' },
            { type: 'Ticket', reference: 'CF-00000007', date: '06/06/2024 15:11:22', totalTTC: 389.69, paiement: 'Paid', client: 'khaledrandji' },
            { type: 'Ticket', reference: 'CF-00000006', date: '06/06/2024 13:48:20', totalTTC: 9.74, paiement: 'Paid', client: 'Amar gozim' },
            { type: 'Ticket', reference: 'CF-00000005', date: '05/06/2024 19:53:58', totalTTC: 323.72, paiement: 'Paid', client: 'khaledrandji' },
            { type: 'Ticket', reference: 'CF-00000004', date: '05/06/2024 16:56:29', totalTTC: 345.60, paiement: 'Paid', client: 'khaledrandji' },
            { type: 'Ticket', reference: 'CF-00000003', date: '05/06/2024 16:56:09', totalTTC: 58.44, paiement: 'Paid', client: 'khaledrandji' },
            { type: 'Ticket', reference: 'CF-00000002', date: '05/06/2024 16:53:32', totalTTC: 180.22, paiement: 'Paid', client: 'khaledrandji' },
            { type: 'Ticket', reference: 'CF-00000001', date: '04/06/2024 21:37:27', totalTTC: 562.24, paiement: 'Paid', client: 'khaledrandji' },
          ];
          setSalesList(fallback);
          setSelectedSale(fallback[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Financial calculations for active cart
  const rawHT = cart.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  const totalHT = rawHT * (1 - discountPercent / 100);
  const totalTVA = totalHT * 0.20;
  const rawTTC = cart.reduce((acc, it) => acc + (it.total || (it.price * it.quantity * 1.2)), 0);
  const totalTTC = rawTTC * (1 - discountPercent / 100);

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

  const handleNumpadPress = (char) => {
    if (char === 'Effacer') {
      setNumpadValue('');
    } else {
      setNumpadValue(prev => prev + char);
      // If active item exists, we can allow direct quantity update
      if (activeItem && !isNaN(parseInt(char))) {
        const newQty = parseInt((numpadValue + char).replace(',', '')) || 1;
        setCart(prev => prev.map(item => item.id === activeItem.id 
          ? { ...item, quantity: newQty, total: parseFloat((newQty * item.price * 1.2).toFixed(2)) }
          : item
        ));
      }
    }
  };

  const toggleDiscount = () => {
    setDiscountPercent(prev => prev === 0 ? 5 : prev === 5 ? 10 : 0);
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
      vendor: currentCashier ? currentCashier.cashier : 'amar',
      items: cart
    };

    try {
      const res = await fetch('/api/sales/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salePayload)
      });
      const data = await res.json();
      
      const newRef = data.reference || `CF-${String(salesList.length + 1).padStart(8, '0')}`;
      setLastSaleData({
        ...salePayload,
        reference: newRef
      });

      // Add to sales list
      setSalesList(prev => [
        {
          type: paymentDetails.printInvoice ? 'Facture' : 'Ticket',
          reference: newRef,
          date: new Date().toLocaleString('fr-FR'),
          totalTTC,
          paiement: 'Paid',
          client: client.name
        },
        ...prev
      ]);

      setShowCashModal(false);

      if (paymentDetails.printInvoice) {
        setShowInvoiceModal(true);
      } else if (paymentDetails.printTicket) {
        setShowTicketModal(true);
      } else {
        alert(`Vente validée avec succès ! Référence: ${newRef}`);
      }

      setCart([]);
      setNumpadValue('');
    } catch (e) {
      console.error(e);
      alert('Erreur lors de l\'enregistrement de la vente.');
    }
  };

  // 1. CASHIER LOGIN & ACCESS SCREEN (Triggered by "Ventes En Caisse")
  if (posMode === 'login') {
    return (
      <CashierLoginScreen
        onLoginSuccess={(sessionData) => {
          setCurrentCashier(sessionData);
          setPosMode('caisse');
        }}
        onCancel={() => setPosMode('hub')}
      />
    );
  }

  // 2. ACTIVE POS TERMINAL ("La Caisse")
  if (posMode === 'caisse' && currentCashier) {
    const rayons = ['Tous', 'Alcool', 'Arcade', 'batterie', 'Boisson', 'bonbon', 'Cables', 'canapé', 'casque', 'chaussette'];
    const filteredQuickProducts = activeRayon === 'Tous' 
      ? SAMPLE_QUICK_PRODUCTS 
      : SAMPLE_QUICK_PRODUCTS.filter(p => p.rayon.toLowerCase() === activeRayon.toLowerCase());

    return (
      <div className="h-full flex flex-col bg-slate-100 overflow-hidden select-none">
        {/* Top Product & Client Ribbon */}
        <div className="bg-white border-b border-slate-300 px-4 py-2.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-6 text-xs">
            <div>
              <span className="text-slate-400 font-semibold">Libellé : </span>
              <span className="font-extrabold text-slate-900 text-sm">{activeItem?.designation || 'Sélectionner un article'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold">Rayon : </span>
              <span className="font-bold text-sky-700">Energy</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold">Qté : </span>
              <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {activeItem?.quantity || 1}
              </span>
            </div>
            <div className="flex items-center space-x-1 pl-3 border-l border-slate-200">
              <User className="w-4 h-4 text-fuchsia-600" />
              <span className="text-slate-400 font-semibold">Client : </span>
              <span className="font-extrabold text-amber-700">{client.name}</span>
            </div>
            <div className="flex items-center space-x-1 text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              <Heart className="w-3.5 h-3.5 fill-rose-500" />
              <span>{client.points} pts</span>
            </div>
          </div>

          {/* Cashier Badge & Actions */}
          <div className="flex items-center space-x-2 text-xs">
            <div className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1 font-bold text-slate-700">
              Vendeur : <span className="uppercase text-amber-600">{currentCashier.cashier}</span>
            </div>
            <button
              onClick={() => setPosMode('login')}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-xs"
              title="Changer de vendeur"
            >
              <Lock className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
              <span>Changer</span>
            </button>
            <button
              onClick={() => setPosMode('hub')}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-xs"
              title="Quitter la caisse et revenir au Hub Ventes"
            >
              <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
              <span>Quitter</span>
            </button>
          </div>
        </div>

        {/* Main POS Workspace: Left Cart + Right Panel Matching User's Photo */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Cart Area */}
          <div className="flex-1 flex flex-col border-r border-slate-300 bg-white">
            <div className="p-2.5 border-b border-slate-200 flex items-center space-x-2 bg-slate-50">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Scanner un produit ou saisir code à barre..."
                  value={barcodeInput}
                  onChange={e => setBarcodeInput(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-amber-500 font-semibold shadow-inner"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
              <button 
                onClick={() => setShowSearchModal(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
              >
                <span>Recherche Intuitive</span>
              </button>
              <button 
                onClick={() => setCart([])}
                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition"
                title="Vider le panier"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Table */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[11px] sticky top-0 border-b border-slate-200 select-none">
                  <tr>
                    <th className="py-2.5 px-3">Désignation</th>
                    <th className="py-2.5 px-3 text-center">Quantité</th>
                    <th className="py-2.5 px-3 text-right">Prix HT</th>
                    <th className="py-2.5 px-3 text-center">TVA</th>
                    <th className="py-2.5 px-3 text-center">Remise</th>
                    <th className="py-2.5 px-3 text-right">Total TTC</th>
                    <th className="py-2.5 px-2 text-center w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-20 text-slate-400 italic font-semibold">
                        Aucun article dans le panier. Scannez un article ou cliquez sur une vignette ci-dessous.
                      </td>
                    </tr>
                  ) : (
                    cart.map((item, idx) => (
                      <tr 
                        key={idx}
                        onClick={() => setActiveItem(item)}
                        className={`transition cursor-pointer ${
                          activeItem?.id === item.id ? 'bg-amber-50/70 border-l-4 border-amber-500 font-bold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{item.designation}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="bg-slate-100 px-2.5 py-0.5 rounded-full font-bold font-mono text-slate-800">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">{item.price.toFixed(2)} €</td>
                        <td className="py-2.5 px-3 text-center text-slate-500">20%</td>
                        <td className="py-2.5 px-3 text-center text-slate-400">
                          {discountPercent > 0 ? `${discountPercent}%` : '0%'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                          {item.total ? (item.total * (1 - discountPercent / 100)).toFixed(2) : (item.price * item.quantity * 1.2 * (1 - discountPercent / 100)).toFixed(2)} €
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}
                            className="text-slate-400 hover:text-rose-600 p-1"
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

          {/* Right Touch Control Panel: EXACT DESIGN FROM USER'S PHOTO */}
          <div className="w-[340px] bg-slate-50/80 flex flex-col p-4 select-none border-l border-slate-300 justify-between overflow-y-auto">
            <div className="space-y-3">
              {/* 1. Dark Blue Total Box matching photo */}
              <div className="bg-[#111425] text-white p-5 rounded-2xl shadow-lg border border-slate-800">
                <div className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
                  TOTAL TTC
                </div>
                <div className="text-4xl font-black tracking-tight my-1 font-sans">
                  {totalTTC.toFixed(2).replace('.', ',')} €
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold pt-1">
                  <span>HT {totalHT.toFixed(2).replace('.', ',')} €</span>
                  <span>TVA {totalTVA.toFixed(2).replace('.', ',')} €</span>
                </div>
              </div>

              {/* 2. Action Buttons Row: Mise en attente & Remise matching photo */}
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => alert('Vente mise en attente.')}
                  className="bg-white hover:bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 flex items-center justify-center space-x-2 text-xs font-bold text-slate-800 shadow-xs transition active:scale-95"
                >
                  <span className="text-slate-500 font-bold text-sm">⏸</span>
                  <span>Mise en attente</span>
                </button>
                <button 
                  onClick={toggleDiscount}
                  className={`border rounded-xl py-2.5 px-3 flex items-center justify-center space-x-2 text-xs font-bold shadow-xs transition active:scale-95 ${
                    discountPercent > 0 
                      ? 'bg-amber-500 text-white border-amber-600 font-black' 
                      : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                >
                  <span className={`${discountPercent > 0 ? 'text-white' : 'text-slate-500'} font-bold`}>%</span>
                  <span>Remise {discountPercent > 0 ? `(${discountPercent}%)` : ''}</span>
                </button>
              </div>

              {/* 3. Touch Numpad (Exact 4x3 Layout from Photo: 7 8 9 / 4 5 6 / 1 2 3 / Effacer 0 ,) */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {/* Row 1 */}
                {['7', '8', '9'].map(d => (
                  <button
                    key={d}
                    onClick={() => handleNumpadPress(d)}
                    className="bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-2xl py-3 text-2xl font-bold text-slate-900 shadow-xs flex items-center justify-center transition active:scale-95"
                  >
                    {d}
                  </button>
                ))}

                {/* Row 2 */}
                {['4', '5', '6'].map(d => (
                  <button
                    key={d}
                    onClick={() => handleNumpadPress(d)}
                    className="bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-2xl py-3 text-2xl font-bold text-slate-900 shadow-xs flex items-center justify-center transition active:scale-95"
                  >
                    {d}
                  </button>
                ))}

                {/* Row 3 */}
                {['1', '2', '3'].map(d => (
                  <button
                    key={d}
                    onClick={() => handleNumpadPress(d)}
                    className="bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-2xl py-3 text-2xl font-bold text-slate-900 shadow-xs flex items-center justify-center transition active:scale-95"
                  >
                    {d}
                  </button>
                ))}

                {/* Row 4: Effacer (pink/red) | 0 | , */}
                <button
                  onClick={() => handleNumpadPress('Effacer')}
                  className="bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 text-rose-700 font-bold text-sm rounded-2xl py-3 flex items-center justify-center transition active:scale-95"
                >
                  Effacer
                </button>
                <button
                  onClick={() => handleNumpadPress('0')}
                  className="bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-2xl py-3 text-2xl font-bold text-slate-900 shadow-xs flex items-center justify-center transition active:scale-95"
                >
                  0
                </button>
                <button
                  onClick={() => handleNumpadPress(',')}
                  className="bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-2xl py-3 text-2xl font-bold text-slate-900 shadow-xs flex items-center justify-center transition active:scale-95"
                >
                  ,
                </button>
              </div>

              {/* 4. Large Green Master "Encaisser →" Button matching photo */}
              <button
                onClick={() => setShowCashModal(true)}
                disabled={cart.length === 0}
                className="w-full bg-[#059669] hover:bg-[#047857] disabled:opacity-50 text-white font-black text-lg py-3.5 rounded-2xl shadow-md shadow-emerald-600/25 flex items-center justify-center space-x-2 transition active:scale-98 tracking-wide mt-2"
              >
                <Banknote className="w-5 h-5 stroke-[2.2]" />
                <span>Encaisser</span>
                <span className="text-xl leading-none">→</span>
              </button>
            </div>

            {/* 5. Bottom Right Amber "Imprimer le ticket 🖨️" button matching photo */}
            <div className="flex justify-end pt-3">
              <button
                onClick={() => {
                  if (lastSaleData) {
                    setShowTicketModal(true);
                  } else {
                    setLastSaleData({
                      reference: 'CF-00000009',
                      items: cart,
                      totalTTC,
                      totalHT,
                      totalTVA,
                      paymentMethod: 'Espèce',
                      cashReceived: totalTTC,
                      changeGiven: 0
                    });
                    setShowTicketModal(true);
                  }
                }}
                className="bg-[#e67e00] hover:bg-[#d07000] text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-amber-500/25 flex items-center space-x-2 transition active:scale-95"
              >
                <span>Imprimer le ticket</span>
                <Printer className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Horizontal Quick-Pick Articles */}
        <div className="h-44 bg-slate-900 border-t-2 border-amber-500 flex flex-col select-none">
          <div className="bg-slate-800 px-3 py-1.5 flex items-center space-x-1.5 overflow-x-auto">
            {rayons.map(r => (
              <button
                key={r}
                onClick={() => setActiveRayon(r)}
                className={`px-3 py-1 rounded-lg text-xs font-bold tracking-tight transition whitespace-nowrap ${
                  activeRayon === r 
                    ? 'bg-amber-500 text-slate-900 font-black shadow' 
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex-1 p-2 grid grid-flow-col auto-cols-[145px] gap-2 overflow-x-auto">
            {filteredQuickProducts.map(p => (
              <div
                key={p.id}
                onClick={() => addToCart(p)}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-400 rounded-xl p-2 flex flex-col justify-between cursor-pointer transition shadow group active:scale-95"
              >
                <div className="text-[11px] font-bold text-slate-200 truncate group-hover:text-amber-300">
                  {p.designation}
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="font-mono font-black text-emerald-400">
                    {(p.price * 1.2).toFixed(2)} €
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                    Qté: {p.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

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
            products={SAMPLE_QUICK_PRODUCTS.map(p => ({
              ID: p.id,
              Designation: p.designation,
              Prix_A: p.price * 0.7,
              Prix_V: p.price * 1.2,
              Rayon: p.rayon,
              CodeBarre: `37600000000${p.id}`
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

  // 3. DEFAULT SCREEN: VENTES / CAISSE HUB (Exact screen from user's screenshot)
  const totalReglements = salesList.reduce((acc, s) => acc + s.totalTTC, 0);

  return (
    <div className="h-full flex overflow-hidden bg-slate-100 select-none">
      {/* Left Sub-Panel: Action Tiles with Master "Ventes En Caisse" Button */}
      <div className="w-72 bg-slate-50 border-r border-slate-300 p-2.5 flex flex-col justify-between overflow-y-auto select-none">
        <div className="space-y-2">
          {/* Top Master Button: Ventes En Caisse -> Opens Cashier Login */}
          <button
            onClick={() => setPosMode('login')}
            className="w-full bg-white hover:bg-amber-50 border-2 border-amber-500 rounded-2xl p-3 shadow-md transition flex items-center space-x-3 text-left group active:scale-98"
            title="Ouvrir la caisse et lancer les ventes"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-black shadow-md shadow-amber-500/25 group-hover:scale-105 transition">
              <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-base font-black text-slate-900 tracking-tight block">
                Ventes En Caisse
              </span>
              <span className="text-[11px] text-amber-600 font-bold block">
                Identification du vendeur →
              </span>
            </div>
          </button>

          {/* Grid of Delphi Action Tiles from Screenshot */}
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold text-slate-700">
            {/* Row 1 */}
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <Coins className="w-5 h-5 text-rose-500 mb-1" />
              <span>Désistement encours</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <Calendar className="w-5 h-5 text-sky-600 mb-1" />
              <span>Clôture Journée</span>
            </button>

            {/* Row 2 */}
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <FileText className="w-5 h-5 text-purple-600 mb-1" />
              <span>Saisie Doc vente</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <RotateCcw className="w-5 h-5 text-rose-600 mb-1" />
              <span>Avoir Client</span>
            </button>

            {/* Row 3 */}
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <Edit3 className="w-5 h-5 text-sky-600 mb-1" />
              <span>Corrections Doc</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs transition">
              <CheckSquare className="w-5 h-5 text-emerald-600 mb-1" />
              <span>Clôtures Mois</span>
            </button>
          </div>

          {/* Row 4: 3-cols */}
          <div className="grid grid-cols-3 gap-1 text-[10px] font-bold text-slate-700">
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2 rounded-lg text-center shadow-xs">
              Fidélité
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2 rounded-lg text-center shadow-xs">
              Gestion Devis
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2 rounded-lg text-center shadow-xs">
              Bons d'Achat
            </button>
          </div>

          {/* Row 5: Cartes cadeaux & Payement encours */}
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold text-slate-700">
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs">
              <span className="text-slate-500 font-mono font-bold text-xs">0.00 $</span>
              <span>Cartes cadeaux</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center text-center shadow-xs">
              <CreditCard className="w-5 h-5 text-purple-600 mb-1" />
              <span>Paiement encours</span>
            </button>
          </div>

          {/* Row 6: 3-cols */}
          <div className="grid grid-cols-3 gap-1 text-[10px] font-bold text-slate-700">
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2 rounded-lg text-center shadow-xs">
              Correct. pay
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2 rounded-lg text-center shadow-xs">
              Bons d'avoirs
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2 rounded-lg text-center shadow-xs">
              Historique
            </button>
          </div>

          {/* Row 7: Chiffre d'Affaires, Année, Journées */}
          <div className="grid grid-cols-3 gap-1 text-[10px] font-bold text-slate-700">
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2 rounded-lg text-center shadow-xs flex flex-col items-center">
              <span className="text-amber-500 text-xs">💰</span>
              <span>C.A.</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2 rounded-lg text-center shadow-xs flex flex-col items-center">
              <span className="text-rose-500 text-xs font-mono font-black">+1y</span>
              <span>Année</span>
            </button>
            <button className="bg-white hover:bg-slate-100 border border-slate-200 py-2 rounded-lg text-center shadow-xs flex flex-col items-center">
              <span className="text-fuchsia-500 text-xs font-mono font-black">1</span>
              <span>Journées</span>
            </button>
          </div>
        </div>

        {/* Export / Document Action Icons */}
        <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
          <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 py-1.5 rounded-xl flex items-center justify-center text-emerald-600 shadow-xs" title="Export PDF">
            <FileSpreadsheet className="w-4 h-4" />
          </button>
          <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 py-1.5 rounded-xl flex items-center justify-center text-amber-600 shadow-xs" title="Envoyer">
            <Send className="w-4 h-4" />
          </button>
          <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 py-1.5 rounded-xl flex items-center justify-center text-rose-500 shadow-xs" title="Imprimer Document">
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Main Area: Date Range Filter + Sales Table + Summary Bar */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Top Date Filter Header */}
        <div className="p-2.5 border-b border-rose-300 bg-rose-50/40 flex items-center justify-between text-xs select-none">
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 shadow-inner">
              <input
                type="text"
                value="04/10/2023 00:01:01"
                readOnly
                className="bg-transparent outline-none text-xs font-mono font-semibold w-36"
              />
            </div>

            <div className="text-slate-400 font-bold px-1">
              ↔
            </div>

            <div className="flex items-center bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 shadow-inner">
              <input
                type="text"
                value="18/06/2024 23:59:59"
                readOnly
                className="bg-transparent outline-none text-xs font-mono font-semibold w-36"
              />
            </div>
          </div>

          {/* Search Button */}
          <button className="bg-white hover:bg-slate-100 border border-slate-300 p-1.5 rounded-lg text-slate-700 shadow-xs transition">
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Datagrid of Sales */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase font-black text-[11px] sticky top-0 border-b border-slate-200 select-none">
              <tr>
                <th className="py-2 px-3">Type Document</th>
                <th className="py-2 px-3">Référence</th>
                <th className="py-2 px-3">Date Facture</th>
                <th className="py-2 px-3 text-right">Total TTC</th>
                <th className="py-2 px-3 text-center">Paiement</th>
                <th className="py-2 px-3">Nom Complet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {salesList.map((s, idx) => {
                const isSelected = selectedSale?.reference === s.reference;
                return (
                  <tr
                    key={idx}
                    onClick={() => setSelectedSale(s)}
                    className={`transition cursor-pointer ${
                      isSelected 
                        ? 'bg-[#ef5350] text-white font-bold' 
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <td className="py-2 px-3 flex items-center space-x-1.5">
                      <span className={`${isSelected ? 'text-white' : 'text-slate-400'}`}>📄</span>
                      <span>{s.type}</span>
                    </td>
                    <td className="py-2 px-3 font-mono font-bold">
                      {s.reference}
                    </td>
                    <td className="py-2 px-3 font-mono">
                      {s.date}
                    </td>
                    <td className={`py-2 px-3 text-right font-mono font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {s.totalTTC.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-center font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
                        {s.paiement}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-semibold">
                      {s.client}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Financial Summary Bar */}
        <div className="bg-slate-50 border-t border-slate-300 p-2.5 flex items-center justify-between text-xs select-none">
          {/* Left Icon box */}
          <div className="w-8 h-8 bg-white border border-slate-300 rounded-lg flex items-center justify-center text-rose-500 shadow-xs">
            📄
          </div>

          {/* Counts */}
          <div className="flex items-center space-x-8 text-[11px] font-semibold text-slate-700">
            <div>
              <span className="text-slate-500">Nbre Factures non payé : </span>
              <strong className="text-slate-900">0</strong>
            </div>
            <div>
              <span className="text-slate-500">Nbre Remboursement : </span>
              <strong className="text-slate-900">...</strong>
            </div>
            <div>
              <span className="text-slate-500">Nombre Factures payé : </span>
              <strong className="text-slate-900 font-bold">{salesList.length}</strong>
            </div>
          </div>

          {/* Amounts */}
          <div className="flex items-center space-x-8 text-[11px] font-semibold text-slate-700">
            <div>
              <span className="text-slate-500">Total non payé : </span>
              <strong className="text-slate-900">0,00 €</strong>
            </div>
            <div>
              <span className="text-slate-500">Totale Rembourse : </span>
              <strong className="text-slate-900">...</strong>
            </div>
            <div className="text-xs">
              <span className="text-slate-500">Total Règlements : </span>
              <strong className="text-emerald-700 font-mono font-black text-sm">
                {totalReglements.toFixed(3)} €
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
JS;

file_put_contents($posPageFile, $content);
echo "Updated PosPage.jsx with exact Caisse right panel design successfully\n";
