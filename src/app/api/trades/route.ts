import { NextResponse } from "next/server";
import { executeTrade, getPositions, getTrades } from "@/lib/store";

export async function GET() {
  return NextResponse.json({
    positions: getPositions(),
    trades: getTrades(),
  });
}

export async function POST(request: Request) {
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
