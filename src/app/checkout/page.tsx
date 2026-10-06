"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, CreditCard, ShieldCheck, Truck, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, totalItems, clearCart } = useCart();

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    shipping_address: "",
    payment_method: "Transfer Bank BCA",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMessage("Keranjang belanja Anda masih kosong.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: items.map((it) => ({
            product_id: it.product.id,
            product_name: it.product.name,
            price: it.product.price,
            quantity: it.quantity,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Gagal membuat pesanan.");
      }

      // Order created! Clear cart and route to invoice page
      clearCart();
      const orderCode = result.data.order_code || result.data.id;
      router.push(`/orders/${orderCode}`);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-[#F97316]">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-[#111827]">
          Keranjang Belanja Masih Kosong
        </h1>
        <p className="text-sm text-[#374151] mt-2 mb-6">
          Anda belum memilih produk untuk di-checkout. Silakan pilih produk terlebih dahulu.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#111827] hover:bg-[#F97316] text-white rounded-xl font-semibold text-sm transition-all shadow-md cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog Produk</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#FAFAF9]">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-stone-200">
        <div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#F97316] mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali Berbelanja</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
            Checkout & Pembayaran
          </h1>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {errorMessage}
        </div>
      )}

      {/* Grid: Form on left, Summary on right */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Customer & Shipping Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#F97316]" />
              <span>Informasi Pengiriman</span>
            </h2>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  name="customer_name"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={formData.customer_name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316] text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Email Aktif *
                  </label>
                  <input
                    type="email"
                    name="customer_email"
                    required
                    placeholder="nama@email.com"
                    value={formData.customer_email}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316] text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Nomor WhatsApp / HP *
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    required
                    placeholder="081234567890"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316] text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  Alamat Lengkap Pengiriman *
                </label>
                <textarea
                  name="shipping_address"
                  required
                  rows={3}
                  placeholder="Alamat jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota/kabupaten, dan kode pos"
                  value={formData.shipping_address}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316] text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#F97316]" />
              <span>Metode Pembayaran</span>
            </h2>

            <div className="space-y-2.5">
              {[
                { id: "Transfer Bank BCA", name: "Transfer Bank BCA (Virtual Account)" },
                { id: "Transfer Bank Mandiri", name: "Bank Mandiri Live Transfer" },
                { id: "QRIS Instant", name: "QRIS (GoPay, OVO, Dana, ShopeePay)" },
                { id: "COD (Bayar di Tempat)", name: "Cash on Delivery (COD)" },
              ].map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    formData.payment_method === method.id
                      ? "border-[#F97316] bg-orange-50/70 text-[#111827] font-bold"
                      : "border-stone-200 hover:bg-stone-50 text-[#374151] text-sm"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value={method.id}
                      checked={formData.payment_method === method.id}
                      onChange={handleChange}
                      className="text-[#F97316] focus:ring-[#F97316]"
                    />
                    <span>{method.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs sticky top-24 space-y-6">
            <h2 className="text-lg font-bold text-[#111827]">
              Ringkasan Pesanan ({totalItems} barang)
            </h2>

            <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto pr-1">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="py-3 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-[#111827] line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="text-xs text-stone-500">
                      {quantity} x {formatPrice(product.price)}
                    </p>
                  </div>
                  <div className="text-xs font-bold text-[#111827]">
                    {formatPrice(product.price * quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-stone-100 space-y-2 text-sm">
              <div className="flex justify-between text-[#374151]">
                <span>Subtotal Produk</span>
                <span className="font-semibold text-[#111827]">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-[#374151]">
                <span>Biaya Pengiriman</span>
                <span className="text-emerald-600 font-semibold">GRATIS</span>
              </div>
              <div className="flex justify-between text-[#374151]">
                <span>Biaya Layanan</span>
                <span className="text-emerald-600 font-semibold">Rp 0</span>
              </div>
              <div className="pt-3 border-t border-stone-200 flex justify-between text-base font-extrabold text-[#111827]">
                <span>Total Tagihan</span>
                <span className="text-[#F97316]">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-[#F97316] hover:bg-[#ea580c] disabled:bg-stone-300 text-white rounded-xl font-bold text-sm shadow-xl shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses Pesanan di Database...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Bayar Sekarang ({formatPrice(totalPrice)})</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-stone-400 leading-tight">
              Dengan mengklik tombol bayar, Anda menyetujui Syarat dan Ketentuan Transaksi FanCommerce.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
