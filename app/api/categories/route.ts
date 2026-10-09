import { NextResponse } from "next/server";
import { listPublicCategories } from "@/lib/category-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await listPublicCategories();
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json(
      { categories: [], error: "Catalogue database is not ready." },
      { status: 503 }
    );
  }
}
