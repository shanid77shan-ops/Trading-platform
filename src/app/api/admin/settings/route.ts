import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/store";
import type { PlatformSettings } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ settings: getSettings() });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as Partial<PlatformSettings>;
  const settings = updateSettings(body);
  return NextResponse.json({ settings });
}
