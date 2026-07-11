import { NextResponse } from "next/server";
import { getSymbols, tickPrices } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tick = searchParams.get("tick");

  if (tick === "1") {
    const data = tickPrices();
    return NextResponse.json(data);
  }

  return NextResponse.json({ symbols: getSymbols() });
}
