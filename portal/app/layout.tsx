import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zebraish Portal",
  description: "Zebraish project intake, collaborator commissions, and payouts.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-bg text-fg">{children}</body>
    </html>
  );
}
