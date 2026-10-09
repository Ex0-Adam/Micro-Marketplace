import Link from 'next/link';
import PublicHeader from '@/components/marketplace/PublicHeader';
import ProductCard from '@/components/marketplace/ProductCard';
import { listPublicProducts } from '@/lib/product-data';
import { listPublicCategories } from '@/lib/category-data';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let products: Awaited<ReturnType<typeof listPublicProducts>> = [];
  let categories: Awaited<ReturnType<typeof listPublicCategories>> = [];
  let dbError = false;

  try {
    [products, categories] = await Promise.all([
      listPublicProducts({ featured: true }),
      listPublicCategories(),
    ]);
    if (products.length === 0) {
      products = await listPublicProducts();
    }
  } catch {
    dbError = true;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PublicHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-8 py-14 text-white shadow-xl">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-300/80">
            Micro Headless CMS ecosystem
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-5xl">
            Modules &amp; templates that extend THOTH.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Browse installable modules, full-app templates, and themes. Each listing links
            to its own repository and release so you always install from the source of truth.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/modules"
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100"
            >
              Browse modules
            </Link>
            <Link
              href="/templates"
              className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/20"
            >
              Browse templates
            </Link>
          </div>
        </section>

        {dbError && (
          <div className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-700">
            The catalogue database is not ready yet. Finish setup in{' '}
            <Link href="/setup" className="font-bold underline">
              /setup
            </Link>
            .
          </div>
        )}

        {categories.length > 0 && (
          <section className="mt-10">
            <h2 className="text-sm font-black uppercase tracking-[0.24em] text-slate-400">
              Categories
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/search?category=${category.slug}`}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-700"
                >
                  {category.name}
                  <span className="ml-2 text-xs text-slate-400">
                    {category._count.products}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-950">Latest listings</h2>
            <Link href="/search" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
              View all
            </Link>
          </div>
          {products.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
              {dbError
                ? 'No catalogue data available yet.'
                : 'No published listings yet. Add them in the admin console.'}
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
        Micro Marketplace — separate service from the THOTH CMS.
      </footer>
    </div>
  );
}
