"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap, Plus, Minus, Check } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push("/checkout");
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="space-y-4 pt-4 border-t border-stone-200">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-[#111827]">
          Jumlah:
        </span>
        <div className="flex items-center border border-stone-300 rounded-xl bg-white">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1 || isOutOfStock}
            className="p-2 text-stone-600 hover:text-[#F97316] disabled:opacity-30 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center text-sm font-bold text-[#111827]">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            disabled={quantity >= product.stock || isOutOfStock}
            className="p-2 text-stone-600 hover:text-[#F97316] disabled:opacity-30 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <span className="text-xs text-stone-500">
          Tersisa <strong className="text-[#111827]">{product.stock}</strong> unit
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm transition-all shadow-xs ${
            added
              ? "bg-emerald-600 text-white"
              : isOutOfStock
              ? "bg-stone-200 text-stone-400 cursor-not-allowed"
              : "bg-white text-[#111827] hover:bg-stone-100 border border-stone-300"
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" />
              <span>Berhasil Ditambahkan!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span>Tambah ke Keranjang</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm text-white bg-[#F97316] hover:bg-[#ea580c] disabled:bg-stone-300 transition-all shadow-md shadow-orange-500/25"
        >
          <Zap className="w-4 h-4" />
          <span>Beli Sekarang</span>
        </button>
      </div>
    </div>
  );
}
