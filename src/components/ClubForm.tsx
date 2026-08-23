"use client";

import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

type BookEntry = { slug: string; langue: string; titre: string };

/**
 * Formulaire d'inscription du club — reçoit la liste plate (slug, langue,
 * titre) des éditions visibles calculée côté serveur (page statique) pour
 * pouvoir résoudre ?book=/&langue= côté client via useSearchParams() sans
 * forcer /club en rendu dynamique.
 */
export function ClubForm({ books }: { books: BookEntry[] }) {
  const t = useTranslations("club");
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);

  const bookSlug = searchParams.get("book") ?? undefined;
  const langue = searchParams.get("langue") ?? undefined;

  const matched = bookSlug
    ? (books.find((entry) => entry.slug === bookSlug && entry.langue === langue) ??
      books.find((entry) => entry.slug === bookSlug))
    : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO(club-backend) : aucun backend en Phase 1. Brancher ici l'appel
    // vers le service d'inscription (mailing-list) quand il existera — en
    // attendant, le formulaire ne fait rien d'autre qu'afficher le
    // message d'attente ci-dessous.
    setSubmitted(true);
  }

  if (submitted) {
    return <p className="mt-8 text-roche-700 text-start">{t("pending")}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col items-start gap-4">
      {matched && (
        <p className="text-sm text-roche-700 text-start">
          {t("bookNotice", { title: matched.titre })}
        </p>
      )}

      {bookSlug && <input type="hidden" name="book" value={bookSlug} />}

      <div className="flex w-full flex-col gap-2">
        <label htmlFor="club-email" className="text-sm text-roche-700 text-start">
          {t("emailLabel")}
        </label>
        <input
          id="club-email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-sable-300 bg-lin-50 px-4 py-2 text-sm text-nuit-900"
        />
      </div>

      <button
        type="submit"
        className="rounded-md bg-nuit-900 px-6 py-3 text-sm font-medium text-lin-50 hover:bg-roche-700"
      >
        {t("submit")}
      </button>
    </form>
  );
}
