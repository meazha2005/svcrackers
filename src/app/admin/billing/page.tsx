'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Plus, Minus, Search, CheckCircle, User, Phone, MapPin, Loader2 } from 'lucide-react';
import { Product } from '@/lib/types';

export default function AdminBillingPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Cart state: { [productId]: quantity }
  const [cart, setCart] = useState<Record<number, number>>({});
  
  // Customer details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) setProducts(data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const handleQtyChange = (pId: number, qty: number) => {
    setCart(prev => {
      const copy = { ...prev };
      if (qty <= 0) delete copy[pId];
      else copy[pId] = qty;
      return copy;
    });
  };

  const selectedItems = Object.entries(cart).map(([idStr, qty]) => {
    const p = products.find(prod => prod.id === parseInt(idStr));
    if (!p || qty <= 0) return null;
    const price = p.discounted_rate ? Number(p.discounted_rate) : Number(p.mrp_rate);
    return {
      product: p,
      quantity: qty,
      price,
      total: price * qty
    };
  }).filter(Boolean);

  const grandTotal = selectedItems.reduce((sum, item) => sum + (item?.total || 0), 0);

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Customer Name and Phone are required.');
      return;
    }

    if (selectedItems.length === 0) {
      setErrorMsg('Please select at least one product.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          customer_address: customerAddress.trim() || 'Over-the-counter counter billing',
          cart
        })
      });

      const data = await res.json();
      if (data.success && data.order_id) {
        router.push(`/invoice/${data.order_id}`);
      } else {
        setErrorMsg(data.message || 'Failed to create bill');
      }
    } catch (err) {
      setErrorMsg('An error occurred while creating the bill.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category_name && p.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0b255a] font-serif">POS Manual Billing Counter</h1>
        <p className="text-xs text-slate-500">Create instore counter bills or phone order estimates directly</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Product Picker */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-7 top-7" />
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading products...</div>
            ) : (
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900 text-white uppercase text-[11px] font-bold sticky top-0">
                  <tr>
                    <th className="p-3">Product Name</th>
                    <th className="p-3 text-center">Stock</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-center w-32">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredProducts.map((p) => {
                    const price = p.discounted_rate ? Number(p.discounted_rate) : Number(p.mrp_rate);
                    const qty = cart[p.id] || 0;
                    const stock = p.stock_quantity !== undefined ? p.stock_quantity : 100;
                    const isOutOfStock = stock === 0;

                    return (
                      <tr key={p.id} className={`hover:bg-slate-50 ${qty > 0 ? 'bg-amber-50' : ''} ${isOutOfStock ? 'opacity-50 bg-slate-100' : ''}`}>
                        <td className="p-3 font-semibold text-slate-800">
                          {p.name}
                          <span className="text-[10px] text-slate-400 block font-normal">{p.category_name}</span>
                        </td>
                        <td className="p-3 text-center font-mono text-xs">
                          {isOutOfStock ? (
                            <span className="text-red-600 font-bold">Out (0)</span>
                          ) : (
                            <span className={stock < 10 ? 'text-amber-600 font-bold' : 'text-slate-600 font-semibold'}>{stock} {p.unit_symbol || 'BOX'}</span>
                          )}
                        </td>
                        <td className="p-3 text-right font-extrabold font-mono text-red-600">₹{price.toFixed(2)}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleQtyChange(p.id, Math.max(0, qty - 1))}
                              className="w-6 h-6 rounded bg-slate-100 font-bold flex items-center justify-center hover:bg-red-500 hover:text-white disabled:opacity-30"
                              disabled={qty <= 0}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-bold font-mono">{qty}</span>
                            <button
                              type="button"
                              onClick={() => handleQtyChange(p.id, Math.min(stock, qty + 1))}
                              className="w-6 h-6 rounded bg-[#0b255a] text-white font-bold flex items-center justify-center hover:bg-amber-500 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-[#0b255a]"
                              disabled={qty >= stock || isOutOfStock}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Col: Bill Summary & Customer Entry */}
        <div className="bg-white border-2 border-amber-400 rounded-3xl p-6 shadow-xl space-y-6 flex flex-col h-fit">
          <h2 className="text-lg font-extrabold text-[#0b255a] font-serif border-b pb-3">Bill Receipt Summary</h2>

          {errorMsg && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Selected Items */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {selectedItems.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No items added to bill yet.</p>
            ) : (
              selectedItems.map((item) => (
                <div key={item!.product.id} className="flex items-center justify-between text-xs text-slate-700 border-b pb-1">
                  <span className="truncate max-w-[150px]">{item!.product.name} × {item!.quantity}</span>
                  <span className="font-mono font-bold">₹{item!.total.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between font-extrabold text-base text-slate-900">
            <span>Total Payable:</span>
            <span className="text-red-600 font-mono text-xl">₹{grandTotal.toFixed(2)}</span>
          </div>

          {/* Customer Form */}
          <form onSubmit={handleCreateBill} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name *</label>
              <input
                type="text"
                required
                placeholder="Walk-in customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="Mobile number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Address / Note</label>
              <input
                type="text"
                placeholder="Address or counter notes"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || selectedItems.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-[#0b255a] hover:bg-amber-500 hover:text-slate-900 text-white font-extrabold text-sm py-3 rounded-xl shadow-lg transition-all disabled:opacity-50 mt-4"
            >
              {isSubmitting ? (
                <span>Generating Invoice...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Generate & Print Bill</span>
                </>
              )}
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
