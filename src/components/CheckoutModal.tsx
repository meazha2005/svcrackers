'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, CheckCircle2, Loader2, User, Phone, MapPin } from 'lucide-react';
import { Product } from '@/lib/types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Record<number, number>;
  products: Product[];
  onOrderSuccess: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  products,
  onOrderSuccess
}: CheckoutModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  if (!isOpen) return null;

  // Selected cart items breakdown
  const selectedItems = Object.entries(cart)
    .map(([idStr, qty]) => {
      const pId = parseInt(idStr);
      const prod = products.find((p) => p.id === pId);
      if (!prod || qty <= 0) return null;
      const unitPrice = prod.discounted_rate ? Number(prod.discounted_rate) : Number(prod.mrp_rate);
      return {
        product: prod,
        quantity: qty,
        unitPrice,
        total: unitPrice * qty
      };
    })
    .filter(Boolean);

  const grandTotal = selectedItems.reduce((sum, item) => sum + (item?.total || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setErrorMsg('Please fill in your Name, Phone Number, and Address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second client timeout

    try {
      const fullAddress = `${address.trim()}${city ? ', ' + city.trim() : ''}${pincode ? ' - ' + pincode.trim() : ''}`;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          customer_address: fullAddress,
          cart
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      if (data.success && data.order_id) {
        onOrderSuccess();
        onClose();
        router.push(`/invoice/${data.order_id}`);
      } else {
        setErrorMsg(data.message || 'Failed to place order. Please try again.');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setErrorMsg('Order request timed out. Please check your internet connection and try again.');
      } else {
        setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl border-2 border-amber-400 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0b255a] to-[#103073] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-amber-400">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-amber-400 font-serif uppercase tracking-wide">
              Complete Your Order Estimate
            </h2>
            <p className="text-xs text-slate-300">Enter delivery details to submit your cracker estimate order</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {errorMsg && (
            <div className="bg-red-50 text-red-700 text-xs sm:text-sm p-3.5 rounded-xl border border-red-200 font-semibold shadow-sm">
              {errorMsg}
            </div>
          )}

          {/* Cart Summary Header Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2 pb-2 border-b border-slate-200">
              <span>Items Selected ({selectedItems.length})</span>
              <span className="text-amber-600 font-bold font-mono">Net Total</span>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {selectedItems.map((item) => (
                <div key={item!.product.id} className="flex items-center justify-between text-xs text-slate-700">
                  <span className="truncate max-w-[200px] sm:max-w-xs">{item!.product.name} × <strong>{item!.quantity}</strong></span>
                  <span className="font-mono font-semibold">₹{item!.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-sm sm:text-base font-extrabold text-slate-900">
              <span>Estimated Payable Amount:</span>
              <span className="text-red-600 font-mono text-lg sm:text-xl">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Form */}
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Full Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-500 outline-none"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone Number *</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-500 outline-none"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Delivery Address *</label>
                <div className="relative">
                  <textarea
                    required
                    rows={2}
                    placeholder="Street, House No, Landmark"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-500 outline-none resize-none"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* City / Town */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City / Town</label>
                <input
                  type="text"
                  placeholder="e.g. Madurai, Chennai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pincode</label>
                <input
                  type="text"
                  placeholder="6-digit Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </div>

              {/* Payment Method */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method Preference</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none bg-white font-medium text-slate-800"
                >
                  <option value="Cash on Delivery">Cash on Delivery / Direct Hand Payment</option>
                  <option value="GPay / PhonePe / Paytm">GPay / PhonePe / UPI Payment</option>
                  <option value="Bank Transfer">Direct Bank Transfer</option>
                </select>
              </div>

            </div>
          </form>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-800 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Placing Order...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Order Request</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
