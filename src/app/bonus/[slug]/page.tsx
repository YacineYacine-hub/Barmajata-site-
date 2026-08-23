import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllQrCodes } from "@/lib/content";

export function generateStaticParams() {
  return getAllQrCodes()
    .filter((entry) => entry.actif)
    .map((entry) => ({ slug: entry.destination }));
}

function findActiveEntry(slug: string) {
  return getAllQrCodes().find((entry) => entry.actif && entry.destination === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = findActiveEntry(slug);
  return { title: entry?.libelle ?? "Contenu débloqué" };
}

/**
 * Contenu débloqué par un QR code (/b/[code] → ici si le code est actif).
 * Sobre, sans menu ni pied de page : voir src/app/bonus/layout.tsx.
 */
export default async function BonusPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = findActiveEntry(slug);
  if (!entry) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center ps-6 pe-6 py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-or-500">Contenu débloqué</p>
      <h1 className="mt-2 font-serif text-3xl text-nuit-900">{entry.libelle}</h1>
      <p className="mt-6 text-roche-700">
        Contenu à venir. Cette page sera complétée avec le contenu débloqué par ce code.
      </p>
    </main>
  );
}
