'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Package, Plus, Edit, Trash2, Upload, Search, CheckCircle2, XCircle, Loader2, X } from 'lucide-react';
import { Product, Category, Unit } from '@/lib/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [unitId, setUnitId] = useState<string>('');
  const [mrpRate, setMrpRate] = useState<string>('');
  const [discountedRate, setDiscountedRate] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAllData = async () => {
    try {
      const [pRes, cRes, uRes] = await Promise.all([
        fetch('/api/products?all=true'),
        fetch('/api/categories'),
        fetch('/api/units')
      ]);
      const pData = await pRes.json();
      const cData = await cRes.json();
      const uData = await uRes.json();

      if (pData.success) setProducts(pData.products || []);
      if (cData.success) setCategories(cData.categories || []);
      if (uData.success) setUnits(uData.units || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setCategoryId(categories.length > 0 ? categories[0].id.toString() : '');
    setUnitId(units.length > 0 ? units[0].id.toString() : '');
    setMrpRate('');
    setDiscountedRate('');
    setImageUrl('');
    setIsActive(true);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description || '');
    setCategoryId(prod.category_id ? prod.category_id.toString() : '');
    setUnitId(prod.unit_id ? prod.unit_id.toString() : '');
    setMrpRate(prod.mrp_rate.toString());
    setDiscountedRate(prod.discounted_rate ? prod.discounted_rate.toString() : '');
    setImageUrl(prod.image_url || '');
    setIsActive(prod.is_active === 1);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Image File Upload via Vercel Blob
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success && data.url) {
        setImageUrl(data.url);
        setSuccessMsg('Image uploaded to Vercel Blob successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(data.message || 'Image upload failed.');
      }
    } catch (err: any) {
      setErrorMsg('Error uploading image file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mrpRate) {
      setErrorMsg('Product Name and MRP Rate are required.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    const payload = {
      id: editingProduct?.id,
      name: name.trim(),
      description: description.trim(),
      category_id: categoryId ? parseInt(categoryId) : null,
      unit_id: unitId ? parseInt(unitId) : null,
      mrp_rate: parseFloat(mrpRate),
      discounted_rate: discountedRate ? parseFloat(discountedRate) : null,
      image_url: imageUrl.trim() || null,
      is_active: isActive ? 1 : 0
    };

    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const res = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchAllData();
      } else {
        setErrorMsg(data.message || 'Failed to save product.');
      }
    } catch (err: any) {
      setErrorMsg('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deactivate/Delete this product?')) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
      } else {
        alert(data.message || 'Failed to delete product.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category_name && p.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0b255a] font-serif">Product Management</h1>
          <p className="text-xs text-slate-500">Manage fireworks products, MRP rates, discounted prices, and Vercel Blob images</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#0b255a] hover:bg-amber-500 hover:text-slate-900 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search product by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
        <span className="text-xs font-semibold text-slate-500">Total: {filteredProducts.length}</span>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900 text-white uppercase text-[11px] font-bold">
                <tr>
                  <th className="p-3 text-center w-16">Image</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-center">Unit</th>
                  <th className="p-3 text-right">MRP</th>
                  <th className="p-3 text-right">Net Rate</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className={`hover:bg-slate-50 ${p.is_active === 0 ? 'opacity-50 bg-slate-50' : ''}`}>
                    <td className="p-3 text-center">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-white mx-auto">
                        <Image src={p.image_url || '/logo.png'} alt={p.name} fill sizes="40px" className="object-contain p-0.5" />
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{p.name}</td>
                    <td className="p-3 font-medium text-slate-600">{p.category_name || 'N/A'}</td>
                    <td className="p-3 text-center font-mono text-xs">{p.unit_symbol || 'BOX'}</td>
                    <td className="p-3 text-right font-mono text-slate-400 line-through">₹{Number(p.mrp_rate).toFixed(2)}</td>
                    <td className="p-3 text-right font-extrabold font-mono text-red-600">
                      ₹{p.discounted_rate ? Number(p.discounted_rate).toFixed(2) : Number(p.mrp_rate).toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      {p.is_active === 1 ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-full">Inactive</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
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
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative max-w-lg w-full bg-white rounded-3xl p-6 shadow-2xl border-2 border-amber-400 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-[#0b255a] font-serif">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-xl border border-emerald-200">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
                  <select
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none bg-white"
                  >
                    <option value="">Select Unit</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">MRP Rate (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={mrpRate}
                    onChange={(e) => setMrpRate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discounted Rate (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountedRate}
                    onChange={(e) => setDiscountedRate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Image Upload Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Image (Vercel Blob Storage)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Blob Image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                  />
                  <label className="bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl cursor-pointer hover:bg-slate-700 flex items-center gap-1">
                    {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded"
                />
                <label htmlFor="is_active" className="text-xs font-bold text-slate-700">Product Available (Active)</label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#0b255a] text-white font-bold text-xs px-5 py-2 rounded-xl hover:bg-amber-500 hover:text-slate-900 transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
