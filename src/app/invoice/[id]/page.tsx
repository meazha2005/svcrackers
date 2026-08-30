'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Order } from '@/lib/types';
import { Printer, Share2, Send, ArrowLeft, CheckCircle, Clock, FileText, Phone, MapPin } from 'lucide-react';

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.order);
        } else {
          setError(data.message || 'Order not found');
        }
      } catch (err) {
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    }
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-600 font-semibold">Generating your estimate invoice...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto px-4 py-16 text-center space-y-4">
          <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200">
            <h2 className="text-lg font-bold">Order Invoice Error</h2>
            <p className="text-sm mt-1">{error || 'Order details unavailable.'}</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#0b255a] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-amber-500 hover:text-slate-900 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Format customer phone for direct WhatsApp messaging
  const rawPhone = order.customer_phone ? order.customer_phone.replace(/\D/g, '') : '';
  const customerPhoneFormatted = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

  // Build WhatsApp Share text
  const shareText = encodeURIComponent(
    `*SRI VINAYAGA CRACKERS - ORDER CONFIRMATION*\n\n` +
    `Order ID: ${order.order_id}\n` +
    `Customer: ${order.customer_name}\n` +
    `Total Amount: ₹${Number(order.total_amount).toFixed(2)}\n` +
    `Status: ${order.status}\n\n` +
    `View Invoice & Track Order: ${typeof window !== 'undefined' ? window.location.href : ''}`
  );

  const whatsappDirectUrl = customerPhoneFormatted
    ? `https://api.whatsapp.com/send?phone=${customerPhoneFormatted}&text=${shareText}`
    : `https://api.whatsapp.com/send?text=${shareText}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans">
      <div className="no-print">
        <Navbar />
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-10">
        
        {/* Action Header Bar (Hidden on Print) */}
        <div className="no-print mb-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>

          <div className="flex items-center gap-3">
            <a
              href={whatsappDirectUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow transition-transform hover:scale-105"
            >
              <Send className="w-4 h-4" /> Send on WhatsApp
            </a>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-[#0b255a] hover:bg-amber-500 hover:text-slate-900 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow transition-transform hover:scale-105"
            >
              <Printer className="w-4 h-4" /> Print / Save as PDF
            </button>
          </div>
        </div>

        {/* Invoice Printable Card */}
        <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
          
          {/* Header Branding */}
          <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b-2 border-slate-200 gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-amber-400 p-1 shadow">
                <Image src="/logo.png" alt="Sri Vinayaga Crackers" fill sizes="64px" className="object-contain" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b255a] font-serif uppercase tracking-wide">
                  SRI VINAYAGA CRACKERS
                </h1>
                <p className="text-xs text-slate-500 font-medium">D/No :229. Subramaniyapuram (Near Ruby Sparklers), Sivakasi- 626128</p>
                <p className="text-xs text-slate-500">Phone: +91 7780967465 / +91 9566383227 | Email: srivinayagacrackers26@gmail.com</p>
              </div>
            </div>

            <div className="text-right sm:text-right bg-slate-50 p-3 rounded-xl border border-slate-200 min-w-[200px]">
              <span className="text-xs text-slate-500 uppercase font-bold block">Estimated Order Invoice</span>
              <span className="text-base sm:text-lg font-extrabold text-red-600 font-mono">{order.order_id}</span>
              <div className="text-xs text-slate-500 mt-1">
                Date: {new Date(order.created_at).toLocaleDateString('en-IN')}
              </div>
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Customer Information</h3>
              <p className="font-bold text-slate-800 text-sm">{order.customer_name}</p>
              <p className="text-xs text-slate-600 font-mono mt-1">Phone: {order.customer_phone}</p>
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Delivery Address</h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{order.customer_address}</p>
            </div>
          </div>

          {/* Order Items Table */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-3">Itemized Estimate Breakdown</h3>
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase text-[11px]">
                    <th className="p-3">#</th>
                    <th className="p-3">Item Description</th>
                    <th className="p-3 text-center">Unit</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {order.items && order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-semibold text-slate-800">{item.product_name}</td>
                      <td className="p-3 text-center font-mono text-xs text-slate-600">{item.unit_symbol || 'BOX'}</td>
                      <td className="p-3 text-center font-bold text-slate-900">{item.quantity}</td>
                      <td className="p-3 text-right font-mono">₹{Number(item.unit_price).toFixed(2)}</td>
                      <td className="p-3 text-right font-bold font-mono text-slate-900">₹{Number(item.total_price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-amber-100/60 border-t-2 border-amber-300 font-extrabold">
                    <td colSpan={5} className="p-4 text-right text-slate-800 text-sm">
                      GRAND ESTIMATE TOTAL:
                    </td>
                    <td className="p-4 text-right text-red-700 font-mono text-lg sm:text-xl">
                      ₹{Number(order.total_amount).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="text-center pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Thank you for your order with Sri Vinayaga Crackers!</p>
            <p>For any order queries, please call us at +91 7780967465 / +91 9566383227 with Order ID {order.order_id}.</p>
          </div>

        </div>

      </main>

      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
}
