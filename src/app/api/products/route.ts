import { NextRequest, NextResponse } from "next/server";
import { getProducts, createProduct } from "@/lib/db";
import { ProductFilterParams } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const q = searchParams.get("q") || undefined;
    const sort = (searchParams.get("sort") as ProductFilterParams["sort"]) || undefined;
    const featured = searchParams.has("featured")
      ? searchParams.get("featured") === "true"
      : undefined;
    const minPrice = searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined;

    const products = await getProducts({
      category,
      q,
      sort,
      featured,
      minPrice,
      maxPrice,
    });

    return NextResponse.json({
      success: true,
      total: products.length,
      data: products,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.price || !body.category_slug) {
      return NextResponse.json(
        { success: false, error: "Nama, harga, dan kategori wajib diisi." },
        { status: 400 }
      );
    }

    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") +
        "-" +
        Date.now().toString().slice(-4);

    const product = await createProduct({
      name: body.name,
      slug,
      description: body.description || "",
      price: Number(body.price),
      original_price: body.original_price ? Number(body.original_price) : null,
      stock: body.stock !== undefined ? Number(body.stock) : 10,
      category_slug: body.category_slug,
      image_url:
        body.image_url ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
      rating: body.rating ? Number(body.rating) : 5.0,
      review_count: 0,
      is_featured: Boolean(body.is_featured),
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
