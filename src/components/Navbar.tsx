"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  Package,
  Database,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ShieldCheck,
  LogIn,
  BookOpen,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { totalItems, setIsCartOpen, notification } = useCart();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setDbStatus({
          connected: data.status === "connected",
          message: data.details,
        });
      })
      .catch(() => {
        setDbStatus({ connected: false, message: "Database offline" });
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push("/products");
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Top Banner with DB Status */}
      <div className="bg-[#111827] text-stone-300 text-xs py-1.5 px-4 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#F97316] animate-pulse"></span>
            <span>E-Commerce Modern • Next.js App Router & PostgreSQL SSR</span>
          </div>

          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-stone-400" />
            {dbStatus ? (
              <span
                className={`flex items-center gap-1 font-medium ${
                  dbStatus.connected ? "text-emerald-400" : "text-[#F97316]"
                }`}
                title={dbStatus.message}
              >
                {dbStatus.connected ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> PostgreSQL Connected
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" /> Mock Store (Postgres Ready)
                  </>
                )}
              </span>
            ) : (
              <span>Memeriksa database...</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-10 h-10 rounded-xl bg-[#111827] flex items-center justify-center text-[#F97316] shadow-md group-hover:scale-105 transition-transform border border-stone-800">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-[#111827]">
                  Fan<span className="text-[#F97316]">Commerce</span>
                </span>
                <span className="block text-[10px] uppercase font-semibold tracking-wider text-stone-400">
                  Next.js + Postgres
                </span>
              </div>
            </Link>

            {/* Search Input */}
            <form
              onSubmit={handleSearch}
              className="flex-1 max-w-lg hidden sm:flex items-center relative"
            >
              <input
                type="text"
                placeholder="Cari produk impian Anda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-stone-100 border border-transparent focus:border-[#F97316] rounded-full focus:outline-none focus:bg-white transition-all text-[#374151] placeholder-stone-400"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-1.5 px-3 py-1 bg-[#111827] hover:bg-[#F97316] text-white text-xs font-semibold rounded-full transition-colors"
              >
                Cari
              </button>
            </form>

            {/* Navigation Right Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/products"
                className="text-sm font-semibold text-[#374151] hover:text-[#F97316] transition-colors px-2 py-1"
              >
                Katalog SSR
              </Link>

              <Link
                href="/orders"
                className="flex items-center gap-1.5 text-sm font-semibold text-[#374151] hover:text-[#F97316] transition-colors px-2 py-1"
              >
                <Package className="w-4 h-4 text-stone-500" />
                <span className="hidden md:inline">Pesanan</span>
              </Link>

              <Link
                href="/docs"
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-orange-50 text-[#374151] hover:text-[#F97316] transition-colors border border-stone-200"
                title="Buka Dokumentasi Swagger API"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Swagger</span>
              </Link>

              {/* Cart Trigger Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center justify-center p-2 rounded-xl bg-stone-100 text-[#111827] hover:bg-orange-50 hover:text-[#F97316] transition-all"
                aria-label="Keranjang Belanja"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#F97316] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* User Profile / Admin / Login Button */}
              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-[#F97316] border border-orange-200 text-xs font-bold hover:bg-orange-100 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Admin</span>
                    </Link>
                  )}

                  <div className="hidden lg:flex flex-col text-right">
                    <span className="text-xs font-bold text-[#111827] line-clamp-1 max-w-[100px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-stone-400 capitalize">
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={() => logout()}
                    className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Keluar / Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#111827] hover:bg-[#F97316] text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
