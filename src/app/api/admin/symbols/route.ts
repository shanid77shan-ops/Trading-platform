import { NextResponse } from "next/server";
import {
  addSymbol,
  deleteSymbol,
  getSymbols,
  toggleWatchlist,
  updateSymbol,
} from "@/lib/store";
import type { Symbol } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ symbols: getSymbols() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const symbol = addSymbol(body as Omit<Symbol, "id">);
  return NextResponse.json({ symbol });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, action, ...updates } = body;

  if (action === "watchlist") {
    const symbol = toggleWatchlist(id);
    return NextResponse.json({ symbol });
  }

  const symbol = updateSymbol(id, updates);
  return NextResponse.json({ symbol });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  deleteSymbol(id);
  return NextResponse.json({ success: true });
}
