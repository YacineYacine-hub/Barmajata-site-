import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "../globals.css";

// Segment hors [locale] : aucun layout racine partagé (src/app/layout.tsx
// n'existe pas, voir CLAUDE.md), donc CE layout doit lui-même déclarer
// <html>/<body> — comme [locale]/layout.tsx le fait pour son propre
// arbre. Les deux coexistent sans conflit tant qu'aucun layout commun
// au-dessus d'eux ne déclare html/body une deuxième fois.
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

export const metadata: Metadata = {
  title: "Contenu débloqué — BARMAJATA",
  robots: { index: false, follow: false },
};

export default function BonusLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" dir="ltr" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
