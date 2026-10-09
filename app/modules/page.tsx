import PublicHeader from '@/components/marketplace/PublicHeader';
import ProductCard from '@/components/marketplace/ProductCard';
import { listPublicProducts } from '@/lib/product-data';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Modules — Micro Marketplace' };

export default async function ModulesPage() {
  let products: Awaited<ReturnType<typeof listPublicProducts>> = [];
  try {
    products = await listPublicProducts({ kind: 'module' });
  } catch {
    products = [];
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PublicHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-black tracking-tight text-slate-950">Modules</h1>
        <p className="mt-2 text-sm text-slate-500">
          Installable extensions that add data models, APIs, and admin screens to THOTH.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
        {products.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
            No published modules yet.
          </div>
        )}
      </main>
    </div>
  );
}
