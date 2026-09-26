import { redirect } from "next/navigation";

// Superseded by the /start configurator — keep this route alive for old bookmarks/links.
export default function PortalPage() {
  redirect("/start");
}
