'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';
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
  const [imgSrc, setImgSrc] = useState(product.image_url || '/logo.png');

  useEffect(() => {
    setImgSrc(product.image_url || '/logo.png');
  }, [product.image_url]);

  const mrp = Number(product.mrp_rate);
  const discounted = product.discounted_rate ? Number(product.discounted_rate) : mrp;
  const hasDiscount = discounted < mrp;
  const discountPercent = hasDiscount ? Math.round(((mrp - discounted) / mrp) * 100) : 0;
  const lineTotal = quantity * discounted;

  return (
    <div className={`bg-white border rounded-2xl p-4 shadow-sm transition-all space-y-3 ${quantity > 0 ? 'border-amber-400 bg-amber-50/40 ring-2 ring-amber-400/20' : 'border-slate-200'}`}>
      
      <div className="flex items-start gap-3">
        {/* Product Image */}
        <div 
          onClick={() => onImageClick(imgSrc, product.name)}
          className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-300 bg-white shrink-0 cursor-pointer p-1"
        >
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            sizes="64px"
            className="object-contain p-1"
            onError={() => setImgSrc('/logo.png')}
            unoptimized={imgSrc.startsWith('http')}
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-slate-900 text-sm leading-snug truncate">{product.name}</h3>
            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono text-slate-600 shrink-0">
              {product.unit_symbol || product.unit_name || 'BOX'}
            </span>
          </div>

          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-sm font-extrabold text-red-600 font-mono">₹{discounted.toFixed(2)}</span>
            <span className="text-xs text-slate-400 line-through font-mono">₹{mrp.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded">
                -{discountPercent}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Controls & Line Total */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-lg p-1">
          <button
            type="button"
            onClick={() => onQuantityChange(product.id, Math.max(0, quantity - 1))}
            className="w-8 h-8 flex items-center justify-center rounded bg-white text-slate-700 shadow-sm hover:bg-red-500 hover:text-white font-bold transition-colors disabled:opacity-30"
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
            className="w-12 text-center font-bold text-slate-900 text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => onQuantityChange(product.id, quantity + 1)}
            className="w-8 h-8 flex items-center justify-center rounded bg-[#0b255a] text-white shadow-sm hover:bg-amber-500 hover:text-slate-900 font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-slate-400 uppercase font-bold">Total</div>
          <div className="text-base font-extrabold text-amber-600 font-mono">
            ₹{lineTotal.toFixed(2)}
          </div>
        </div>
      </div>

    </div>
  );
}
