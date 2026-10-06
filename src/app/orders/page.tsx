import React from "react";
import Link from "next/link";
import { Package, ChevronRight, Clock, ArrowRight, ShoppingBag } from "lucide-react";
import { getAllOrders } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Riwayat Pesanan - FanCommerce",
  description: "Daftar seluruh riwayat transaksi pesanan dirender di server dengan PostgreSQL.",
};

export default async function OrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#FAFAF9]">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <Link href="/" className="hover:text-[#F97316] transition-colors">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#111827] font-bold">
          Riwayat Pesanan (SSR)
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
            Riwayat Pesanan Pelanggan
          </h1>
          <p className="text-sm text-[#374151] mt-1">
            Data pesanan diambil dan dirender langsung secara real-time dari database.
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#111827] hover:bg-[#F97316] text-white rounded-xl text-xs font-bold self-start sm:self-auto transition-all shadow-md"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Belanja Produk Lain</span>
        </Link>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#111827]">
            Belum Ada Transaksi
          </h3>
          <p className="text-sm text-[#374151] mt-1 max-w-sm mx-auto">
            Anda belum melakukan pemesanan apa pun. Silakan jelajahi katalog dan lakukan checkout.
          </p>
          <Link
            href="/products"
            className="mt-5 inline-block px-5 py-2.5 bg-[#F97316] hover:bg-[#ea580c] text-white rounded-xl text-sm font-bold transition-colors"
          >
            Mulai Belanja Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.order_code || order.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-extrabold text-base text-[#111827]">
                    #{order.order_code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-[#F97316] border border-orange-200 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{order.status}</span>
                  </span>
                </div>

                <div className="text-xs text-stone-500 space-y-0.5">
                  <p>
                    Dipesan oleh: <strong className="text-[#111827]">{order.customer_name}</strong>
                  </p>
                  <p>Tanggal: {formatDate(order.created_at)}</p>
                  <p>Metode Pembayaran: {order.payment_method}</p>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="text-xs text-[#374151] pt-1">
                    <span className="font-bold text-[#111827]">
                      {order.items.length} Barang:
                    </span>{" "}
                    {order.items.map((it) => `${it.product_name} (${it.quantity}x)`).join(", ")}
                  </div>
                )}
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                <div className="text-right">
                  <span className="text-[11px] text-stone-400 block">Total Pembayaran</span>
                  <span className="text-lg font-extrabold text-[#F97316]">
                    {formatPrice(order.total_amount)}
                  </span>
                </div>

                <Link
                  href={`/orders/${order.order_code || order.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-[#111827] border border-stone-200 rounded-xl text-xs font-bold transition-colors"
                >
                  <span>Lihat Detail Invoice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
