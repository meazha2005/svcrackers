'use client';

import Image from 'next/image';
import { Plus, Minus, Eye } from 'lucide-react';
import { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  quantity: number;
  onQuantityChange: (productId: number, newQty: number) => void;
  onImageClick: (url: string, name: string) => void;
}

export default function ProductCard({
  product,
  quantity,
  onQuantityChange,
  onImageClick
}: ProductCardProps) {
  const mrp = Number(product.mrp_rate);
  const discounted = product.discounted_rate ? Number(product.discounted_rate) : mrp;
  const hasDiscount = discounted < mrp;
  const discountPercent = hasDiscount ? Math.round(((mrp - discounted) / mrp) * 100) : 0;
  const lineTotal = quantity * discounted;

  return (
    <tr className={`border-b border-slate-200 transition-colors ${quantity > 0 ? 'bg-amber-50/70' : 'hover:bg-slate-50'}`}>
      
      {/* Image */}
      <td className="p-3 text-center w-20">
        <div 
          onClick={() => onImageClick(product.image_url || '/logo.png', product.name)}
          className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-300 bg-white cursor-pointer hover:border-amber-500 hover:scale-105 transition-all shadow-sm group mx-auto"
        >
          <Image
            src={product.image_url || '/logo.png'}
            alt={product.name}
            fill
            sizes="56px"
            className="object-contain p-1"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Eye className="w-4 h-4 text-white" />
          </div>
        </div>
      </td>

      {/* Product Name & Code/Description */}
      <td className="p-3">
        <div className="font-semibold text-slate-800 text-sm md:text-base leading-tight">
          {product.name}
        </div>
        {product.description && (
          <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{product.description}</div>
        )}
      </td>

      {/* Unit */}
      <td className="p-3 text-center font-medium text-slate-600 text-xs md:text-sm">
        <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md font-mono">
          {product.unit_symbol || product.unit_name || 'BOX'}
        </span>
      </td>

      {/* MRP Rate */}
      <td className="p-3 text-right">
        <span className="text-xs text-slate-400 line-through font-mono">
          ₹{mrp.toFixed(2)}
        </span>
        {hasDiscount && (
          <span className="ml-2 text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded">
            -{discountPercent}%
          </span>
        )}
      </td>

      {/* Net Rate */}
      <td className="p-3 text-right font-bold text-red-600 text-sm md:text-base font-mono">
        ₹{discounted.toFixed(2)}
      </td>

      {/* Quantity Selector */}
      <td className="p-3 text-center w-36">
        <div className="flex items-center justify-center gap-1 bg-white border border-slate-300 rounded-lg p-1 shadow-sm w-32 mx-auto">
          <button
            type="button"
            onClick={() => onQuantityChange(product.id, Math.max(0, quantity - 1))}
            className="w-7 h-7 flex items-center justify-center rounded bg-slate-100 text-slate-700 hover:bg-red-500 hover:text-white font-bold transition-colors disabled:opacity-30"
            disabled={quantity <= 0}
          >
            <Minus className="w-3.5 h-3.5" />
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
            className="w-10 text-center font-bold text-slate-900 text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => onQuantityChange(product.id, quantity + 1)}
            className="w-7 h-7 flex items-center justify-center rounded bg-[#0b255a] text-white hover:bg-amber-500 hover:text-slate-900 font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>

      {/* Total Amount */}
      <td className="p-3 text-right font-extrabold text-amber-600 text-base md:text-lg font-mono w-28">
        ₹{lineTotal.toFixed(2)}
      </td>
    </tr>
  );
}
