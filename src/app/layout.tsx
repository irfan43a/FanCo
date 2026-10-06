import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "FanCommerce - E-Commerce Next.js & PostgreSQL SSR",
  description: "Platform e-commerce modern dengan Next.js App Router, integrasi PostgreSQL, dan Server-Side Rendering (SSR).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#FAFAF9] text-[#374151] font-sans selection:bg-[#F97316] selection:text-white">
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={<div className="h-16 bg-white border-b border-stone-200" />}>
              <Navbar />
            </Suspense>
            <CartDrawer />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
