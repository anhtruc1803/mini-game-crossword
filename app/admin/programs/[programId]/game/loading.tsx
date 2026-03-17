export default function GameControlLoading() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-56 animate-pulse rounded-lg bg-[var(--muted)]" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="h-96 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />
        </div>
        <div className="h-64 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />
      </div>
    </div>
  );
}
