'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Media = {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
};

export default function AdminMediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      setMedia(data.media ?? []);
    } catch {
      setError('Failed to load media');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const body = new FormData();
    body.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleDelete(item: Media) {
    if (!confirm(`Delete "${item.originalName}"?`)) return;
    const res = await fetch(`/api/admin/media/${item.id}`, { method: 'DELETE' });
    if (res.ok) await load();
    else setError('Delete failed');
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="border-b border-white/30 bg-white/55 px-8 py-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-indigo-500">Delivery</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Media Library</h1>
          </div>
          <label className="cursor-pointer rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700">
            {uploading ? 'Uploading...' : '+ Upload image'}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-6xl">
          {error && (
            <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : media.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center text-sm text-slate-500">
              No media yet. Upload cover images and screenshots here.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {media.map((item) => (
                <figure
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-white/40 bg-white/70 shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={item.originalName} className="h-40 w-full object-cover" />
                  <figcaption className="p-3">
                    <p className="truncate text-xs font-bold text-slate-700">{item.originalName}</p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {(item.size / 1024).toFixed(0)} KB
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <button
                        onClick={() => navigator.clipboard.writeText(item.url)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700"
                      >
                        Copy URL
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-[11px] font-bold text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
