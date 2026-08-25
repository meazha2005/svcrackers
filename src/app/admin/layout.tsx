'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Tags,
  Ruler,
  ShoppingCart,
  Receipt,
  Settings,
  LogOut,
  Store,
  Menu,
  X,
  Loader2,
  ShieldAlert
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verify authentication on mount for protected admin routes
  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsVerifying(false);
      setIsAuthenticated(true);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/session');
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.replace('/admin/login');
        }
      } catch (err) {
        setIsAuthenticated(false);
        router.replace('/admin/login');
      } finally {
        setIsVerifying(false);
      }
    }

    checkAuth();
  }, [pathname, router]);

  // Skip layout sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Show loading spinner while verifying authentication
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white font-sans">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, do not render layout content
  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.replace('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: Tags },
    { name: 'Units', href: '/admin/units', icon: Ruler },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'POS Billing', href: '/admin/billing', icon: Receipt },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#0b255a] text-white p-4 flex items-center justify-between border-b-2 border-amber-400">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white p-0.5 border border-amber-400">
            <Image src="/logo.png" alt="Sri Vinayaga Crackers" fill sizes="32px" className="object-contain" />
          </div>
          <span className="font-bold text-amber-400 font-serif text-sm">SRI VINAYAGA ADMIN</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded bg-white/10 text-amber-400"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#0b255a] text-white flex flex-col border-r-2 border-amber-400 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-amber-400/30 text-center">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white p-1 border-2 border-amber-400 mx-auto mb-2 shadow">
            <Image src="/logo.png" alt="Sri Vinayaga Crackers" fill sizes="64px" className="object-contain" />
          </div>
          <h2 className="font-extrabold text-amber-400 font-serif text-lg tracking-wide uppercase">
            SRI VINAYAGA
          </h2>
          <span className="text-[10px] font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800">
            ADMIN PANEL
          </span>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                    : 'text-slate-200 hover:bg-white/10 hover:text-amber-300'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-amber-400/30 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Store className="w-4 h-4 text-amber-400" />
            <span>View Public Store</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-900/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}
