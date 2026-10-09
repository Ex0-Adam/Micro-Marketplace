'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Change failed');
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Change failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-[1.75rem] border border-white/40 bg-white/70 p-8 shadow-sm backdrop-blur-xl"
      >
        <h1 className="text-2xl font-black text-slate-950">Change password</h1>
        <p className="mt-2 text-sm text-slate-500">
          You must set a new password before continuing.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Current password</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">New password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Confirm new password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {loading ? 'Saving...' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
