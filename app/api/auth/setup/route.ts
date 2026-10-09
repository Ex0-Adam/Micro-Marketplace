import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getDatabaseBootstrapStatus } from "@/lib/system/database-status";

export const dynamic = "force-dynamic";

export async function GET() {
  const bootstrap = await getDatabaseBootstrapStatus();
  return NextResponse.json({
    needsSetup: bootstrap.schemaReady && bootstrap.needsSetup,
    bootstrap,
  });
}

export async function POST(request: Request) {
  const bootstrap = await getDatabaseBootstrapStatus();

  if (!bootstrap.schemaReady) {
    return NextResponse.json(
      { error: bootstrap.message },
      { status: 503 }
    );
  }

  if (!bootstrap.needsSetup) {
    return NextResponse.json(
      { error: "Setup already completed. Sign in instead." },
      { status: 409 }
    );
  }

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

  if (typeof username !== "string" || username.trim().length < 3) {
    return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const existing = await prisma.user.count();
  if (existing > 0) {
    return NextResponse.json({ error: "Setup already completed." }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      username: username.trim(),
      password: hash,
      role: "admin",
      mustChangePassword: true,
    },
  });

  return NextResponse.json({ ok: true });
}
