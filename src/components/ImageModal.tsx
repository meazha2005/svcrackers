'use client';

import Image from 'next/image';
import { X } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  productName: string;
  onClose: () => void;
}

export default function ImageModal({ isOpen, imageUrl, productName, onClose }: ImageModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div className="relative max-w-lg w-full bg-white rounded-2xl p-4 shadow-2xl border-2 border-amber-400" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 shadow-md transition-transform hover:scale-110"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="relative w-full h-72 sm:h-96 rounded-xl overflow-hidden bg-slate-100 mb-3 border border-slate-200">
          <Image
            src={imageUrl || '/logo.png'}
            alt={productName}
            fill
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-contain p-2"
          />
        </div>
        <h3 className="text-center font-bold text-slate-800 text-lg">{productName}</h3>
      </div>
    </div>
  );
}
