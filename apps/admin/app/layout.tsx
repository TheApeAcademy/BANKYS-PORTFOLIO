import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zebraish Control Center",
  description: "Zebraish admin — projects, payments, collaborators, and operations.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-bg text-fg">{children}</body>
    </html>
  );
}
