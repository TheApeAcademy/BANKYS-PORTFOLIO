import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Zebraish Bureau of Statistics, Analysis & Critical Motion",
  description: "The Zebraish Bureau: projects, payments, collaborators and live studio activity.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <body className="min-h-full flex flex-col bg-bg text-fg">{children}</body>
    </html>
  );
}
