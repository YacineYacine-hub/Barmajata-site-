"use client";

import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type BookEntry = { slug: string; langue: string; titre: string };

type Status = "idle" | "submitting" | "sent" | "error";

/**
 * Formulaire d'inscription du club — reçoit la liste plate (slug, langue,
 * titre) des éditions visibles calculée côté serveur (page statique) pour
 * pouvoir résoudre ?book=/&langue= côté client via useSearchParams() sans
 * forcer /club en rendu dynamique. `serviceEnabled` est calculé côté
 * serveur (getConfiguredProvider() au moment du build/rendu statique) :
 * sans fournisseur configuré (BREVO_API_KEY / RESEND_API_KEY), le
 * formulaire reste inerte avec un message clair, plutôt que d'échouer
 * silencieusement à la soumission.
 */
export function ClubForm({
  books,
  serviceEnabled,
}: {
  books: BookEntry[];
  serviceEnabled: boolean;
}) {
  const t = useTranslations("club");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("idle");
  const [consent, setConsent] = useState(false);

  const confirmParam = searchParams.get("confirm");
  const bookSlug = searchParams.get("book") ?? undefined;
  const langue = searchParams.get("langue") ?? undefined;

  const matched = bookSlug
    ? (books.find((entry) => entry.slug === bookSlug && entry.langue === langue) ??
      books.find((entry) => entry.slug === bookSlug))
    : undefined;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = (new FormData(form).get("email") as string | null) ?? "";

    setStatus("submitting");
    try {
      const response = await fetch("/api/club/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, consent: true, locale, bookSlug, langue }),
      });
      setStatus(response.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  const confirmBanner =
    confirmParam === "success"
      ? t("confirmSuccess")
      : confirmParam === "invalid"
        ? t("confirmInvalid")
        : confirmParam === "error"
          ? t("confirmError")
          : undefined;

  if (status === "sent") {
    return (
      <>
        {confirmBanner && <p className="mt-8 text-roche-700 text-start">{confirmBanner}</p>}
        <p className="mt-8 text-roche-700 text-start">{t("confirmPending")}</p>
      </>
    );
  }

  return (
    <>
      {confirmBanner && <p className="mt-8 text-roche-700 text-start">{confirmBanner}</p>}

      {!serviceEnabled && (
        <p className="mt-8 rounded-md border border-sable-300 bg-lin-100 px-4 py-3 text-sm text-roche-700 text-start">
          {t("serviceUnavailable")}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col items-start gap-4">
        {matched && (
          <p className="text-sm text-roche-700 text-start">
            {t("bookNotice", { title: matched.titre })}
          </p>
        )}

        <div className="flex w-full flex-col gap-2">
          <label htmlFor="club-email" className="text-sm text-roche-700 text-start">
            {t("emailLabel")}
          </label>
          <input
            id="club-email"
            name="email"
            type="email"
            required
            disabled={!serviceEnabled || status === "submitting"}
            className="w-full rounded-md border border-sable-300 bg-lin-50 px-4 py-2 text-sm text-nuit-900 disabled:opacity-50"
          />
        </div>

        <label className="flex items-start gap-2 text-sm text-roche-700 text-start">
          <input
            type="checkbox"
            name="consent"
            required
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            disabled={!serviceEnabled || status === "submitting"}
            className="mt-0.5"
          />
          <span>
            {t.rich("consentLabel", {
              privacyLink: (chunks) => (
                <Link href="/privacy-policy" className="text-or-500 hover:underline">
                  {chunks}
                </Link>
              ),
            })}
          </span>
        </label>

        <p className="text-xs text-roche-700 text-start">{t("gdprNote")}</p>

        {status === "error" && (
          <p className="text-sm text-roche-700 text-start">{t("errorGeneric")}</p>
        )}

        <button
          type="submit"
          disabled={!serviceEnabled || status === "submitting"}
          className="rounded-md bg-nuit-900 px-6 py-3 text-sm font-medium text-lin-50 hover:bg-roche-700 disabled:opacity-50"
        >
          {t("submit")}
        </button>
      </form>
    </>
  );
}
