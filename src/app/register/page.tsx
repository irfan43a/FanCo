"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Lock, Mail, User, ShieldAlert, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "admin">("customer");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await register(name, email, password, role);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || "Gagal mendaftar.");
    } else {
      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/products");
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-stone-200 shadow-xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#111827] text-[#F97316] flex items-center justify-center mx-auto mb-3 shadow-md border border-stone-800">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
            Daftar Akun Baru
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#374151]">
            Bergabunglah untuk pengalaman belanja yang cepat dan personal
          </p>
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
              Nama Lengkap
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Rian Pratama"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] text-sm text-[#374151]"
              />
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
          </div>

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
              Kata Sandi (Minimal 6 Karakter)
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] text-sm text-[#374151]"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              Tipe Akun (Pilih Role)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer text-xs font-semibold transition-all ${
                  role === "customer"
                    ? "border-[#F97316] bg-orange-50 text-[#111827] shadow-xs font-bold"
                    : "border-stone-200 text-[#374151] hover:border-stone-300"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="customer"
                  checked={role === "customer"}
                  onChange={() => setRole("customer")}
                  className="hidden"
                />
                <span>Customer (Pembeli)</span>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer text-xs font-semibold transition-all ${
                  role === "admin"
                    ? "border-[#F97316] bg-orange-50 text-[#111827] shadow-xs font-bold"
                    : "border-stone-200 text-[#374151] hover:border-stone-300"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === "admin"}
                  onChange={() => setRole("admin")}
                  className="hidden"
                />
                <span>Admin Toko</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-[#111827] hover:bg-[#F97316] disabled:bg-stone-400 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Mendaftarkan Akun...</span>
            ) : (
              <>
                <span>Buat Akun Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-[#374151]">
            Sudah memiliki akun?{" "}
            <Link
              href="/login"
              className="text-[#F97316] hover:text-[#EA580C] font-bold hover:underline"
            >
              Masuk di Sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
