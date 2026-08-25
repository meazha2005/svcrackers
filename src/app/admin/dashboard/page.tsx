'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Package, Tags, Clock, ArrowRight, Eye, Edit } from 'lucide-react';
import { Order } from '@/lib/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeProducts: 0,
    categories: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [ordersRes, prodRes, catRes] = await Promise.all([
          fetch('/api/orders?limit=10'),
          fetch('/api/products?all=true'),
          fetch('/api/categories')
        ]);

        const ordersData = await ordersRes.json();
        const prodData = await prodRes.json();
        const catData = await catRes.json();

        if (ordersData.success) {
          const ordersList: Order[] = ordersData.orders || [];
          setRecentOrders(ordersList);
          const pending = ordersList.filter(o => o.status === 'Bill Order Placed').length;
          setStats(prev => ({
            ...prev,
            totalOrders: ordersData.pagination?.totalOrders || ordersList.length,
            pendingOrders: pending
          }));
        }

        if (prodData.success) {
          const active = (prodData.products || []).filter((p: any) => p.is_active === 1).length;
          setStats(prev => ({ ...prev, activeProducts: active }));
        }

        if (catData.success) {
          setStats(prev => ({ ...prev, categories: (catData.categories || []).length }));
        }

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0b255a] font-serif">Admin Dashboard</h1>
          <p className="text-xs text-slate-500">Welcome to Sri Vinayaga Crackers Store Management</p>
        </div>
        <Link
          href="/admin/billing"
          className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs sm:text-sm px-4 py-2 rounded-xl shadow transition-transform hover:scale-105"
        >
          + Create New Bill
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Orders */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Orders</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0b255a] font-mono">{stats.totalOrders}</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Products</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">{stats.activeProducts}</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Categories</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">{stats.categories}</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Tags className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Orders</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-red-600 font-mono">{stats.pendingOrders}</span>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Recent Orders Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h2 className="text-lg font-extrabold text-[#0b255a] font-serif flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" /> Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium">Loading recent orders...</div>
        ) : recentOrders.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No orders placed yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900 text-white uppercase text-[11px] font-bold">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentOrders.map((ord) => (
                  <tr key={ord.order_id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold font-mono text-[#0b255a]">{ord.order_id}</td>
                    <td className="p-3 font-medium text-slate-800">{ord.customer_name}</td>
                    <td className="p-3 font-mono text-slate-600">{ord.customer_phone}</td>
                    <td className="p-3 text-right font-extrabold font-mono text-red-600">₹{Number(ord.total_amount).toFixed(2)}</td>
                    <td className="p-3 text-center">
                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full font-mono">
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-slate-500">
                      {new Date(ord.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-3 text-center">
                      <Link
                        href={`/invoice/${ord.order_id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
