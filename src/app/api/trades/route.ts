import { NextResponse } from "next/server";
import { getAuthenticatedUserData } from "@/lib/supabase/user-data";
import {
  closeUserPosition,
  executeUserTrade,
  getUserPositions,
  getUserTrades,
} from "@/lib/supabase/trading";

export async function GET() {
  const { user } = await getAuthenticatedUserData();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [positions, trades] = await Promise.all([
    getUserPositions(user.id),
    getUserTrades(user.id),
  ]);

  return NextResponse.json({ positions, trades });
}

export async function POST(request: Request) {
  const { user } = await getAuthenticatedUserData();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { symbolId, side, lots, action, positionId } = body;

  if (action === "close" && positionId) {
    const result = await closeUserPosition(user.id, positionId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  }

  if (!symbolId || !side || !lots) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const result = await executeUserTrade(user.id, symbolId, side, lots);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
