export const SESSION_COOKIE = "tradehub_session";

export function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is not configured");
  }
  return new TextEncoder().encode(secret ?? "dev-secret-change-me");
}
