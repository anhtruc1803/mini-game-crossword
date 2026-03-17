import { AdminHeader } from "@/components/shared/admin-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AdminHeader />
      <div className="p-6">{children}</div>
    </div>
  );
}
