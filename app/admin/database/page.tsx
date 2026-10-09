import { requireAuth } from '@/lib/auth';
import { getDatabaseBootstrapStatus } from '@/lib/system/database-status';

export const dynamic = 'force-dynamic';

export default async function AdminDatabasePage() {
  await requireAuth();
  const status = await getDatabaseBootstrapStatus();

  const rows = [
    { label: 'DATABASE_URL configured', value: status.hasDatabaseUrl },
    { label: 'Database reachable', value: status.canConnect },
    { label: 'Schema applied', value: status.schemaReady },
    { label: 'Admin account required', value: status.needsSetup },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="border-b border-white/30 bg-white/55 px-8 py-6 backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.32em] text-indigo-500">System</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Bootstrap Status</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-3xl space-y-4">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-2xl border border-white/40 bg-white/70 px-5 py-4 shadow-sm backdrop-blur-xl"
            >
              <span className="text-sm font-bold text-slate-700">{row.label}</span>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
                  row.value ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                }`}
              >
                {row.value ? 'ready' : 'pending'}
              </span>
            </div>
          ))}

          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4 text-sm text-indigo-700">
            {status.message}
          </div>

          <div className="rounded-2xl border border-white/40 bg-white/70 px-5 py-5 text-sm leading-7 text-slate-600 shadow-sm backdrop-blur-xl">
            <p className="font-black uppercase tracking-wider text-slate-400">Maintenance</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>`npx prisma db push` — apply the current schema.</li>
              <li>`npx prisma studio` — inspect data locally.</li>
              <li>`npm test` — route-policy and session checks.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
