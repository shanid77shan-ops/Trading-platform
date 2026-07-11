import { NextResponse } from "next/server";
import {
  getAccount,
  getPositions,
  getSettings,
  getSymbols,
  getTrades,
} from "@/lib/store";

export async function GET() {
  return NextResponse.json({
    account: getAccount(),
    symbols: getSymbols(),
    positions: getPositions(),
    trades: getTrades(),
    settings: getSettings(),
  });
}
