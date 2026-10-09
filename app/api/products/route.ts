import { NextResponse } from "next/server";
import { listPublicProducts } from "@/lib/product-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const kind = searchParams.get("kind");
  const category = searchParams.get("category");
  const featured = searchParams.get("featured") === "true";

  try {
    const products = await listPublicProducts({ q, kind, category, featured });
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json(
      { products: [], error: "Catalogue database is not ready." },
      { status: 503 }
    );
  }
}
