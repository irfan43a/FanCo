import React, { Suspense } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Flame, Cpu, ShoppingBag } from "lucide-react";
import { getCategories, getProducts } from "@/lib/db";
import { ProductFilterParams } from "@/types";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
    sort?: ProductFilterParams["sort"];
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  
  // Data fetching directly in Server Component (SSR from PostgreSQL)
  const [categories, featuredProducts, allProducts] = await Promise.all([
    getCategories(),
    getProducts({ featured: true }),
    getProducts({
      category: params.category,
      q: params.q,
      sort: params.sort,
    }),
  ]);

  return (
    <div className="space-y-12 pb-16 bg-[#FAFAF9]">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-[#111827] text-white py-16 md:py-24 border-b border-stone-800">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#F97316]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-800 border border-stone-700 text-[#F97316] text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Next.js App Router • PostgreSQL 18 SSR</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
              Belanja Cerdas, <br />
              <span className="text-[#F97316]">
                Performa Kilat
              </span>
            </h1>

            <p className="text-base sm:text-lg text-stone-300 leading-relaxed max-w-xl">
              Platform e-commerce dengan Server-Side Rendering (SSR) dinamis, query database PostgreSQL instan, dan pengalaman belanja yang mulus.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/products"
                className="px-6 py-3.5 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-white font-bold text-sm shadow-xl shadow-orange-500/20 flex items-center gap-2 transition-all hover:scale-105"
              >
                <span>Jelajahi Katalog Lengkap</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#catalog"
                className="px-6 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 font-semibold text-sm transition-all"
              >
                Lihat Produk Terlaris
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Category Grid Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-[#111827]">
                Kategori Pilihan
              </h2>
              <p className="text-sm text-[#374151] mt-1">
                Temukan barang sesuai preferensi belanja Anda
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-[#F97316] hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#F97316] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#111827] group-hover:text-white transition-all">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[#111827] text-base group-hover:text-[#F97316] transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-stone-400 mt-1 line-clamp-1">
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && !params.category && !params.q && (
          <section className="bg-gradient-to-r from-orange-50 via-amber-50 to-white p-6 sm:p-8 rounded-3xl border border-orange-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F97316] text-white flex items-center justify-center shadow-md">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#111827]">
                    Produk Unggulan & Flash Deals
                  </h2>
                  <p className="text-xs sm:text-sm text-[#374151]">
                    Diskon spesial pilihan langsung dari server PostgreSQL
                  </p>
                </div>
              </div>

              <Link
                href="/products?featured=true"
                className="text-xs sm:text-sm font-bold text-[#F97316] hover:underline flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Main Catalog with SSR Filters */}
        <section id="catalog">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-200 text-[#111827] text-xs font-bold mb-2">
                <Cpu className="w-3.5 h-3.5 text-[#F97316]" />
                <span>SSR Rendered (Server-Side)</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#111827]">
                Katalog Produk Terkini
              </h2>
              <p className="text-sm text-[#374151] mt-1">
                Menampilkan {allProducts.length} produk dari database
              </p>
            </div>
          </div>

          {/* Interactive Filters */}
          <Suspense fallback={<div className="h-16 bg-white rounded-2xl animate-pulse border border-stone-200" />}>
            <ProductFilters categories={categories} />
          </Suspense>

          {/* Products Grid */}
          {allProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8">
              <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[#111827]">
                Tidak ada produk ditemukan
              </h3>
              <p className="text-sm text-[#374151] mt-1 max-w-md mx-auto">
                Coba ubah kata kunci pencarian atau pilih kategori yang berbeda.
              </p>
              <Link
                href="/"
                className="mt-5 inline-block px-5 py-2.5 bg-[#111827] hover:bg-[#F97316] text-white rounded-xl text-sm font-bold transition-colors"
              >
                Reset Semua Filter
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
