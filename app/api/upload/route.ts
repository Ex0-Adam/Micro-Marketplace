import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardApiSession } from "@/lib/security/api-policy";
import { getStorageAdapter } from "@/lib/storage";

export const dynamic = "force-dynamic";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export async function POST(request: Request) {
  const denied = await guardApiSession();
  if (denied) return denied;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `File must be between 1 byte and ${MAX_UPLOAD_BYTES} bytes` },
      { status: 413 }
    );
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type '${file.type || "unknown"}'` },
      { status: 415 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const adapter = getStorageAdapter();
  const result = await adapter.upload({
    buffer,
    filename: file.name,
    contentType: file.type,
  });

  const media = await prisma.media.create({
    data: {
      filename: result.key,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url: result.url,
      storageProvider: result.provider,
      storageKey: result.key,
    },
  });

  return NextResponse.json({ media }, { status: 201 });
}
