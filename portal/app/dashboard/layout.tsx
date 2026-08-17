import { requireCollaborator } from "@/lib/auth";
import { CollaboratorNav } from "@/components/CollaboratorNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireCollaborator();

  return (
    <div className="min-h-screen bg-bg text-fg">
      <CollaboratorNav />
      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  );
}
