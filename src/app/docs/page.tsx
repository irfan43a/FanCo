import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Download, ShieldCheck, Terminal, Database } from "lucide-react";
import SwaggerUIComponent from "@/components/SwaggerUIComponent";

export const metadata = {
  title: "API Documentation (Swagger) - FanCommerce",
  description: "Dokumentasi interaktif REST API FanCommerce dengan OpenAPI 3.0 dan Swagger UI",
};

export default function ApiDocsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-[#F97316] mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda Toko</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#111827] text-[#F97316] flex items-center justify-center shadow-md border border-stone-800">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
                Dokumentasi REST API (Swagger)
              </h1>
              <p className="text-xs sm:text-sm text-[#374151]">
                Spesifikasi OpenAPI 3.0 & Swagger UI Interaktif FanCommerce
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/openapi.json"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:border-[#F97316] text-[#111827] text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-[#F97316]" />
            <span>OpenAPI Spec JSON</span>
          </a>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111827] hover:bg-[#F97316] text-white text-xs font-bold shadow-md transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Login Akun Test</span>
          </Link>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 flex items-start gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-orange-50 text-[#F97316] flex items-center justify-center shrink-0">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#111827]">Try It Out Langsung</h4>
            <p className="text-[11px] text-[#374151] mt-0.5">
              Klik tombol <strong>Try it out</strong> pada setiap endpoint di bawah untuk mengirim request langsung ke server.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 flex items-start gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#111827]">Autentikasi & Cookie</h4>
            <p className="text-[11px] text-[#374151] mt-0.5">
              Endpoint admin membutuhkan cookie <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-[10px]">fc_session</code>. Login terlebih dahulu via endpoint <strong>/api/auth/login</strong>.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 flex items-start gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-stone-100 text-[#111827] flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#111827]">Integrasi Database</h4>
            <p className="text-[11px] text-[#374151] mt-0.5">
              Mendukung PostgreSQL lokal dengan fallback otomatis ke In-Memory mock store jika koneksi database belum aktif.
            </p>
          </div>
        </div>
      </div>

      {/* Swagger UI Interactive Component */}
      <SwaggerUIComponent />
    </div>
  );
}
