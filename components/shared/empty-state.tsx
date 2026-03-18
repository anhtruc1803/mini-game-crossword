interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/** Placeholder for empty lists / no data. */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="glass-panel-soft flex flex-col items-center justify-center gap-4 rounded-[28px] border border-dashed border-white/12 px-6 py-14 text-center">
      <div className="h-3 w-16 rounded-full bg-white/10" />
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        {description && <p className="max-w-lg text-sm leading-7 text-white/58">{description}</p>}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
