import { NextResponse } from "next/server";
import { tickPrices } from "@/lib/store";
import { getAuthUser } from "@/lib/supabase/user-data";
import { getFullMarketSnapshot, getLiveMarketTick } from "@/lib/supabase/trading";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isTick = searchParams.get("tick") === "1";

  if (isTick) {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { symbols } = tickPrices();
    const snapshot = await getLiveMarketTick(user.id, symbols);
    return NextResponse.json(snapshot);
  }

  const snapshot = await getFullMarketSnapshot();
  if (!snapshot) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(snapshot);
}
