import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { getServerLang } from "@/lib/i18n/server";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { getServerTheme } from "@/lib/theme/server";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Zebraish Portal",
  description: "Zebraish project intake, collaborator commissions, and payouts.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getServerLang();
  const theme = await getServerTheme();

  return (
    <html lang={lang} data-theme={theme} className={`h-full ${inter.variable}`}>
      {/* Styling is per route group: (portal) loads Tailwind via its own layout,
          (zebraish) renders the Claude Design pages with their own inline styles
          and must not get Tailwind's preflight reset. */}
      <body className="min-h-full flex flex-col">
        <LanguageProvider initialLang={lang}>
          <ThemeProvider initialTheme={theme}>{children}</ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
