'use client';

import { useEffect, useState } from 'react';

type SiteConfig = {
  siteName: string;
  siteDescription: string | null;
  logoUrl: string | null;
  supportEmail: string | null;
};

export default function AdminConfigurationPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/site-config')
      .then((res) => res.json())
      .then((data) => setConfig(data.config))
      .catch(() => setError('Failed to load configuration'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setConfig(data.config);
      setMessage('Configuration saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="border-b border-white/30 bg-white/55 px-8 py-6 backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.32em] text-indigo-500">Delivery</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Site Config</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-3xl">
          {loading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : !config ? (
            <p className="text-sm text-red-500">{error ?? 'Configuration unavailable.'}</p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-[1.75rem] border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur-xl"
            >
              {message && (
                <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {message}
                </div>
              )}
              {error && (
                <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div className="grid gap-4">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Site name</span>
                  <input
                    type="text"
                    value={config.siteName}
                    onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Description</span>
                  <textarea
                    value={config.siteDescription ?? ''}
                    onChange={(e) => setConfig({ ...config, siteDescription: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Logo URL</span>
                  <input
                    type="text"
                    value={config.logoUrl ?? ''}
                    onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Support email</span>
                  <input
                    type="email"
                    value={config.supportEmail ?? ''}
                    onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save configuration'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
