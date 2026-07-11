import { NextResponse } from "next/server";
import { getAccount, updateAccount } from "@/lib/store";
import type { Account } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ account: getAccount() });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as Partial<Account>;
  const account = updateAccount(body);
  return NextResponse.json({ account });
}
