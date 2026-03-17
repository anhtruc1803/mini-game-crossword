interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/** Placeholder for empty lists / no data. */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--border)] py-16 text-center">
      <h3 className="text-lg font-medium">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-[var(--muted-foreground)]">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
