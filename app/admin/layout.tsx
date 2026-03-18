import { AdminHeader } from "@/components/shared/admin-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(251,113,133,0.16),transparent_24%),radial-gradient(circle_at_85%_10%,rgba(251,191,36,0.12),transparent_24%),radial-gradient(circle_at_78%_28%,rgba(56,189,248,0.12),transparent_22%)]" />
      <AdminHeader />
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
