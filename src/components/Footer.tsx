import { useTranslations } from "next-intl";

// Fond du footer toujours clair (bg-lin-50) actuellement → logo-lockup.svg.
// Si un fond sombre est introduit un jour (ex. bg-nuit-900), utiliser
// logo-lockup-dark.svg à la place. Même règle dir="ltr" que le header (voir
// CLAUDE.md, Lot 3) : le logo ne se miroite ni ne se réordonne en RTL.
export function Footer() {
  const t = useTranslations("footer");
  const tSite = useTranslations("site");

  return (
    <footer className="border-t border-sable-300 bg-lin-50">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 ps-6 pe-6 py-8 text-sm text-roche-700 sm:flex-row sm:justify-between">
        <div dir="ltr">
          <img
            src="/brand/logo-lockup.svg"
            alt=""
            aria-hidden="true"
            width={160}
            height={72}
            className="h-10 w-auto"
          />
        </div>
        <p>
          {tSite("name")} — {t("rights")}
        </p>
      </div>
    </footer>
  );
}
