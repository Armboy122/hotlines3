export default function MainLoading() {
  return (
    <div className="mx-auto min-h-[60vh] max-w-7xl space-y-5 px-4 py-6 sm:px-6" aria-label="กำลังโหลดหน้า">
      <div className="h-9 w-56 animate-pulse rounded bg-slate-200" />
      <div className="h-12 animate-pulse rounded-xl border border-slate-200 bg-white" />
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]"><div className="h-96 animate-pulse rounded-xl border border-slate-200 bg-white" /><div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white" /></div>
    </div>
  )
}
