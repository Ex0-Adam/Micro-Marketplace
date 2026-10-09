import { NextResponse } from "next/server";
import { login } from "@/lib/auth";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { username, password } = (body ?? {}) as {
    username?: unknown;
    password?: unknown;
  };

  if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  try {
    const result = await login(username, password);
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
}
