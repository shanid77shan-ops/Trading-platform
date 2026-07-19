import { NextResponse } from "next/server";
import { getAuthenticatedUserData, mapAccount } from "@/lib/db/user-data";
import { creditUserBalance } from "@/lib/db/trading";

export async function GET() {
  const { user, account } = await getAuthenticatedUserData();

  if (!user || !account) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ account: mapAccount(account) });
}

export async function PATCH(request: Request) {
  const { user } = await getAuthenticatedUserData();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { deposit } = body;

  if (typeof deposit !== "number" || deposit <= 0 || deposit > 10000) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const result = await creditUserBalance(user.id, deposit);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ account: result.account });
}
