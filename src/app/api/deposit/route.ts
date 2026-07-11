import { NextResponse } from "next/server";
import { getPaymentMethods } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ methods: getPaymentMethods() });
}
