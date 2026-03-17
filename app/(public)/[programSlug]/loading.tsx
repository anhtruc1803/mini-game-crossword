export default function ViewerLoading() {
  const rowLengths = [6, 8, 7, 9, 5, 8];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      {/* Skeleton header */}
      <div className="h-8 w-48 animate-pulse rounded-lg bg-[var(--muted)]" />
      <div className="h-4 w-32 animate-pulse rounded bg-[var(--muted)]" />

      {/* Skeleton board */}
      <div className="mt-6 w-full max-w-lg space-y-2">
        {rowLengths.map((length, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-7 w-7 animate-pulse rounded-full bg-[var(--muted)]" />
            <div className="flex gap-1">
              {Array.from({ length }).map((_, j) => (
                <div
                  key={j}
                  className="h-7 w-7 animate-pulse rounded border border-[var(--border)]/40 bg-[var(--muted)]/30 md:h-9 md:w-9"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
