"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Lock, Mail, ShieldAlert, ArrowRight, UserCheck, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/products");
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || "Gagal login.");
    } else {
      // Login successful, redirect based on role or home
      router.refresh();
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-stone-200 shadow-xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#111827] text-[#F97316] flex items-center justify-center mx-auto mb-3 shadow-md border border-stone-800">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
            Masuk ke Akun Anda
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#374151]">
            Akses dashboard e-commerce, riwayat transaksi, dan manajemen admin
          </p>
        </div>

        {/* Quick Demo Credentials Box */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            ⚡ Akun Demo Bawaan (Klik untuk Isi Cepat):
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@fancommerce.com", "admin123")}
              className="p-2.5 rounded-xl bg-white border border-stone-200 text-left hover:border-[#F97316] transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#111827] group-hover:text-[#F97316] transition-colors">
                <Shield className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Akun Admin</span>
              </div>
              <span className="text-[10px] text-stone-400 block mt-0.5 font-mono">
                admin@fancommerce.com
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("user@fancommerce.com", "user123")}
              className="p-2.5 rounded-xl bg-white border border-stone-200 text-left hover:border-[#F97316] transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#111827] group-hover:text-[#F97316] transition-colors">
                <UserCheck className="w-3.5 h-3.5 text-stone-600 group-hover:text-[#F97316]" />
                <span>Akun Customer</span>
              </div>
              <span className="text-[10px] text-stone-400 block mt-0.5 font-mono">
                user@fancommerce.com
              </span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] text-sm text-[#374151]"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] text-sm text-[#374151]"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-[#111827] hover:bg-[#F97316] disabled:bg-stone-400 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Memverifikasi Akun...</span>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-[#374151]">
            Belum memiliki akun?{" "}
            <Link
              href="/register"
              className="text-[#F97316] hover:text-[#EA580C] font-bold hover:underline"
            >
              Daftar Akun Baru
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
