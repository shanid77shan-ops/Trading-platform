import { NextResponse } from "next/server";
import { getAuthenticatedUserData, mapAccount } from "@/lib/supabase/user-data";

export async function GET() {
  const { user, account } = await getAuthenticatedUserData();

  if (!user || !account) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ account: mapAccount(account) });
}
