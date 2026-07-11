import { NextResponse } from "next/server";
import { getAccount, getUserProfile } from "@/lib/store";

export async function GET() {
  return NextResponse.json({
    account: getAccount(),
    profile: getUserProfile(),
  });
}
