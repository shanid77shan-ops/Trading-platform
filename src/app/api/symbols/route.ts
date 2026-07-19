import { NextResponse } from "next/server";
import { getSymbols, tickPrices } from "@/lib/store";
import { getAuthUser } from "@/lib/db/user-data";
import { getLiveMarketTick, mergeWatchlistSync, getUserWatchlistIds } from "@/lib/db/trading";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tick = searchParams.get("tick");

  if (tick === "1") {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { symbols } = tickPrices();
    const snapshot = await getLiveMarketTick(user.id, symbols);
    return NextResponse.json(snapshot);
  }

  const symbols = getSymbols();
  const user = await getAuthUser();
  if (user) {
    const watchlist = await getUserWatchlistIds(user.id);
    return NextResponse.json({ symbols: mergeWatchlistSync(symbols, watchlist) });
  }

  return NextResponse.json({ symbols });
}
