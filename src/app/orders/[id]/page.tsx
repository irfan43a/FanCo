import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Truck, Package, CreditCard, ArrowLeft, Printer, ShoppingBag } from "lucide-react";
import { getOrderByIdOrCode } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderByIdOrCode(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#FAFAF9]">
      {/* Back button */}
      <div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#F97316] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Riwayat Pesanan</span>
        </Link>
      </div>

      {/* Success Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-600">
                Pesanan Berhasil Dicatat (SSR)
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827]">
                Invoice #{order.order_code}
              </h1>
              <p className="text-xs text-stone-400 mt-0.5">
                Waktu pemesanan: {formatDate(order.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-orange-50 text-[#F97316] border border-orange-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{order.status}</span>
            </span>
          </div>
        </div>

        {/* Order Status Stepper */}
        <div className="grid grid-cols-3 gap-2 py-2">
          <div className="flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-[#111827] text-white flex items-center justify-center text-xs font-bold mb-1 shadow-sm">
              ✓
            </div>
            <span className="text-xs font-bold text-[#111827]">
              Pesanan Diterima
            </span>
            <span className="text-[10px] text-stone-400">Database tercatat</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-[#F97316] flex items-center justify-center text-xs font-bold mb-1">
              2
            </div>
            <span className="text-xs font-semibold text-[#111827]">
              Konfirmasi Bayar
            </span>
            <span className="text-[10px] text-stone-400">{order.payment_method}</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center text-xs font-bold mb-1">
              3
            </div>
            <span className="text-xs font-medium text-stone-400">Pengiriman</span>
            <span className="text-[10px] text-stone-400">Kurir Express</span>
          </div>
        </div>

        {/* Info Grid: Customer & Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-stone-100 text-xs">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
            <h4 className="font-bold text-[#111827] flex items-center gap-1.5 mb-2">
              <Truck className="w-4 h-4 text-[#F97316]" />
              <span>Tujuan Pengiriman</span>
            </h4>
            <p className="font-bold text-[#111827]">
              {order.customer_name} ({order.customer_phone})
            </p>
            <p className="text-stone-500">{order.customer_email}</p>
            <p className="text-[#374151] pt-1 leading-relaxed">
              {order.shipping_address}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
            <h4 className="font-bold text-[#111827] flex items-center gap-1.5 mb-2">
              <CreditCard className="w-4 h-4 text-[#F97316]" />
              <span>Instruksi Pembayaran</span>
            </h4>
            <p className="text-stone-500">Metode:</p>
            <p className="font-bold text-[#111827]">
              {order.payment_method}
            </p>
            <div className="mt-2 pt-2 border-t border-stone-200">
              <span className="text-stone-500 text-[11px]">Total yang harus ditransfer:</span>
              <div className="text-lg font-extrabold text-[#F97316]">
                {formatPrice(order.total_amount)}
              </div>
            </div>
          </div>
        </div>

        {/* Purchased Items List */}
        <div className="pt-4 border-t border-stone-100 space-y-3">
          <h4 className="text-sm font-bold text-[#111827] flex items-center gap-2">
            <Package className="w-4 h-4 text-[#F97316]" />
            <span>Rincian Barang</span>
          </h4>

          <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white">
            {order.items && order.items.length > 0 ? (
              order.items.map((it) => (
                <div key={it.id || it.product_id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-[#111827] text-sm">
                      {it.product_name}
                    </h5>
                    <p className="text-stone-400 mt-0.5">
                      {it.quantity} unit x {formatPrice(Number(it.price))}
                    </p>
                  </div>
                  <div className="font-extrabold text-[#111827] text-sm">
                    {formatPrice(Number(it.price) * it.quantity)}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-xs text-stone-400">Tidak ada rincian item.</div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/products"
            className="px-5 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20"
          >
            Belanja Produk Lainnya
          </Link>
          <Link
            href="/orders"
            className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#111827] text-xs font-bold transition-all border border-stone-200"
          >
            Lihat Semua Pesanan
          </Link>
        </div>
      </div>
    </div>
  );
}
