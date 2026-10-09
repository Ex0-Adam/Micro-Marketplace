import Link from 'next/link';
import PublicHeader from '@/components/marketplace/PublicHeader';
import ProductCard from '@/components/marketplace/ProductCard';
import { listPublicProducts } from '@/lib/product-data';
import { listPublicCategories } from '@/lib/category-data';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Search — Micro Marketplace' };

type SearchParams = Promise<{ q?: string; category?: string; kind?: string }>;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, category, kind } = await searchParams;

  let products: Awaited<ReturnType<typeof listPublicProducts>> = [];
  let categories: Awaited<ReturnType<typeof listPublicCategories>> = [];
  try {
    [products, categories] = await Promise.all([
      listPublicProducts({ q, category, kind }),
      listPublicCategories(),
    ]);
  } catch {
    products = [];
    categories = [];
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PublicHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-black tracking-tight text-slate-950">Search</h1>

        <form method="GET" className="mt-6 flex flex-wrap gap-3">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Search modules and templates…"
            className="min-w-64 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
          />
          <select
            name="kind"
            defaultValue={kind ?? ''}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
          >
            <option value="">All kinds</option>
            <option value="module">Module</option>
            <option value="template">Template</option>
            <option value="theme">Theme</option>
          </select>
          <select
            name="category"
            defaultValue={category ?? ''}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-700"
          >
            Search
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500">
          {products.length} result{products.length === 1 ? '' : 's'}
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
            No matching listings. <Link href="/search" className="font-bold text-indigo-600">Clear filters</Link>
          </div>
        )}
      </main>
    </div>
  );
}
