'use client';

import { useState, useEffect } from 'react';
import { Ruler, Plus, Edit, Trash2, X, Lock } from 'lucide-react';
import { Unit } from '@/lib/types';

export default function AdminUnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchUnits = async () => {
    try {
      const res = await fetch('/api/units');
      const data = await res.json();
      if (data.success) setUnits(data.units || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const openAddModal = () => {
    setEditingUnit(null);
    setName('');
    setSymbol('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (unit: Unit) => {
    setEditingUnit(unit);
    setName(unit.name);
    setSymbol(unit.symbol);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !symbol.trim()) return;

    setIsSaving(true);
    setErrorMsg('');

    try {
      const method = editingUnit ? 'PUT' : 'POST';
      const res = await fetch('/api/units', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUnit?.id,
          name: name.trim(),
          symbol: symbol.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchUnits();
      } else {
        setErrorMsg(data.message || 'Failed to save unit.');
      }
    } catch (err) {
      setErrorMsg('Error saving unit.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (unit: Unit) => {
    if (unit.product_count && unit.product_count > 0) {
      alert('Cannot delete unit. Active products use this unit.');
      return;
    }

    if (!confirm(`Delete unit "${unit.name}"?`)) return;

    try {
      const res = await fetch(`/api/units?id=${unit.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchUnits();
      } else {
        alert(data.message || 'Failed to delete unit.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0b255a] font-serif">Units Management</h1>
          <p className="text-xs text-slate-500">Manage packaging units (Box, Packet, Piece, Tin, etc.)</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#0b255a] hover:bg-amber-500 hover:text-slate-900 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow transition-all"
        >
          <Plus className="w-4 h-4" /> Add Unit
        </button>
      </div>

      {/* Units Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading units...</div>
        ) : units.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No units found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900 text-white uppercase text-[11px] font-bold">
                <tr>
                  <th className="p-3 w-12">ID</th>
                  <th className="p-3">Unit Name</th>
                  <th className="p-3">Symbol</th>
                  <th className="p-3 text-center">Products Count</th>
                  <th className="p-3 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {units.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-400">{u.id}</td>
                    <td className="p-3 font-bold text-slate-800">{u.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono font-bold text-slate-700">
                        {u.symbol}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full font-mono">
                        {u.product_count || 0}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {u.product_count === 0 ? (
                          <button
                            onClick={() => handleDelete(u)}
                            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span title="Cannot delete unit used by products" className="p-1.5 text-slate-300">
                            <Lock className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl border-2 border-amber-400 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-[#0b255a] font-serif">
                {editingUnit ? 'Edit Unit' : 'Add Unit'}
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

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unit Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Box, Packet, Piece"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unit Symbol *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BOX, PKT, PCS"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none uppercase"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
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
                  {isSaving ? 'Saving...' : 'Save Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
