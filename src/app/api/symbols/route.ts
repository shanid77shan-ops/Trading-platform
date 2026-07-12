import { NextResponse } from "next/server";
import { getSymbols, tickPrices } from "@/lib/store";
import {
  getAuthenticatedUserData,
  mapAccount,
} from "@/lib/supabase/user-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tick = searchParams.get("tick");

  if (tick === "1") {
    const { symbols } = tickPrices();
    const { account } = await getAuthenticatedUserData();

    return NextResponse.json({
      symbols,
      account: account ? mapAccount(account) : null,
      positions: [],
    });
  }

  return NextResponse.json({ symbols: getSymbols() });
}
