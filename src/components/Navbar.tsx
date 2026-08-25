'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, Phone, Menu, X, ShieldCheck, Sparkles, MapPin, Truck } from 'lucide-react';

export default function Navbar({ onSearchChange }: { onSearchChange?: (term: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const pathname = usePathname();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearchChange) onSearchChange(val);
  };

  const navLinks = [
    { name: 'Home / Price List', href: '/' },
    { name: 'Track Order', href: '/track-order' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full shadow-lg">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-900 text-xs sm:text-sm font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-inner">
        <Sparkles className="w-4 h-4 animate-pulse text-red-700" />
        <span>Direct Factory Wholesale Price Fireworks - 100% Genuine Sivakasi Crackers!</span>
        <Sparkles className="w-4 h-4 animate-pulse text-red-700" />
      </div>

      {/* Main Navbar */}
      <nav className="bg-gradient-to-r from-[#0b255a] via-[#103073] to-[#0b255a] text-white border-b-2 border-amber-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Brand Logo & Name */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-amber-400 bg-white p-0.5 shadow-md group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/logo.png"
                  alt="SRI VINAYAGA CRACKERS"
                  fill
                  sizes="56px"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-amber-400 font-extrabold text-lg sm:text-2xl tracking-wide uppercase drop-shadow-sm font-serif">
                  SRI VINAYAGA
                </span>
                <span className="text-red-400 font-bold text-xs sm:text-sm tracking-widest uppercase flex items-center gap-1">
                  CRACKERS <span className="text-white text-[10px] font-normal px-1.5 py-0.5 bg-red-600 rounded">SIVAKASI</span>
                </span>
              </div>
            </Link>

            {/* Desktop Quick Search */}
            {pathname === '/' && (
              <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
                <input
                  type="text"
                  placeholder="Search products by name or category..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 rounded-full text-slate-800 text-sm bg-white border-2 border-amber-300 focus:outline-none focus:border-amber-500 shadow-inner"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            )}

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-amber-500 text-slate-900 shadow-md font-bold'
                        : 'text-slate-100 hover:bg-white/10 hover:text-amber-300'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-6 h-6 text-amber-400" /> : <Menu className="w-6 h-6 text-amber-400" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="lg:hidden bg-[#091d46] border-t border-amber-400/30 px-4 pt-3 pb-6 space-y-3">
            {pathname === '/' && (
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-9 pr-4 py-2 rounded-lg text-slate-800 text-sm bg-white border border-amber-300"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            )}
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-base font-semibold ${
                  pathname === link.href
                    ? 'bg-amber-500 text-slate-900 font-bold'
                    : 'text-slate-100 hover:bg-white/10'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
