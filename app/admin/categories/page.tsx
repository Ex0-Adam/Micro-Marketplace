'use client';

import { useCallback, useEffect, useState } from 'react';

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  _count: { products: number };
};

type FormState = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: string;
};

const EMPTY: FormState = { name: '', slug: '', description: '', sortOrder: '0' };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      setCategories(data.categories ?? []);
    } catch {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      description: form.description,
      sortOrder: Number(form.sortOrder) || 0,
    };
    try {
      const res = await fetch(
        form.id ? `/api/admin/categories/${form.id}` : '/api/admin/categories',
        {
          method: form.id ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setShowForm(false);
      setForm(EMPTY);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: Category) {
    if (!confirm(`Delete category "${category.name}"?`)) return;
    const res = await fetch(`/api/admin/categories/${category.id}`, { method: 'DELETE' });
    if (res.ok) await load();
    else setError('Delete failed');
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="border-b border-white/30 bg-white/55 px-8 py-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-indigo-500">Catalogue</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Categories</h1>
          </div>
          <button
            onClick={() => {
              setForm(EMPTY);
              setShowForm(true);
            }}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700"
          >
            + New category
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
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
                {form.id ? 'Edit category' : 'New category'}
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Name *</span>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Slug (optional)</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Description</span>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Sort order</span>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
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
                  <th className="px-5 py-3">Products</th>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-400">Loading...</td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-400">No categories yet.</td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="border-t border-slate-100">
                      <td className="px-5 py-3">
                        <p className="font-bold text-slate-900">{category.name}</p>
                        <p className="text-xs text-slate-400">/{category.slug}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{category._count.products}</td>
                      <td className="px-5 py-3 text-slate-600">{category.sortOrder}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => {
                            setForm({
                              id: category.id,
                              name: category.name,
                              slug: category.slug,
                              description: category.description ?? '',
                              sortOrder: String(category.sortOrder),
                            });
                            setShowForm(true);
                          }}
                          className="mr-2 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
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
