'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingCart, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Printer, 
  CheckCircle, 
  Clock, 
  X, 
  Package, 
  Plus, 
  Minus, 
  Loader2, 
  AlertTriangle 
} from 'lucide-react';
import { Order, OrderItem, Product } from '@/lib/types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Status Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit Order Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerPhone, setEditCustomerPhone] = useState('');
  const [editCustomerAddress, setEditCustomerAddress] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editItems, setEditItems] = useState<OrderItem[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedNewProductId, setSelectedNewProductId] = useState('');
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editErrorMsg, setEditErrorMsg] = useState('');

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

  // Open Edit Order Modal
  const openEditModal = async (ord: Order) => {
    setEditingOrder(ord);
    setEditCustomerName(ord.customer_name);
    setEditCustomerPhone(ord.customer_phone);
    setEditCustomerAddress(ord.customer_address || '');
    setEditStatus(ord.status);
    setEditItems([]);
    setSelectedNewProductId('');
    setEditErrorMsg('');
    setIsEditModalOpen(true);
    setIsLoadingOrderDetails(true);

    try {
      const res = await fetch(`/api/orders/${ord.order_id}`);
      const data = await res.json();
      if (data.success && data.order) {
        setEditCustomerName(data.order.customer_name);
        setEditCustomerPhone(data.order.customer_phone);
        setEditCustomerAddress(data.order.customer_address || '');
        setEditStatus(data.order.status);
        setEditItems(data.order.items || []);
      }

      // Fetch products if not cached
      if (availableProducts.length === 0) {
        const pRes = await fetch('/api/products?all=true');
        const pData = await pRes.json();
        if (pData.success) {
          setAvailableProducts(pData.products || []);
        }
      }
    } catch (err) {
      console.error(err);
      setEditErrorMsg('Failed to load order details');
    } finally {
      setIsLoadingOrderDetails(false);
    }
  };

  // Item quantity adjustment in Edit Modal
  const handleItemQtyChange = (index: number, newQty: number) => {
    setEditItems(prev => {
      const updated = [...prev];
      if (newQty <= 0) {
        updated.splice(index, 1);
      } else {
        const item = { ...updated[index] };
        item.quantity = newQty;
        item.total_price = newQty * Number(item.unit_price);
        updated[index] = item;
      }
      return updated;
    });
  };

  // Item price adjustment in Edit Modal
  const handleItemPriceChange = (index: number, newPrice: number) => {
    setEditItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index] };
      item.unit_price = Math.max(0, newPrice);
      item.total_price = Number(item.quantity) * item.unit_price;
      updated[index] = item;
      return updated;
    });
  };

  // Remove item in Edit Modal
  const handleRemoveItem = (index: number) => {
    setEditItems(prev => prev.filter((_, i) => i !== index));
  };

  // Add new product into current order in Edit Modal
  const handleAddNewProductToOrder = () => {
    if (!selectedNewProductId) return;
    const prodId = parseInt(selectedNewProductId);
    const prod = availableProducts.find(p => p.id === prodId);
    if (!prod) return;

    setEditItems(prev => {
      const existingIndex = prev.findIndex(item => item.product_id === prod.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const item = { ...updated[existingIndex] };
        item.quantity = Number(item.quantity) + 1;
        item.total_price = item.quantity * Number(item.unit_price);
        updated[existingIndex] = item;
        return updated;
      } else {
        const price = prod.discounted_rate ? Number(prod.discounted_rate) : Number(prod.mrp_rate);
        return [
          ...prev,
          {
            product_id: prod.id,
            product_name: prod.name,
            quantity: 1,
            unit_price: price,
            total_price: price,
            unit_symbol: prod.unit_symbol
          }
        ];
      }
    });

    setSelectedNewProductId('');
  };

  // Save changes from Edit Modal
  const handleSaveEditedOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    if (!editCustomerName.trim() || !editCustomerPhone.trim()) {
      setEditErrorMsg('Customer name and phone number are required.');
      return;
    }

    if (editItems.length === 0) {
      setEditErrorMsg('An order must have at least 1 product item.');
      return;
    }

    setIsSavingEdit(true);
    setEditErrorMsg('');

    try {
      const payload = {
        customer_name: editCustomerName.trim(),
        customer_phone: editCustomerPhone.trim(),
        customer_address: editCustomerAddress.trim(),
        status: editStatus,
        items: editItems.map(it => ({
          product_id: it.product_id,
          product_name: it.product_name,
          quantity: parseInt(it.quantity as any) || 1,
          unit_price: parseFloat(it.unit_price as any) || 0
        }))
      };

      const res = await fetch(`/api/orders/${editingOrder.order_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setIsEditModalOpen(false);
        fetchOrders();
      } else {
        setEditErrorMsg(data.message || 'Failed to save changes.');
      }
    } catch (err: any) {
      setEditErrorMsg('An error occurred while saving the order.');
    } finally {
      setIsSavingEdit(false);
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

  // Live total calculation for Edit Modal
  const editGrandTotal = editItems.reduce(
    (sum, it) => sum + (Number(it.unit_price) * Number(it.quantity)), 
    0
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0b255a] font-serif">Orders Management</h1>
          <p className="text-xs text-slate-500">View, update status, edit items, print invoice, and manage customer cracker orders</p>
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
                  <th className="p-3 text-center w-40">Actions</th>
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
                        <Link
                          href={`/invoice/${ord.order_id}`}
                          target="_blank"
                          title="Print Bill Invoice"
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEditModal(ord)}
                          title="Edit Order"
                          className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openStatusModal(ord)}
                          title="Update Status"
                          className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(ord.order_id)}
                          title="Delete Order"
                          className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
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

      {/* Edit Order Modal */}
      {isEditModalOpen && editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative max-w-3xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-400 space-y-5 my-auto max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-xl font-bold text-[#0b255a] font-serif flex items-center gap-2">
                  <Edit className="w-5 h-5 text-amber-600" /> Edit Order
                </h3>
                <span className="text-xs font-mono text-slate-500 font-bold">
                  Order ID: <span className="text-slate-800">{editingOrder.order_id}</span>
                </span>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Error Message */}
            {editErrorMsg && (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{editErrorMsg}</span>
              </div>
            )}

            {isLoadingOrderDetails ? (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
                <p className="text-sm font-semibold">Loading order items and details...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveEditedOrder} className="space-y-5">
                
                {/* Customer Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={editCustomerName}
                      onChange={(e) => setEditCustomerName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Customer Phone *</label>
                    <input
                      type="text"
                      required
                      value={editCustomerPhone}
                      onChange={(e) => setEditCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Order Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none bg-white font-semibold text-slate-800"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Address</label>
                    <textarea
                      rows={2}
                      value={editCustomerAddress}
                      onChange={(e) => setEditCustomerAddress(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none bg-white resize-none"
                    />
                  </div>
                </div>

                {/* Status Notice if Success */}
                {editStatus === 'Success' && (
                  <div className="bg-amber-50 text-amber-900 border border-amber-300 rounded-xl p-3 text-xs font-semibold flex items-start gap-2">
                    <Package className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Status is set to <strong>Success</strong>. Saving will calculate and adjust inventory stock quantities automatically.</span>
                  </div>
                )}

                {/* Order Items Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Order Products ({editItems.length})
                    </h4>
                    <span className="text-xs text-slate-500">Edit quantities, rates, or remove items</span>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold">
                        <tr>
                          <th className="p-2.5">Product Name</th>
                          <th className="p-2.5 text-right w-28">Rate (₹)</th>
                          <th className="p-2.5 text-center w-36">Quantity</th>
                          <th className="p-2.5 text-right w-28">Total (₹)</th>
                          <th className="p-2.5 text-center w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {editItems.map((item, idx) => (
                          <tr key={item.product_id || idx} className="hover:bg-slate-50">
                            <td className="p-2.5 font-semibold text-slate-800">
                              {item.product_name}
                              {item.unit_symbol && (
                                <span className="ml-1.5 px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-mono">
                                  {item.unit_symbol}
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.unit_price}
                                onChange={(e) => handleItemPriceChange(idx, parseFloat(e.target.value) || 0)}
                                className="w-24 px-2 py-1 text-right text-xs font-mono font-bold border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-amber-400"
                              />
                            </td>
                            <td className="p-2.5 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleItemQtyChange(idx, Number(item.quantity) - 1)}
                                  className="w-6 h-6 rounded bg-slate-100 font-bold flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleItemQtyChange(idx, parseInt(e.target.value) || 1)}
                                  className="w-12 text-center font-bold font-mono text-xs border border-slate-300 rounded py-1 outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleItemQtyChange(idx, Number(item.quantity) + 1)}
                                  className="w-6 h-6 rounded bg-[#0b255a] text-white font-bold flex items-center justify-center hover:bg-amber-500 hover:text-slate-900 transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            <td className="p-2.5 text-right font-extrabold font-mono text-red-600">
                              ₹{(Number(item.quantity) * Number(item.unit_price)).toFixed(2)}
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove item from order"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Product Selector */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <select
                      value={selectedNewProductId}
                      onChange={(e) => setSelectedNewProductId(e.target.value)}
                      className="flex-1 w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl outline-none bg-white font-medium"
                    >
                      <option value="">-- Add another product to this order --</option>
                      {availableProducts.map(p => {
                        const price = p.discounted_rate ? Number(p.discounted_rate) : Number(p.mrp_rate);
                        return (
                          <option key={p.id} value={p.id}>
                            {p.name} — ₹{price.toFixed(2)} ({p.unit_symbol || 'BOX'})
                          </option>
                        );
                      })}
                    </select>

                    <button
                      type="button"
                      onClick={handleAddNewProductToOrder}
                      disabled={!selectedNewProductId}
                      className="w-full sm:w-auto px-4 py-2 bg-[#0b255a] hover:bg-amber-500 hover:text-slate-900 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Item
                    </button>
                  </div>
                </div>

                {/* Grand Total Summary Bar */}
                <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl">
                  <div>
                    <span className="text-xs text-slate-400 block uppercase font-bold">Total Items in Order</span>
                    <span className="text-base font-bold font-mono text-amber-400">
                      {editItems.reduce((sum, it) => sum + Number(it.quantity), 0)} items
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block uppercase font-bold">Updated Net Total</span>
                    <span className="text-2xl font-extrabold font-mono text-amber-400">
                      ₹{editGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Modal Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="bg-[#0b255a] text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-amber-500 hover:text-slate-900 transition-all disabled:opacity-50 flex items-center gap-1.5 shadow"
                  >
                    {isSavingEdit ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Order...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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
