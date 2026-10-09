'use client';

import { useCallback, useEffect, useState } from 'react';

type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  kind: string;
  priceCents: number;
  currency: string;
  isPublished: boolean;
  isFeatured: boolean;
  category: { id: string; name: string } | null;
  _count: { versions: number; screenshots: number };
};

type Category = { id: string; name: string };

type FormState = {
  id?: string;
  name: string;
  slug: string;
  kind: string;
  tagline: string;
  description: string;
  priceCents: string;
  currency: string;
  repoUrl: string;
  releaseUrl: string;
  demoUrl: string;
  docsUrl: string;
  coverImage: string;
  authorName: string;
  license: string;
  latestVersion: string;
  minCmsVersion: string;
  tags: string;
  categoryId: string;
  isPublished: boolean;
  isFeatured: boolean;
};

const EMPTY_FORM: FormState = {
  name: '',
  slug: '',
  kind: 'module',
  tagline: '',
  description: '',
  priceCents: '0',
  currency: 'THB',
  repoUrl: '',
  releaseUrl: '',
  demoUrl: '',
  docsUrl: '',
  coverImage: '',
  authorName: '',
  license: '',
  latestVersion: '',
  minCmsVersion: '',
  tags: '',
  categoryId: '',
  isPublished: false,
  isFeatured: false,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories'),
      ]);
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      setProducts(productsData.products ?? []);
      setCategories(categoriesData.categories ?? []);
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  }

  async function openEdit(product: AdminProduct) {
    setError(null);
    const res = await fetch(`/api/admin/products/${product.id}`);
    const data = await res.json();
    const p = data.product;
    if (!p) {
      setError('Failed to load product');
      return;
    }
    setForm({
      id: p.id,
      name: p.name ?? '',
      slug: p.slug ?? '',
      kind: p.kind ?? 'module',
      tagline: p.tagline ?? '',
      description: p.description ?? '',
      priceCents: String(p.priceCents ?? 0),
      currency: p.currency ?? 'THB',
      repoUrl: p.repoUrl ?? '',
      releaseUrl: p.releaseUrl ?? '',
      demoUrl: p.demoUrl ?? '',
      docsUrl: p.docsUrl ?? '',
      coverImage: p.coverImage ?? '',
      authorName: p.authorName ?? '',
      license: p.license ?? '',
      latestVersion: p.latestVersion ?? '',
      minCmsVersion: p.minCmsVersion ?? '',
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
      categoryId: p.categoryId ?? '',
      isPublished: Boolean(p.isPublished),
      isFeatured: Boolean(p.isFeatured),
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      kind: form.kind,
      tagline: form.tagline,
      description: form.description,
      priceCents: Number(form.priceCents) || 0,
      currency: form.currency,
      repoUrl: form.repoUrl,
      releaseUrl: form.releaseUrl,
      demoUrl: form.demoUrl,
      docsUrl: form.docsUrl,
      coverImage: form.coverImage,
      authorName: form.authorName,
      license: form.license,
      latestVersion: form.latestVersion,
      minCmsVersion: form.minCmsVersion,
      tags: form.tags,
      categoryId: form.categoryId || null,
      isPublished: form.isPublished,
      isFeatured: form.isFeatured,
    };

    try {
      const res = await fetch(
        form.id ? `/api/admin/products/${form.id}` : '/api/admin/products',
        {
          method: form.id ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: AdminProduct) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
    if (res.ok) {
      await load();
    } else {
      const data = await res.json();
      setError(data.error || 'Delete failed');
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="border-b border-white/30 bg-white/55 px-8 py-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-indigo-500">Catalogue</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Products</h1>
          </div>
          <button
            onClick={openCreate}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700"
          >
            + New listing
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          {error && (
            <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="mb-8 rounded-[1.75rem] border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur-xl"
            >
              <h2 className="text-lg font-black text-slate-950">
                {form.id ? 'Edit listing' : 'New listing'}
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Name" required value={form.name} onChange={(v) => update('name', v)} />
                <Field label="Slug (optional)" value={form.slug} onChange={(v) => update('slug', v)} />
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Kind</span>
                  <select
                    value={form.kind}
                    onChange={(e) => update('kind', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="module">Module</option>
                    <option value="template">Template</option>
                    <option value="theme">Theme</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Category</span>
                  <select
                    value={form.categoryId}
                    onChange={(e) => update('categoryId', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">None</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <Field label="Tagline" value={form.tagline} onChange={(v) => update('tagline', v)} />
                <Field label="Price (cents)" value={form.priceCents} onChange={(v) => update('priceCents', v)} />
                <Field label="Currency" value={form.currency} onChange={(v) => update('currency', v)} />
                <Field label="Author" value={form.authorName} onChange={(v) => update('authorName', v)} />
                <Field label="License" value={form.license} onChange={(v) => update('license', v)} />
                <Field label="Latest version" value={form.latestVersion} onChange={(v) => update('latestVersion', v)} />
                <Field label="Min CMS version" value={form.minCmsVersion} onChange={(v) => update('minCmsVersion', v)} />
                <Field label="Cover image URL" value={form.coverImage} onChange={(v) => update('coverImage', v)} />
                <Field label="Tags (comma separated)" value={form.tags} onChange={(v) => update('tags', v)} />
                <Field label="Repo URL" value={form.repoUrl} onChange={(v) => update('repoUrl', v)} />
                <Field label="Release URL" value={form.releaseUrl} onChange={(v) => update('releaseUrl', v)} />
                <Field label="Demo URL" value={form.demoUrl} onChange={(v) => update('demoUrl', v)} />
                <Field label="Docs URL" value={form.docsUrl} onChange={(v) => update('docsUrl', v)} />
              </div>
              <label className="mt-4 block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Description</span>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </label>
              <div className="mt-4 flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => update('isPublished', e.target.checked)}
                  />
                  Published
                </label>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => update('isFeatured', e.target.checked)}
                  />
                  Featured
                </label>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="overflow-hidden rounded-[1.75rem] border border-white/40 bg-white/70 shadow-sm backdrop-blur-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Kind</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      Loading...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      No listings yet.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="border-t border-slate-100">
                      <td className="px-5 py-3">
                        <p className="font-bold text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-400">/{product.slug}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{product.kind}</td>
                      <td className="px-5 py-3 text-slate-600">{product.category?.name ?? '—'}</td>
                      <td className="px-5 py-3 text-slate-600">
                        {product.priceCents > 0
                          ? `${product.currency} ${(product.priceCents / 100).toLocaleString('en-US')}`
                          : 'Free'}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                            product.isPublished
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-amber-100 text-amber-600'
                          }`}
                        >
                          {product.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => openEdit(product)}
                          className="mr-2 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="text-xs font-bold text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
        {required ? ' *' : ''}
      </span>
      <input
        type="text"
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
      />
    </label>
  );
}
