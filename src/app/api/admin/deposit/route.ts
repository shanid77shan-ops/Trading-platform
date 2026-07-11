import { NextResponse } from "next/server";
import {
  addPaymentMethod,
  deletePaymentMethod,
  getAllPaymentMethods,
  updatePaymentMethod,
} from "@/lib/store";
import type { PaymentMethod } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ methods: getAllPaymentMethods() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const method = addPaymentMethod(body as Omit<PaymentMethod, "id">);
  return NextResponse.json({ method });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, ...updates } = body;
  const method = updatePaymentMethod(id, updates);
  return NextResponse.json({ method });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  deletePaymentMethod(id);
  return NextResponse.json({ success: true });
}
