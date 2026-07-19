import { NextResponse } from "next/server";
import { loginUser } from "@/lib/auth/users";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const result = await loginUser({ email, password });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    return NextResponse.json({ user: result.user });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Authentication service unavailable" }, { status: 503 });
  }
}
