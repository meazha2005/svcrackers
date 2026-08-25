'use client';

import Image from 'next/image';
import { Plus, Minus, Eye } from 'lucide-react';
import { Product } from '@/lib/types';

interface MobileProductCardProps {
  product: Product;
  quantity: number;
  onQuantityChange: (productId: number, newQty: number) => void;
  onImageClick: (url: string, name: string) => void;
}

export default function MobileProductCard({
  product,
  quantity,
  onQuantityChange,
  onImageClick
}: MobileProductCardProps) {
  const mrp = Number(product.mrp_rate);
  const discounted = product.discounted_rate ? Number(product.discounted_rate) : mrp;
  const hasDiscount = discounted < mrp;
  const discountPercent = hasDiscount ? Math.round(((mrp - discounted) / mrp) * 100) : 0;
  const lineTotal = quantity * discounted;

  return (
    <div className={`p-3 rounded-xl border-2 transition-all shadow-sm ${
      quantity > 0 
        ? 'bg-amber-50/80 border-amber-400' 
        : 'bg-white border-slate-200 hover:border-slate-300'
    }`}>
      <div className="flex items-start gap-3">
        
        {/* Product Image */}
        <div 
          onClick={() => onImageClick(product.image_url || '/logo.png', product.name)}
          className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 cursor-pointer shadow-sm active:scale-95 transition-transform"
        >
          <Image
            src={product.image_url || '/logo.png'}
            alt={product.name}
            fill
            sizes="64px"
            className="object-contain p-1"
          />
        </div>

        {/* Product Title & Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">
              {product.name}
            </h4>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded">
              {product.unit_symbol || product.unit_name || 'BOX'}
            </span>
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-extrabold text-red-600 text-base font-mono">
              ₹{discounted.toFixed(2)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xs text-slate-400 line-through font-mono">
                  ₹{mrp.toFixed(2)}
                </span>
                <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Controls & Line Total */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
        <div className="text-xs text-slate-500 font-medium">
          Total: <span className="font-extrabold text-amber-600 text-sm font-mono">₹{lineTotal.toFixed(2)}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg p-1 shadow-sm">
          <button
            type="button"
            onClick={() => onQuantityChange(product.id, Math.max(0, quantity - 1))}
            className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-100 text-slate-800 active:bg-red-500 active:text-white font-bold transition-colors disabled:opacity-30"
            disabled={quantity <= 0}
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            min="0"
            value={quantity === 0 ? '' : quantity}
            placeholder="0"
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              onQuantityChange(product.id, Math.max(0, val));
            }}
            className="w-10 text-center font-bold text-slate-900 text-base focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => onQuantityChange(product.id, quantity + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-md bg-[#0b255a] text-white active:bg-amber-500 active:text-slate-900 font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
