import "./globals.css";

// App pages (portal, collaborator dashboard, tracker, legal, checkout) are
// Tailwind-styled. The Zebraish design pages live in (zebraish) without it.
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
