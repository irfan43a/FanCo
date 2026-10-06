import React, { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, Database, ShoppingBag, SlidersHorizontal } from "lucide-react";
import { getCategories, getProducts } from "@/lib/db";
import { ProductFilterParams } from "@/types";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Katalog Produk SSR - FanCommerce",
  description: "Daftar lengkap produk e-commerce dirender langsung di server dengan integrasi PostgreSQL.",
};

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
    sort?: ProductFilterParams["sort"];
    featured?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      category: params.category,
      q: params.q,
      sort: params.sort,
      featured: params.featured === "true" ? true : undefined,
    }),
  ]);

  const activeCategory = categories.find((c) => c.slug === params.category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[#FAFAF9]">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <Link href="/" className="hover:text-[#F97316] transition-colors">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#111827] font-bold">
          Katalog Produk (SSR)
        </span>
        {activeCategory && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#F97316] font-bold">
              {activeCategory.name}
            </span>
          </>
        )}
      </nav>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-[#111827] text-xs font-bold mb-2">
            <Database className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Server-Side Rendered (PostgreSQL)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
            {activeCategory ? activeCategory.name : "Koleksi Semua Produk"}
          </h1>
          <p className="text-sm text-[#374151] mt-1 max-w-xl">
            {activeCategory
              ? activeCategory.description
              : "Jelajahi berbagai pilihan produk terbaik dengan harga kompetitif dan garansi resmi."}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-[#111827] bg-stone-100 px-4 py-2 rounded-xl self-start md:self-auto border border-stone-200">
          <SlidersHorizontal className="w-4 h-4 text-[#F97316]" />
          <span>{products.length} Produk Ditemukan</span>
        </div>
      </div>

      {/* SSR Filters Component */}
      <Suspense fallback={<div className="h-16 bg-white rounded-2xl animate-pulse border border-stone-200" />}>
        <ProductFilters categories={categories} />
      </Suspense>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8">
          <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#111827]">
            Tidak ada produk yang cocok
          </h3>
          <p className="text-sm text-[#374151] mt-1 max-w-md mx-auto">
            Kriteria pencarian atau filter Anda saat ini tidak menghasilkan produk apa pun.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-block px-5 py-2.5 bg-[#111827] hover:bg-[#F97316] text-white rounded-xl text-sm font-bold transition-colors"
          >
            Hapus Semua Filter
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
