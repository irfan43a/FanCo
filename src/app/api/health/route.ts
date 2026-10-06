import { NextResponse } from "next/server";
import { checkDbConnection } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await checkDbConnection();
  return NextResponse.json({
    status: status.connected ? "connected" : "fallback",
    details: status.message,
    timestamp: new Date().toISOString(),
  });
}
