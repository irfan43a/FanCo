import { NextRequest, NextResponse } from "next/server";
import { getAllOrders, createOrder } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const orders = await getAllOrders();
    return NextResponse.json({ success: true, data: orders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      payment_method,
      items,
    } = body;

    if (!customer_name || !customer_email || !customer_phone || !shipping_address) {
      return NextResponse.json(
        { success: false, error: "Semua data pelanggan dan alamat wajib diisi." },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Keranjang belanja tidak boleh kosong." },
        { status: 400 }
      );
    }

    // Calculate total amount
    const total_amount = items.reduce(
      (sum: number, it: { price: number; quantity: number }) =>
        sum + Number(it.price) * Number(it.quantity),
      0
    );

    const order = await createOrder(
      {
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        total_amount,
        payment_method: payment_method || "Transfer Bank BCA",
      },
      items
    );

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
