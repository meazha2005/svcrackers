'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Eye, Edit, Trash2, RefreshCw, Printer, CheckCircle, Clock, X, Package, Send } from 'lucide-react';
import { Order } from '@/lib/types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Status Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `/api/orders?page=${page}&limit=15`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const openStatusModal = (ord: Order) => {
    setSelectedOrder(ord);
    setNewStatus(ord.status);
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.order_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (data.success) {
        setIsStatusModalOpen(false);
        fetchOrders();
      } else {
        alert(data.message || 'Failed to update status.');
      }
    } catch (err) {
      alert('Error updating status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(`Are you sure you want to delete order ${orderId}?`)) return;

    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      } else {
        alert(data.message || 'Failed to delete order.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const statusOptions = [
    'Bill Order Placed',
    'Accepted',
    'Payment Received',
    'Out for Delivery',
    'Success'
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0b255a] font-serif">Orders Management</h1>
          <p className="text-xs text-slate-500">View, update status, print invoice, and manage customer cracker orders</p>
        </div>
        <Link
          href="/admin/billing"
          className="bg-[#0b255a] hover:bg-amber-500 hover:text-slate-900 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow transition-all flex items-center gap-1.5 w-fit"
        >
          <ShoppingCart className="w-4 h-4" /> Create Manual Order
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search Order ID, Customer Name, or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-auto px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none bg-white font-medium text-slate-800"
        >
          <option value="">All Statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900 text-white uppercase text-[11px] font-bold">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3 text-center">Items</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-center w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((ord) => (
                  <tr key={ord.order_id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold font-mono text-[#0b255a]">{ord.order_id}</td>
                    <td className="p-3 font-semibold text-slate-800">{ord.customer_name}</td>
                    <td className="p-3 font-mono text-slate-600">
                      <a href={`tel:${ord.customer_phone}`} className="hover:underline">{ord.customer_phone}</a>
                    </td>
                    <td className="p-3 text-center font-bold">{ord.item_count || 1}</td>
                    <td className="p-3 text-right font-extrabold font-mono text-red-600">
                      ₹{Number(ord.total_amount).toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => openStatusModal(ord)}
                        className="px-2.5 py-1 bg-amber-100 text-amber-900 hover:bg-amber-200 text-[11px] font-bold rounded-full font-mono transition-colors"
                      >
                        {ord.status}
                      </button>
                    </td>
                    <td className="p-3 text-xs text-slate-500">
                      {new Date(ord.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {(() => {
                          const rawP = ord.customer_phone ? ord.customer_phone.replace(/[^0-9]/g, '') : '';
                          const waPhone = rawP.length === 10 ? `91${rawP}` : (rawP.length > 10 ? rawP : '');
                          const waText = encodeURIComponent(
                            `*SRI VINAYAGA CRACKERS - ESTIMATE INVOICE*\n\n` +
                            `Hello ${ord.customer_name},\n` +
                            `Thank you for your order!\n\n` +
                            `🆔 *Order ID:* ${ord.order_id}\n` +
                            `💵 *Total Amount:* ₹${Number(ord.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n` +
                            `📌 *Status:* ${ord.status}\n\n` +
                            `📄 *View Invoice:* ${typeof window !== 'undefined' ? window.location.origin : ''}/invoice/${ord.order_id}`
                          );
                          if (!waPhone) return null;
                          return (
                            <a
                              href={`https://api.whatsapp.com/send?phone=${waPhone}&text=${waText}`}
                              target="_blank"
                              rel="noreferrer"
                              title={`Send invoice to ${ord.customer_name} via WhatsApp (${ord.customer_phone})`}
                              className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors"
                            >
                              <Send className="w-4 h-4" />
                            </a>
                          );
                        })()}
                        <Link
                          href={`/invoice/${ord.order_id}`}
                          target="_blank"
                          title="Print Bill Invoice"
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                        >
                          <Printer className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openStatusModal(ord)}
                          title="Update Status"
                          className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(ord.order_id)}
                          title="Delete Order"
                          className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition-colors ${
                  page === p ? 'bg-[#0b255a] text-amber-400' : 'bg-white border text-slate-700 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {isStatusModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl border-2 border-amber-400 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#0b255a] font-serif">Update Order Status</h3>
                <span className="text-xs font-mono text-slate-500">{selectedOrder.order_id}</span>
              </div>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Select New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none bg-white font-semibold text-slate-800"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {newStatus === 'Success' && (
                <div className="bg-amber-50 text-amber-900 border border-amber-300 rounded-xl p-3 text-xs font-semibold flex items-start gap-2">
                  <Package className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Setting status to <strong>Success</strong> will automatically calculate and reduce product stock quantities from available inventory.</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                className="bg-[#0b255a] text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-amber-500 hover:text-slate-900 transition-all disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Save Status'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
