import { NextResponse } from "next/server";
import { getAuthenticatedUserData } from "@/lib/supabase/user-data";
import { toggleUserWatchlist } from "@/lib/supabase/trading";

export async function POST(request: Request) {
  const { user } = await getAuthenticatedUserData();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { symbolId } = await request.json();
  if (!symbolId) {
    return NextResponse.json({ error: "symbolId required" }, { status: 400 });
  }

  const inWatchlist = await toggleUserWatchlist(user.id, symbolId);
  return NextResponse.json({ inWatchlist });
}
