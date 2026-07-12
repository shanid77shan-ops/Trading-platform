import { NextResponse } from "next/server";
import { getSymbols, tickPrices } from "@/lib/store";
import { getAuthenticatedUserData } from "@/lib/supabase/user-data";
import { mergeWatchlist, updateUserPositionsPrices } from "@/lib/supabase/trading";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tick = searchParams.get("tick");

  const { user } = await getAuthenticatedUserData();

  if (tick === "1") {
    const { symbols } = tickPrices();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const merged = await mergeWatchlist(symbols, user.id);
    const { positions, account } = await updateUserPositionsPrices(user.id, merged);

    return NextResponse.json({
      symbols: merged,
      account,
      positions,
    });
  }

  const symbols = getSymbols();
  if (user) {
    const merged = await mergeWatchlist(symbols, user.id);
    return NextResponse.json({ symbols: merged });
  }

  return NextResponse.json({ symbols });
}
