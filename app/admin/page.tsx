import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { getAdminDashboardData } from '@/lib/admin-dashboard-data';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await requireAuth();
  const { productCount, publishedCount, categoryCount, mediaCount, latestProducts } =
    await getAdminDashboardData();

  const stats = [
    { label: 'Listings', value: productCount, href: '/admin/products', tone: 'from-cyan-400 via-sky-500 to-indigo-500' },
    { label: 'Published', value: publishedCount, href: '/admin/products', tone: 'from-emerald-400 via-teal-500 to-cyan-500' },
    { label: 'Categories', value: categoryCount, href: '/admin/categories', tone: 'from-fuchsia-400 via-pink-500 to-rose-500' },
    { label: 'Media', value: mediaCount, href: '/admin/media', tone: 'from-amber-400 via-orange-500 to-rose-500' },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-transparent">
      <header className="border-b border-white/30 bg-white/55 px-8 py-6 backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.32em] text-indigo-500">Marketplace console</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Catalogue Overview</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Manage the listings that THOTH instances browse to discover modules and templates.
        </p>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <Link
                key={stat.label}
                href={stat.href}
                className="group overflow-hidden rounded-[1.75rem] border border-white/35 bg-white/70 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-1"
              >
                <div className={`h-1.5 bg-gradient-to-r ${stat.tone}`} />
                <div className="p-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">{stat.label}</p>
                  <p className="mt-3 text-4xl font-black tracking-tight text-slate-950">{stat.value}</p>
                </div>
              </Link>
            ))}
          </section>

          <section className="rounded-[2rem] border border-white/35 bg-white/72 p-6 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-slate-950">Recent listings</h2>
              <Link href="/admin/products" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
                Manage products
              </Link>
            </div>
            <div className="mt-6 space-y-3">
              {latestProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 px-4 py-6 text-sm text-slate-500">
                  No listings yet. Use the Products module to publish the first item.
                </div>
              ) : (
                latestProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between rounded-2xl border border-white/30 bg-white/55 px-4 py-3">
                    <div>
                      <p className="font-bold text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500">
                        {product.kind} • /{product.slug} • updated {new Date(product.updatedAt).toLocaleString('en-US')}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${product.isPublished ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {product.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
