'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import MobileProductCard from '@/components/MobileProductCard';
import CartSummaryBar from '@/components/CartSummaryBar';
import CheckoutModal from '@/components/CheckoutModal';
import ImageModal from '@/components/ImageModal';
import { Product, Category } from '@/lib/types';
import { Sparkles, Download, Phone, ShieldCheck, Flame, ShoppingCart, Tag } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  
  // Cart state: { [productId]: quantity }
  const [cart, setCart] = useState<Record<number, number>>({});
  
  // Modals state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [imageModalData, setImageModalData] = useState<{ open: boolean; url: string; name: string }>({
    open: false,
    url: '',
    name: ''
  });

  // Fetch products and categories on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ]);
        const prodData = await prodRes.json();
        const catData = await catRes.json();

        if (prodData.success) setProducts(prodData.products || []);
        if (catData.success) setCategories(catData.categories || []);
      } catch (err) {
        console.error('Error loading store data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleQuantityChange = (productId: number, newQty: number) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (newQty <= 0) {
        delete updated[productId];
      } else {
        updated[productId] = newQty;
      }
      return updated;
    });
  };

  const handleResetCart = () => {
    if (Object.keys(cart).length === 0) return;
    if (confirm('Clear all selected items from your estimate?')) {
      setCart({});
    }
  };

  // Filter products based on search term & selected category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category_name && product.category_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory =
      selectedCategory === 'ALL' ||
      product.category_name === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Group products by category name
  const groupedProducts: Record<string, Product[]> = {};
  filteredProducts.forEach((p) => {
    const catName = p.category_name || 'General Crackers';
    if (!groupedProducts[catName]) {
      groupedProducts[catName] = [];
    }
    groupedProducts[catName].push(p);
  });

  // Calculate totals
  let totalItemsCount = 0;
  let totalMrpSum = 0;
  let netTotalSum = 0;

  Object.entries(cart).forEach(([idStr, qty]) => {
    const pId = parseInt(idStr);
    const prod = products.find((p) => p.id === pId);
    if (prod && qty > 0) {
      totalItemsCount += qty;
      const mrp = Number(prod.mrp_rate);
      const discounted = prod.discounted_rate ? Number(prod.discounted_rate) : mrp;
      totalMrpSum += mrp * qty;
      netTotalSum += discounted * qty;
    }
  });

  const totalSaved = Math.max(0, totalMrpSum - netTotalSum);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans">
      {/* Top Navigation Bar */}
      <Navbar onSearchChange={setSearchTerm} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-6 pb-12">
        
        {/* Banner Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0b255a] via-[#10347c] to-[#0b255a] text-white p-6 sm:p-10 shadow-xl border-2 border-amber-400 mb-6">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-slate-900 uppercase tracking-widest mb-3 shadow">
              <Sparkles className="w-3.5 h-3.5 text-red-600" /> SIVAKASI DIRECT WHOLESALE 2026
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight text-white leading-tight">
              SRI VINAYAGA CRACKERS
            </h1>
            <p className="mt-2 text-slate-200 text-xs sm:text-base leading-relaxed">
              Order genuine Sivakasi fireworks at factory discount rates. Quick price estimation, instant PDF bill generation, and fast delivery!
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="https://wa.me/919566383227"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow transition-transform hover:scale-105"
              >
                <Phone className="w-4 h-4" /> WhatsApp Quick Order
              </a>
            </div>
          </div>

          <div className="absolute right-4 bottom-4 opacity-10 sm:opacity-25 pointer-events-none">
            <Flame className="w-48 h-48 text-amber-400" />
          </div>
        </div>

        {/* Live Estimate Summary Cards Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm text-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Selected Items</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0b255a] font-mono">{totalItemsCount}</span>
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm text-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Original Price</span>
            <span className="text-xl sm:text-2xl font-bold text-slate-400 line-through font-mono">
              ₹{totalMrpSum.toFixed(2)}
            </span>
          </div>

          <div className="bg-white border-2 border-emerald-300 bg-emerald-50/50 rounded-2xl p-4 shadow-sm text-center">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">Total Savings</span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 font-mono">
              ₹{totalSaved.toFixed(2)}
            </span>
          </div>

          <div className="bg-gradient-to-br from-amber-400 to-amber-500 border-2 border-amber-300 rounded-2xl p-4 shadow-md text-center text-slate-900">
            <span className="text-xs font-extrabold uppercase tracking-wider block text-slate-800">Net Estimated Total</span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-950">
              ₹{netTotalSum.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Category Tabs / Filters */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-[#0b255a] text-amber-400 shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Categories ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.name
                    ? 'bg-[#0b255a] text-amber-400 shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-600 font-semibold">Loading product catalog...</p>
          </div>
        ) : Object.keys(groupedProducts).length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <Tag className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No Products Found</h3>
            <p className="text-xs text-slate-500">Try adjusting your search criteria or category filter.</p>
          </div>
        ) : (
          /* Products List Grouped By Category */
          <div className="space-y-8">
            {Object.entries(groupedProducts)
              .sort(([catA], [catB]) => {
                const numA = parseInt(catA) || 0;
                const numB = parseInt(catB) || 0;
                if (numA !== numB) return numA - numB;
                return catA.localeCompare(catB, undefined, { numeric: true });
              })
              .map(([categoryName, catProducts]) => (
              <div key={categoryName} className="space-y-3">
                
                {/* Category Header */}
                <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-slate-950 px-4 py-2.5 rounded-2xl font-serif font-extrabold text-base sm:text-lg flex items-center justify-between shadow-sm border border-amber-300">
                  <span className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-red-700" />
                    {categoryName}
                  </span>
                  <span className="text-xs bg-slate-900/10 px-2.5 py-1 rounded-full font-sans font-bold">
                    {catProducts.length} Products
                  </span>
                </div>

                {/* Desktop View Table */}
                <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                        <th className="p-3 text-center w-20">Image</th>
                        <th className="p-3">Product Name</th>
                        <th className="p-3 text-center">Unit</th>
                        <th className="p-3 text-right">MRP Rate</th>
                        <th className="p-3 text-right">Net Price</th>
                        <th className="p-3 text-center w-36">Quantity</th>
                        <th className="p-3 text-right w-28">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {catProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          quantity={cart[product.id] || 0}
                          onQuantityChange={handleQuantityChange}
                          onImageClick={(url, name) => setImageModalData({ open: true, url, name })}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Compact List */}
                <div className="md:hidden grid grid-cols-1 gap-2.5">
                  {catProducts.map((product) => (
                    <MobileProductCard
                      key={product.id}
                      product={product}
                      quantity={cart[product.id] || 0}
                      onQuantityChange={handleQuantityChange}
                      onImageClick={(url, name) => setImageModalData({ open: true, url, name })}
                    />
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}

      </main>

      {/* Floating Bottom Cart Bar */}
      <CartSummaryBar
        totalItems={totalItemsCount}
        totalMrp={totalMrpSum}
        netTotal={netTotalSum}
        onReset={handleResetCart}
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        products={products}
        onOrderSuccess={() => setCart({})}
      />

      {/* Product Image Fullscreen Modal */}
      <ImageModal
        isOpen={imageModalData.open}
        imageUrl={imageModalData.url}
        productName={imageModalData.name}
        onClose={() => setImageModalData({ open: false, url: '', name: '' })}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
