import { NextResponse } from "next/server";
import { registerUser } from "@/lib/auth/users";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (String(password).length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const result = await registerUser({
      email,
      password,
      fullName,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ user: result.user });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Authentication service unavailable" }, { status: 503 });
  }
}
