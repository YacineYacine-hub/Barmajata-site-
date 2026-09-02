import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlocAbonnement } from "@/components/BlocAbonnement";
import { PageTransition } from "@/components/PageTransition";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-cormorant",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });

  return {
    metadataBase: new URL(SITE_URL),
    // `template` suffixe automatiquement le titre de chaque page avec le
    // nom du site (Next.js le compose lui-même) — chaque page n'a donc
    // qu'à fournir son propre titre court via generateMetadata(), jamais
    // le nom du site en double.
    title: { default: t("name"), template: `%s — ${t("name")}` },
    description: t("tagline"),
    icons: {
      icon: "/brand/favicon.svg",
      apple: "/brand/apple-touch-icon.png",
    },
    openGraph: {
      siteName: t("name"),
      images: [{ url: "/brand/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);


  return (
    <html
      lang={locale}
      dir="ltr"
      className={`${cormorant.variable} ${inter.variable}`}
    >
      <body className="font-sans antialiased">
        <NextIntlClientProvider>
          <Header />
          <PageTransition>{children}</PageTransition>
          <BlocAbonnement />
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
