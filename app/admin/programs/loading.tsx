export default function ProgramsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-7 w-48 animate-pulse rounded-lg bg-[var(--muted)]" />
        <div className="h-9 w-24 animate-pulse rounded-lg bg-[var(--muted)]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]"
          />
        ))}
      </div>
    </div>
  );
}
