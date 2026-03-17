import { cn } from "@/lib/utils/cn";

interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/** Card wrapper for content sections. */
export function SectionCard({ title, children, className }: SectionCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border)] bg-[var(--card)] p-6",
        className
      )}
    >
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-[var(--card-foreground)]">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
