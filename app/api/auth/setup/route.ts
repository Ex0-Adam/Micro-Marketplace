import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { timingSafeEqual } from "node:crypto";
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

  const expectedSetupToken = process.env.INITIAL_ADMIN_SETUP_TOKEN;
  if (!expectedSetupToken || Buffer.byteLength(expectedSetupToken) < 32) {
    return NextResponse.json(
      { error: "Initial admin setup is not configured. Set INITIAL_ADMIN_SETUP_TOKEN first." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { username, password, setupToken } = (body ?? {}) as {
    username?: unknown;
    password?: unknown;
    setupToken?: unknown;
  };

  if (
    typeof setupToken !== "string" ||
    Buffer.byteLength(setupToken) !== Buffer.byteLength(expectedSetupToken) ||
    !timingSafeEqual(Buffer.from(setupToken), Buffer.from(expectedSetupToken))
  ) {
    return NextResponse.json({ error: "Invalid setup key." }, { status: 401 });
  }

  if (typeof username !== "string" || username.trim().length < 3) {
    return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 12);
  try {
    const created = await prisma.$transaction(
      async (transaction) => {
        if (await transaction.user.count() > 0) return false;

        await transaction.user.create({
          data: {
            username: username.trim(),
            password: hash,
            role: "admin",
            mustChangePassword: true,
          },
        });
        return true;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    if (!created) {
      return NextResponse.json({ error: "Setup already completed." }, { status: 409 });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return NextResponse.json({ error: "Setup already completed." }, { status: 409 });
    }
    throw error;
  }

  return NextResponse.json({ ok: true });
}
