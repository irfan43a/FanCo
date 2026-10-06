import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("fc_session")?.value;
    if (!token) {
      return NextResponse.json({ success: true, user: null });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      const response = NextResponse.json({ success: true, user: null });
      response.cookies.delete("fc_session");
      return response;
    }

    return NextResponse.json({
      success: true,
      user: {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
