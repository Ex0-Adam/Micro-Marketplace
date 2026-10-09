import Link from 'next/link';

export default function PublicHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 text-sm font-black text-white">
            M
          </span>
          <span className="text-lg font-black tracking-tight text-slate-950">
            Micro Marketplace
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-bold text-slate-600">
          <Link href="/modules" className="hover:text-indigo-600">
            Modules
          </Link>
          <Link href="/templates" className="hover:text-indigo-600">
            Templates
          </Link>
          <Link href="/search" className="hover:text-indigo-600">
            Search
          </Link>
          <Link
            href="/admin"
            className="rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
