import Link from 'next/link';
import { notFound } from 'next/navigation';
import PublicHeader from '@/components/marketplace/PublicHeader';
import { getPublicProductBySlug } from '@/lib/product-data';

export const dynamic = 'force-dynamic';

const KIND_LABEL: Record<string, string> = {
  module: 'Module',
  template: 'Template',
  theme: 'Theme',
};

function formatPrice(priceCents: number, currency: string) {
  if (priceCents <= 0) return 'Free';
  return `${currency} ${(priceCents / 100).toLocaleString('en-US')}`;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product: Awaited<ReturnType<typeof getPublicProductBySlug>> = null;
  try {
    product = await getPublicProductBySlug(slug);
  } catch {
    product = null;
  }

  if (!product) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PublicHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <Link href="/modules" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
          ← Back to catalogue
        </Link>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {product.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.coverImage} alt={product.name} className="h-64 w-full object-cover" />
          )}
          <div className="p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-indigo-600">
                {KIND_LABEL[product.kind] ?? product.kind}
              </span>
              {product.category && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {product.category.name}
                </span>
              )}
              {product.latestVersion && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  v{product.latestVersion}
                </span>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
              {product.name}
            </h1>
            {product.tagline && (
              <p className="mt-2 text-lg text-slate-500">{product.tagline}</p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {product.repoUrl && (
                <a
                  href={product.repoUrl}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700"
                  target="_blank"
                  rel="noreferrer"
                >
                  Repository
                </a>
              )}
              {product.releaseUrl && (
                <a
                  href={product.releaseUrl}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
                  target="_blank"
                  rel="noreferrer"
                >
                  Latest release
                </a>
              )}
              {product.demoUrl && (
                <a
                  href={product.demoUrl}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
                  target="_blank"
                  rel="noreferrer"
                >
                  Live demo
                </a>
              )}
              {product.docsUrl && (
                <a
                  href={product.docsUrl}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
                  target="_blank"
                  rel="noreferrer"
                >
                  Docs
                </a>
              )}
            </div>

            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <dt className="text-[11px] font-black uppercase tracking-wider text-slate-400">Price</dt>
                <dd className="mt-1 text-lg font-black text-slate-900">
                  {formatPrice(product.priceCents, product.currency)}
                </dd>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <dt className="text-[11px] font-black uppercase tracking-wider text-slate-400">Requires CMS</dt>
                <dd className="mt-1 text-lg font-black text-slate-900">
                  {product.minCmsVersion ? `THOTH ${product.minCmsVersion}` : 'Any'}
                </dd>
              </div>
              {product.authorName && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <dt className="text-[11px] font-black uppercase tracking-wider text-slate-400">Author</dt>
                  <dd className="mt-1 text-sm font-bold text-slate-900">{product.authorName}</dd>
                </div>
              )}
              {product.license && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <dt className="text-[11px] font-black uppercase tracking-wider text-slate-400">License</dt>
                  <dd className="mt-1 text-sm font-bold text-slate-900">{product.license}</dd>
                </div>
              )}
            </dl>

            {product.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {product.description && (
              <div className="mt-8 border-t border-slate-100 pt-6">
                <h2 className="text-lg font-black text-slate-950">About this listing</h2>
                <div className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                  {product.description}
                </div>
              </div>
            )}

            {product.screenshots.length > 0 && (
              <div className="mt-8 border-t border-slate-100 pt-6">
                <h2 className="text-lg font-black text-slate-950">Screenshots</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {product.screenshots.map((shot) => (
                    <figure key={shot.url} className="overflow-hidden rounded-2xl border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={shot.url} alt={shot.caption ?? product.name} className="w-full object-cover" />
                      {shot.caption && (
                        <figcaption className="bg-slate-50 px-4 py-2 text-xs text-slate-500">
                          {shot.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </div>
            )}

            {product.versions.length > 0 && (
              <div className="mt-8 border-t border-slate-100 pt-6">
                <h2 className="text-lg font-black text-slate-950">Release history</h2>
                <div className="mt-4 space-y-3">
                  {product.versions.map((version) => (
                    <div
                      key={`${version.version}-${version.publishedAt.toISOString()}`}
                      className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900">v{version.version}</span>
                        <span className="text-xs text-slate-400">
                          {new Date(version.publishedAt).toLocaleDateString('en-US')}
                        </span>
                      </div>
                      {version.changelog && (
                        <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
                          {version.changelog}
                        </p>
                      )}
                      {version.releaseUrl && (
                        <a
                          href={version.releaseUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-block text-xs font-bold text-indigo-600 hover:text-indigo-700"
                        >
                          Open release →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
