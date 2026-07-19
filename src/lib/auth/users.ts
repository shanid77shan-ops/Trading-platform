import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { createSession, type SessionUser } from "./session";

export async function registerUser(input: {
  email: string;
  password: string;
  fullName: string;
}): Promise<{ user: SessionUser } | { error: string }> {
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim() || email.split("@")[0] || "User";
  const passwordHash = await bcrypt.hash(input.password, 12);

  const existing = await sql<{ id: string }>`
    SELECT id FROM users WHERE email = ${email} LIMIT 1
  `;
  if (existing.length > 0) {
    return { error: "An account with this email already exists" };
  }

  const users = await sql<{ id: string; email: string }>`
    INSERT INTO users (email, password_hash)
    VALUES (${email}, ${passwordHash})
    RETURNING id, email
  `;
  const user = users[0];
  if (!user) return { error: "Failed to create account" };

  const accountNumber = String(Math.floor(Math.random() * 100000000)).padStart(8, "0");

  await sql`
    INSERT INTO profiles (id, full_name, username, email, avatar, verified)
    VALUES (${user.id}, ${fullName}, ${fullName}, ${email}, ${"🧑‍🚀"}, ${false})
  `;

  await sql`
    INSERT INTO trading_accounts (user_id, account_number, balance, equity, free_margin)
    VALUES (${user.id}, ${accountNumber}, ${0}, ${0}, ${0})
  `;

  const sessionUser = { id: user.id, email: user.email };
  await createSession(sessionUser);
  return { user: sessionUser };
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<{ user: SessionUser } | { error: string }> {
  const email = input.email.trim().toLowerCase();

  const rows = await sql<{ id: string; email: string; password_hash: string }>`
    SELECT id, email, password_hash
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) return { error: "Invalid email or password" };

  const valid = await bcrypt.compare(input.password, row.password_hash);
  if (!valid) return { error: "Invalid email or password" };

  const sessionUser = { id: row.id, email: row.email };
  await createSession(sessionUser);
  return { user: sessionUser };
}
