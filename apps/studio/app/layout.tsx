import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { getServerLang } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Zebraish Portal",
  description: "Zebraish project intake, collaborator commissions, and payouts.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getServerLang();

  return (
    <html lang={lang} className="h-full">
      {/* No bg/text classes here — the homepage brings its own (site.css) and would
          lose to Tailwind utility classes on body regardless of stylesheet order, since
          a class selector always beats site.css's plain `body{}` rule. Each Tailwind
          page sets bg-bg/text-fg on its own wrapper instead. */}
      <body className="min-h-full flex flex-col">
        <LanguageProvider initialLang={lang}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
