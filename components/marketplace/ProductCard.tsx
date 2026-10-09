import Link from 'next/link';
import type { PublicProduct } from '@/lib/product-data';

const KIND_LABEL: Record<string, string> = {
  module: 'Module',
  template: 'Template',
  theme: 'Theme',
};

function formatPrice(priceCents: number, currency: string) {
  if (priceCents <= 0) return 'Free';
  const amount = priceCents / 100;
  return `${currency} ${amount.toLocaleString('en-US')}`;
}

export default function ProductCard({ product }: { product: PublicProduct }) {
  return (
    <Link
      href={`/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg"
    >
      <div className="flex h-40 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        {product.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.coverImage}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-4xl font-black text-slate-300">
            {product.name.slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-indigo-600">
            {KIND_LABEL[product.kind] ?? product.kind}
          </span>
          {product.category && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {product.category.name}
            </span>
          )}
        </div>
        <h3 className="mt-3 text-lg font-black text-slate-950 group-hover:text-indigo-700">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
          {product.tagline ?? 'No description yet.'}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-sm font-black text-slate-900">
            {formatPrice(product.priceCents, product.currency)}
          </span>
          {product.latestVersion && (
            <span className="text-xs font-bold text-slate-400">
              v{product.latestVersion}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
