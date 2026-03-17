import { cn } from "@/lib/utils/cn";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

/** Wrapper for consistent page padding and max-width. */
export function PageShell({ children, className }: PageShellProps) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 py-6 md:px-8", className)}>
      {children}
    </div>
  );
}
