'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Order } from '@/lib/types';
import { Search, PackageCheck, Clock, Truck, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import Link from 'next/link';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<Order | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !phone.trim()) {
      setError('Please enter both Order ID and Phone Number.');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/${orderId.trim()}?phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();

      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setError(data.message || 'Order not found. Please check your Order ID and Phone number.');
      }
    } catch (err) {
      setError('An error occurred while tracking your order.');
    } finally {
      setLoading(false);
    }
  };

  const statuses = [
    { key: 'Bill Order Placed', label: 'Order Placed', icon: Clock },
    { key: 'Accepted', label: 'Order Accepted', icon: PackageCheck },
    { key: 'Payment Received', label: 'Payment Verified', icon: CheckCircle2 },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'Success', label: 'Delivered', icon: CheckCircle2 }
  ];

  const getStatusStepIndex = (currentStatus: string) => {
    const idx = statuses.findIndex((s) => s.key === currentStatus);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10">
        
        {/* Title */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-slate-900 uppercase tracking-widest mb-2 shadow">
            LIVE TRACKING
          </span>
          <h1 className="text-3xl font-extrabold text-[#0b255a] font-serif uppercase">
            Track Your Order Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enter your Order ID (e.g. SVC2026...) and registered Phone Number to check real-time status
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white border-2 border-amber-300 rounded-3xl p-6 sm:p-8 shadow-xl max-w-xl mx-auto mb-10">
          {error && (
            <div className="mb-4 bg-red-50 text-red-700 text-xs sm:text-sm p-3 rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Order ID *</label>
              <input
                type="text"
                required
                placeholder="e.g. SVC202608241234"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-4 py-2.5 text-sm font-mono uppercase border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#0b255a] hover:bg-amber-500 hover:text-slate-900 text-white font-bold text-sm py-3 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Searching...</span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search Order</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Result Details */}
        {order && (
          <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-8 shadow-xl space-y-8 animate-fade-in">
            
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold">Order ID</span>
                <h3 className="text-xl font-extrabold text-[#0b255a] font-mono">{order.order_id}</h3>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold block">Current Status</span>
                <span className="px-3 py-1 bg-amber-400 text-slate-900 font-extrabold text-xs rounded-full uppercase tracking-wider font-mono">
                  {order.status}
                </span>
              </div>
            </div>

            {/* Timeline Progress */}
            <div>
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-6">Status Progress Timeline</h4>
              <div className="relative flex items-center justify-between">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0"></div>
                {statuses.map((s, idx) => {
                  const currentIdx = getStatusStepIndex(order.status);
                  const isCompleted = idx <= currentIdx;
                  const Icon = s.icon;
                  return (
                    <div key={s.key} className="relative z-10 flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted
                          ? 'bg-[#0b255a] text-amber-400 border-amber-400 shadow-md'
                          : 'bg-white text-slate-300 border-slate-300'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] sm:text-xs font-bold mt-2 text-center max-w-[70px] ${
                        isCompleted ? 'text-[#0b255a]' : 'text-slate-400'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase block mb-1">Customer Details</span>
                <p className="font-bold text-slate-800 text-sm">{order.customer_name}</p>
                <p className="text-slate-600 font-mono">Phone: {order.customer_phone}</p>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase block mb-1">Delivery Address</span>
                <p className="text-slate-700">{order.customer_address}</p>
              </div>
            </div>

            {/* Order Items Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Ordered Items</h4>
                <Link
                  href={`/invoice/${order.order_id}`}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" /> View / Print Bill Invoice
                </Link>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-900 text-white uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {order.items && order.items.map((item) => (
                      <tr key={item.product_id} className="hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-800">{item.product_name}</td>
                        <td className="p-3 text-center font-bold">{item.quantity}</td>
                        <td className="p-3 text-right font-mono">₹{Number(item.unit_price).toFixed(2)}</td>
                        <td className="p-3 text-right font-bold font-mono">₹{Number(item.total_price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-amber-50 font-extrabold text-sm">
                      <td colSpan={3} className="p-3 text-right text-slate-800">Total Payable:</td>
                      <td className="p-3 text-right text-red-600 font-mono text-base">₹{Number(order.total_amount).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
