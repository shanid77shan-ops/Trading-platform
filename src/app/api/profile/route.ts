import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getAuthenticatedUserData,
  mapAccount,
  mapProfile,
} from "@/lib/supabase/user-data";

export async function GET() {
  const { user, profile, account } = await getAuthenticatedUserData();

  if (!user || !profile || !account) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    profile: mapProfile(profile),
    account: mapAccount(account),
    email: profile.email || user.email || "",
  });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (body.wallet_address !== undefined) {
    await supabase
      .from("profiles")
      .update({ wallet_address: body.wallet_address })
      .eq("id", user.id);
  }

  const { profile, account } = await getAuthenticatedUserData();
  if (!profile || !account) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    profile: mapProfile(profile),
    account: mapAccount(account),
  });
}
