"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Category } from "@/types";
import { Filter, ArrowUpDown, X } from "lucide-react";

interface ProductFiltersProps {
  categories: Category[];
}

export default function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentQ = searchParams.get("q") || "";

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const clearAllFilters = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const hasActiveFilters = Boolean(currentCategory || currentQ || currentSort !== "newest");

  return (
    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4 mb-8">
      {/* Search status & Clear button */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 text-xs">
          <div className="flex items-center gap-2 text-stone-500">
            <Filter className="w-3.5 h-3.5 text-[#F97316]" />
            <span className="font-semibold text-[#111827]">Filter Aktif:</span>
            {currentCategory && (
              <span className="bg-orange-50 text-[#F97316] font-semibold px-2.5 py-0.5 rounded-full border border-orange-200">
                Kategori: {currentCategory}
              </span>
            )}
            {currentQ && (
              <span className="bg-stone-100 text-[#374151] font-semibold px-2.5 py-0.5 rounded-full border border-stone-200">
                Kata kunci: "{currentQ}"
              </span>
            )}
          </div>
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-rose-500 hover:text-rose-600 font-semibold"
          >
            <X className="w-3 h-3" />
            Reset Filter
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => updateParam("category", null)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              !currentCategory
                ? "bg-[#111827] text-white shadow-xs"
                : "bg-stone-100 text-[#374151] hover:bg-stone-200 hover:text-[#111827]"
            }`}
          >
            Semua Produk
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam("category", cat.slug)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                currentCategory === cat.slug
                  ? "bg-[#F97316] text-white shadow-xs shadow-orange-500/20"
                  : "bg-stone-100 text-[#374151] hover:bg-stone-200 hover:text-[#111827]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <ArrowUpDown className="w-4 h-4 text-stone-400" />
          <span className="text-xs text-stone-500 font-medium whitespace-nowrap">Urutkan:</span>
          <select
            value={currentSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            disabled={isPending}
            className="text-xs bg-stone-100 text-[#374151] rounded-xl px-3 py-2 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#F97316] cursor-pointer font-semibold"
          >
            <option value="newest">Terbaru</option>
            <option value="price_asc">Harga Terendah</option>
            <option value="price_desc">Harga Tertinggi</option>
            <option value="rating">Rating Tertinggi</option>
          </select>
        </div>
      </div>
    </div>
  );
}
