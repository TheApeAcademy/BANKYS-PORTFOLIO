import { requireAdmin } from "@zebraish/lib/auth";
import { AdminSidebar, AdminTopBar } from "@/components/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-bg text-fg lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <AdminSidebar />
      <div className="min-w-0">
        <AdminTopBar />
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
