import { jwtVerify } from "jose";
import { getAuthSecret } from "./constants";

export interface SessionUser {
  id: string;
  email: string;
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    const userId = payload.userId;
    const email = payload.email;
    if (typeof userId !== "string" || typeof email !== "string") return null;
    return { id: userId, email };
  } catch {
    return null;
  }
}
