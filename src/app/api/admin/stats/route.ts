import { NextRequest, NextResponse } from "next/server";
import { getAdminStats } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("fc_session")?.value;
    const session = token ? verifySessionToken(token) : null;

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Khusus admin." },
        { status: 403 }
      );
    }

    const stats = await getAdminStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
