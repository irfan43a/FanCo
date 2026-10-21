"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  TrendingUp,
  PackageCheck,
  ShoppingBag,
  Users,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Clock,
  ArrowRight,
  Database,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatPrice, formatDate } from "@/lib/utils";
import { Product, Order, AdminStats } from "@/types";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading, isAdmin } = useAuth();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // New product form modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProd, setNewProd] = useState({
    name: "",
    price: "",
    category_slug: "elektronik",
    stock: "15",
    description: "",
    image_url: "",
    is_featured: false,
  });
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [seedingDb, setSeedingDb] = useState(false);

  const handleInitDatabase = async () => {
    if (!confirm("Inisialisasi tabel dan seed 50 produk ke database?")) return;
    setSeedingDb(true);
    try {
      const res = await fetch("/api/admin/db-init", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(data.message + " Total produk: " + data.total_products);
        loadAllAdminData();
      } else {
        alert(data.error || "Gagal menginisialisasi database.");
      }
    } catch {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setSeedingDb(false);
    }
  };

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const loadAllAdminData = async () => {
    setLoadingData(true);
    try {
      const [statsRes, prodRes, ordersRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/products"),
        fetch("/api/orders"),
      ]);

      const [statsData, prodData, ordersData] = await Promise.all([
        statsRes.json(),
        prodRes.json(),
        ordersRes.json(),
      ]);

      if (statsData.success) setStats(statsData.data);
      if (prodData.success) setProducts(prodData.data);
      if (ordersData.success) setOrders(ordersData.data);
    } catch (e) {
      console.error("Failed to load admin data:", e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadAllAdminData();
    }
  }, [user]);

  const handleUpdateOrderStatus = async (orderIdOrCode: string | number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderIdOrCode}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderIdOrCode || o.order_code === orderIdOrCode
              ? { ...o, status: newStatus }
              : o
          )
        );
      }
    } catch (e) {
      alert("Gagal memperbarui status pesanan.");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini dari database?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(data.error || "Gagal menghapus.");
      }
    } catch (e) {
      alert("Gagal menghapus produk.");
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProduct(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProd.name,
          price: Number(newProd.price),
          category_slug: newProd.category_slug,
          stock: Number(newProd.stock),
          description: newProd.description,
          image_url:
            newProd.image_url ||
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
          is_featured: newProd.is_featured,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setProducts((prev) => [data.data, ...prev]);
        setShowAddModal(false);
        setNewProd({
          name: "",
          price: "",
          category_slug: "elektronik",
          stock: "15",
          description: "",
          image_url: "",
          is_featured: false,
        });
      } else {
        alert(data.error || "Gagal menambahkan produk.");
      }
    } catch (e) {
      alert("Terjadi kesalahan.");
    } finally {
      setSubmittingProduct(false);
    }
  };

  if (isLoading || loadingData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#F97316] animate-spin" />
        <p className="text-sm font-semibold text-[#374151]">Memuat Dashboard Admin...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-[#111827] border border-stone-200 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4 text-[#F97316]" />
            <span>Portal Administrator Toko</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
            Dashboard Manajemen E-Commerce
          </h1>
          <p className="text-xs sm:text-sm text-[#374151] mt-1">
            Kelola stok produk, pantau pendapatan, dan perbarui status transaksi pelanggan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllAdminData}
            className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-[#374151] transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleInitDatabase}
            disabled={seedingDb}
            className="px-3.5 py-2.5 rounded-xl border border-stone-200 hover:border-[#F97316] bg-white text-[#111827] font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Inisialisasi skema tabel & seed 50 produk ke database cloud"
          >
            <Database className="w-4 h-4 text-[#F97316]" />
            <span>{seedingDb ? "Menginisialisasi..." : "Sync DB (50 Produk)"}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-[#F97316] text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Baru</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-stone-500 font-medium">Total Omset</span>
            <div className="text-lg font-bold text-[#111827]">
              {formatPrice(stats?.totalRevenue || 0)}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-stone-100 text-[#111827] flex items-center justify-center shrink-0">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-stone-500 font-medium">Total Pesanan</span>
            <div className="text-lg font-bold text-[#111827]">
              {orders.length} Transaksi
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#F97316] flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-stone-500 font-medium">Katalog Produk</span>
            <div className="text-lg font-bold text-[#111827]">
              {products.length} Barang
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-stone-500 font-medium">Akun Aktif</span>
            <div className="text-lg font-bold text-[#111827]">
              {stats?.totalCustomers || 1} Customer
            </div>
          </div>
        </div>
      </div>

      {/* Orders Management Section */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h2 className="text-lg font-bold text-[#111827]">
              Daftar Pesanan Masuk
            </h2>
            <p className="text-xs text-[#374151] mt-0.5">
              Ubah status pengiriman pesanan secara langsung
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-stone-400 py-6 text-center">Belum ada pesanan masuk.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-[#374151] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3">Kode Order</th>
                  <th className="p-3">Pelanggan</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Metode Bayar</th>
                  <th className="p-3">Status Saat Ini</th>
                  <th className="p-3">Aksi Ubah Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((o) => (
                  <tr key={o.order_code || o.id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-3 font-bold text-[#111827]">
                      <Link href={`/orders/${o.order_code || o.id}`} className="hover:text-[#F97316] transition-colors">
                        #{o.order_code}
                      </Link>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-[#111827]">
                        {o.customer_name}
                      </div>
                      <div className="text-[11px] text-stone-400">{o.customer_phone}</div>
                    </td>
                    <td className="p-3 text-[#374151]">{formatDate(o.created_at)}</td>
                    <td className="p-3 font-bold text-[#111827]">
                      {formatPrice(o.total_amount)}
                    </td>
                    <td className="p-3 text-[#374151]">{o.payment_method}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-[#111827] border border-orange-200/60">
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o.order_code || o.id!, e.target.value)}
                        className="text-xs bg-stone-100 text-[#374151] rounded-lg px-2.5 py-1.5 border border-stone-200 font-medium focus:ring-2 focus:ring-[#F97316] cursor-pointer"
                      >
                        <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
                        <option value="Diproses Penjual">Diproses Penjual</option>
                        <option value="Sedang Dikirim">Sedang Dikirim</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Dibatalkan">Dibatalkan</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Catalog Management Section */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h2 className="text-lg font-bold text-[#111827]">
              Katalog Produk Toko ({products.length} barang)
            </h2>
            <p className="text-xs text-[#374151] mt-0.5">
              Hapus atau pantau ketersediaan stok produk
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100 text-[#374151] uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Produk</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Harga</th>
                <th className="p-3">Stok</th>
                <th className="p-3">Rating</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover bg-stone-100 border border-stone-200"
                    />
                    <div>
                      <Link
                        href={`/products/${p.slug || p.id}`}
                        className="font-semibold text-[#111827] hover:text-[#F97316] transition-colors line-clamp-1"
                      >
                        {p.name}
                      </Link>
                      {p.is_featured && (
                        <span className="text-[10px] text-[#F97316] font-bold">★ Unggulan</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 capitalize text-[#374151]">
                    {p.category_slug}
                  </td>
                  <td className="p-3 font-bold text-[#111827]">
                    {formatPrice(p.price)}
                  </td>
                  <td className="p-3 font-semibold text-[#374151]">
                    {p.stock} unit
                  </td>
                  <td className="p-3 text-amber-500 font-semibold">★ {p.rating}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus Produk"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah Produk Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-[#111827]">
              Tambah Produk Baru ke Database
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  Nama Produk *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: iPad Air M2 11 Inch Wi-Fi"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-[#374151] focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Harga (IDR) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 10500000"
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-[#374151] focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Stok *
                  </label>
                  <input
                    type="number"
                    required
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-[#374151] focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  Kategori *
                </label>
                <select
                  value={newProd.category_slug}
                  onChange={(e) => setNewProd({ ...newProd, category_slug: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-[#374151] focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316]"
                >
                  <option value="elektronik">Elektronik & Gadget</option>
                  <option value="fashion">Fashion & Pakaian</option>
                  <option value="sepatu">Sepatu & Sneakers</option>
                  <option value="aksesoris">Aksesoris & Jam</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  URL Gambar (Unsplash atau Hosted)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newProd.image_url}
                  onChange={(e) => setNewProd({ ...newProd, image_url: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-[#374151] focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={3}
                  placeholder="Spesifikasi dan keunggulan barang..."
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-[#374151] focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured"
                  checked={newProd.is_featured}
                  onChange={(e) => setNewProd({ ...newProd, is_featured: e.target.checked })}
                  className="rounded text-[#F97316] focus:ring-[#F97316] accent-[#F97316]"
                />
                <label htmlFor="featured" className="text-[#374151] font-semibold cursor-pointer">
                  Tandai sebagai Produk Unggulan (Tampil di Flash Deals)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-[#374151] hover:bg-stone-100 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingProduct}
                  className="px-5 py-2.5 rounded-xl bg-[#111827] hover:bg-[#F97316] text-white font-bold transition-all shadow-md cursor-pointer"
                >
                  {submittingProduct ? "Menyimpan..." : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
