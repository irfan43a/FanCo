import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ChevronRight, Star, ShieldCheck, Truck, RefreshCw, CheckCircle2, ArrowLeft } from "lucide-react";
import { getProductByIdOrSlug, getProducts } from "@/lib/db";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import AddToCartButton from "@/components/AddToCartButton";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductByIdOrSlug(id);

  if (!product) {
    return {
      title: "Produk Tidak Ditemukan - FanCommerce",
    };
  }

  return {
    title: `${product.name} - FanCommerce`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: [{ url: product.image_url }],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProductByIdOrSlug(id);

  if (!product) {
    notFound();
  }

  // Fetch related products SSR
  const relatedProducts = (
    await getProducts({ category: product.category_slug })
  ).filter((p) => p.id !== product.id).slice(0, 4);

  const discount = calculateDiscount(product.original_price, product.price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 bg-[#FAFAF9]">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <Link href="/" className="hover:text-[#F97316] transition-colors">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/products" className="hover:text-[#F97316] transition-colors">
          Katalog
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          href={`/products?category=${product.category_slug}`}
          className="hover:text-[#F97316] transition-colors capitalize font-semibold"
        >
          {product.category_name || product.category_slug}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#111827] font-bold line-clamp-1 max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Product Image */}
        <div className="lg:col-span-6">
          <div className="sticky top-24 space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-stone-200 shadow-md">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-[#F97316] text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg">
                  Diskon {discount}%
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-stone-200">
                <ShieldCheck className="w-4 h-4 text-[#F97316] shrink-0" />
                <span className="text-[11px] font-semibold text-[#374151]">
                  100% Produk Original
                </span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-stone-200">
                <Truck className="w-4 h-4 text-[#F97316] shrink-0" />
                <span className="text-[11px] font-semibold text-[#374151]">
                  Gratis Ongkos Kirim
                </span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-stone-200">
                <RefreshCw className="w-4 h-4 text-[#F97316] shrink-0" />
                <span className="text-[11px] font-semibold text-[#374151]">
                  Garansi Toko 14 Hari
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-[#F97316] border border-orange-200 capitalize">
                {product.category_name || product.category_slug}
              </span>

              <div className="flex items-center gap-1.5 text-amber-500 text-sm">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold text-[#111827]">
                  {product.rating}
                </span>
                <span className="text-stone-400">
                  ({product.review_count} ulasan pembeli)
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] leading-tight">
              {product.name}
            </h1>

            {/* Price section */}
            <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 flex items-baseline gap-3">
              <div className="text-3xl font-extrabold text-[#111827]">
                {formatPrice(product.price)}
              </div>
              {product.original_price && product.original_price > product.price && (
                <div className="text-sm text-stone-400 line-through">
                  {formatPrice(product.original_price)}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Deskripsi Produk
            </h3>
            <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Key Highlights */}
          <div className="space-y-2.5 p-4 rounded-2xl border border-stone-200 bg-white">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Keunggulan Produk
            </h4>
            <ul className="text-xs space-y-1.5 text-[#374151]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Kondisi baru dengan segel resmi distributor</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Quality Control (QC) terjamin sebelum pengemasan</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Pengemasan aman menggunakan bubble wrap tebal ganda</span>
              </li>
            </ul>
          </div>

          {/* Client Action: Add to Cart & Buy Now */}
          <AddToCartButton product={product} />
        </div>
      </div>

      {/* Related Products Section (SSR) */}
      {relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-stone-200 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#111827]">
              Produk Terkait yang Mungkin Anda Suka
            </h2>
            <Link
              href={`/products?category=${product.category_slug}`}
              className="text-xs font-bold text-[#F97316] hover:underline"
            >
              Lihat Kategori Ini
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
