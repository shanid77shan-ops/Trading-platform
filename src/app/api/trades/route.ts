import { NextResponse } from "next/server";
import { executeTrade } from "@/lib/store";
import { getAuthenticatedUserData } from "@/lib/supabase/user-data";

export async function GET() {
  const { user } = await getAuthenticatedUserData();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    positions: [],
    trades: [],
  });
}

export async function POST(request: Request) {
  const { user } = await getAuthenticatedUserData();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { symbolId, side, lots } = body;

  if (!symbolId || !side || !lots) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const result = executeTrade(symbolId, side, lots);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
