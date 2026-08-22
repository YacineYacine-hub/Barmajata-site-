import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const tSite = useTranslations("site");

  return (
    <footer className="border-t border-sand-200 bg-sand-50">
      <div className="mx-auto max-w-5xl ps-6 pe-6 py-6 text-sm text-ink-500">
        <p>
          {tSite("name")} — {t("rights")}
        </p>
      </div>
    </footer>
  );
}
