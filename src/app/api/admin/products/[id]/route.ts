import { NextRequest, NextResponse } from "next/server";
import { deleteProduct } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("fc_session")?.value;
    const session = token ? verifySessionToken(token) : null;

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Khusus admin." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const deleted = await deleteProduct(Number(id));

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Produk tidak ditemukan atau gagal dihapus." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Produk berhasil dihapus." });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
