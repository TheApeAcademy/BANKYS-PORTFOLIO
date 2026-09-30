import { requireAdmin } from "@zebraish/lib/auth";
import { AdminSidebar, AdminTopBar } from "@/components/AdminNav";
import { HideBackdrop } from "@/components/HideBackdrop";
import { MotionRoot } from "@/components/MotionRoot";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="relative min-h-screen text-fg lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <HideBackdrop />
      <AdminSidebar />
      <div className="relative z-[1] min-w-0">
        <AdminTopBar />
        <MotionRoot>{children}</MotionRoot>
      </div>
    </div>
  );
}
