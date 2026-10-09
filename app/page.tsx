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
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight text-white md:text-5xl">
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
        <div className="flex items-center justify-center gap-4">
          <p>Micro Marketplace — separate service from the THOTH CMS.</p>
          <a
            href="https://discord.gg/QfTssjfcy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-slate-500 transition hover:text-slate-900"
          >
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
            </svg>
            Discord
          </a>
        </div>
      </footer>
    </div>
  );
}
