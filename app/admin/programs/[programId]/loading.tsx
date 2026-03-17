export default function ProgramDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-64 animate-pulse rounded-lg bg-[var(--muted)]" />
      <div className="flex gap-2 border-b border-[var(--border)] pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-6 w-20 animate-pulse rounded bg-[var(--muted)]" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />
        <div className="space-y-6">
          <div className="h-28 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />
          <div className="h-28 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />
        </div>
      </div>
    </div>
  );
}
