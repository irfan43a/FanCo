import React from "react";
import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, Headphones, ShoppingBag } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#111827] text-stone-300 border-t border-stone-800">
      {/* Trust Badges */}
      <div className="border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-800 text-[#F97316] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Original</h4>
              <p className="text-xs text-stone-400">Jaminan barang asli bergaransi</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-800 text-[#F97316] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Bebas Ongkir</h4>
              <p className="text-xs text-stone-400">Pengiriman cepat ke seluruh wilayah</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-800 text-[#F97316] flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Garansi Retur</h4>
              <p className="text-xs text-stone-400">7 hari penukaran barang mudah</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-800 text-[#F97316] flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Customer Support</h4>
              <p className="text-xs text-stone-400">Layanan ramah 24/7 aktif</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#F97316] flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white">Fan<span className="text-[#F97316]">Commerce</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Platform e-commerce modern dengan arsitektur Server-Side Rendering (SSR) Next.js App Router yang terintegrasi langsung dengan database PostgreSQL.
            </p>
          </div>

          <div>
            <h5 className="text-sm font-semibold text-white mb-3">Navigasi Cepat</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Katalog Produk (SSR)
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-white transition-colors">
                  Riwayat & Status Pesanan
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-white transition-colors">
                  Checkout
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-semibold text-white mb-3">API & Developer</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/docs" className="text-[#F97316] font-bold hover:underline flex items-center gap-1.5">
                  <span>📖 Swagger UI (/docs)</span>
                </Link>
              </li>
              <li>
                <a href="/api/openapi.json" target="_blank" className="hover:text-white transition-colors">
                  OpenAPI Spec (JSON)
                </a>
              </li>
              <li>
                <a href="/api/products" target="_blank" className="hover:text-white transition-colors">
                  API: /api/products
                </a>
              </li>
              <li>
                <a href="/api/categories" target="_blank" className="hover:text-white transition-colors">
                  API: /api/categories
                </a>
              </li>
              <li>
                <a href="/api/orders" target="_blank" className="hover:text-white transition-colors">
                  API: /api/orders
                </a>
              </li>
              <li>
                <a href="/api/health" target="_blank" className="hover:text-white transition-colors">
                  API: /api/health (DB Check)
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-semibold text-white mb-3">Teknologi</h5>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-[11px] text-slate-300">
                Next.js 16 App Router
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-[11px] text-slate-300">
                React Server Components (SSR)
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-[11px] text-slate-300">
                PostgreSQL 18
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-[11px] text-slate-300">
                Tailwind CSS
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-[11px] text-slate-300">
                TypeScript
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} FanCommerce. Dibuat dengan performa tinggi & SSR.</p>
          <p>Terhubung ke PostgreSQL Database</p>
        </div>
      </div>
    </footer>
  );
}
