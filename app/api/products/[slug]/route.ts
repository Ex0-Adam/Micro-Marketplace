import { NextResponse } from "next/server";
import { getPublicProductBySlug } from "@/lib/product-data";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const product = await getPublicProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json(
      { error: "Catalogue database is not ready." },
      { status: 503 }
    );
  }
}
