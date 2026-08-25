'use client';

import { ShoppingBag, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';

interface CartSummaryBarProps {
  totalItems: number;
  totalMrp: number;
  netTotal: number;
  onReset: () => void;
  onCheckout: () => void;
}

export default function CartSummaryBar({
  totalItems,
  totalMrp,
  netTotal,
  onReset,
  onCheckout
}: CartSummaryBarProps) {
  const savings = Math.max(0, totalMrp - netTotal);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 p-2 sm:p-4 bg-slate-900/95 backdrop-blur-md text-white border-t-4 border-amber-400 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Info Left */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 bg-amber-400 text-slate-900 rounded-xl font-bold shadow-md">
              <ShoppingBag className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">
                {totalItems}
              </span>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Selected Items: <span className="text-amber-300 font-bold">{totalItems}</span></div>
              <div className="text-xl sm:text-2xl font-extrabold text-amber-400 font-mono tracking-tight">
                ₹{netTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {savings > 0 && (
            <div className="hidden md:flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 text-xs px-3 py-1.5 rounded-lg border border-emerald-500/30">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>You save <strong>₹{savings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>!</span>
            </div>
          )}

          {/* Mobile Reset */}
          {totalItems > 0 && (
            <button
              onClick={onReset}
              className="sm:hidden text-xs text-slate-400 hover:text-white flex items-center gap-1 p-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* Action Right */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onReset}
            disabled={totalItems === 0}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Selection
          </button>

          <button
            onClick={onCheckout}
            disabled={totalItems === 0}
            className="w-full sm:w-auto flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-extrabold text-sm sm:text-base px-6 py-3 rounded-xl shadow-lg hover:shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}
