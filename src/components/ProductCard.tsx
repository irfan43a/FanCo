"use client";

import React from "react";
import Link from "next/link";
import { Star, ShoppingCart, Check } from "lucide-react";
import { Product } from "@/types";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = React.useState(false);
  const discount = calculateDiscount(product.original_price, product.price);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Product Image Container */}
      <Link href={`/products/${product.slug || product.id}`} className="relative aspect-square overflow-hidden bg-stone-100 block">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_featured && (
            <span className="bg-[#111827] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
              Unggulan
            </span>
          )}
          {discount > 0 && (
            <span className="bg-[#F97316] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md">
              Hemat {discount}%
            </span>
          )}
        </div>

        {/* Out of stock overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-white text-[#111827] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Habis Terjual
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span className="font-semibold text-[#F97316] capitalize">
              {product.category_name || product.category_slug}
            </span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-semibold text-[#374151]">
                {product.rating}
              </span>
              <span className="text-stone-400">({product.review_count})</span>
            </div>
          </div>

          {/* Product Title */}
          <Link
            href={`/products/${product.slug || product.id}`}
            className="block text-[#111827] font-bold text-sm sm:text-base line-clamp-2 hover:text-[#F97316] transition-colors"
          >
            {product.name}
          </Link>
        </div>

        {/* Pricing & Add to cart button */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="text-base sm:text-lg font-extrabold text-[#111827]">
              {formatPrice(product.price)}
            </div>
            {product.original_price && product.original_price > product.price && (
              <div className="text-xs text-stone-400 line-through">
                {formatPrice(product.original_price)}
              </div>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
              added
                ? "bg-emerald-600 text-white"
                : product.stock <= 0
                ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                : "bg-stone-100 text-[#111827] hover:bg-[#F97316] hover:text-white shadow-xs"
            }`}
            title="Tambah ke Keranjang"
          >
            {added ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
