import Image from "next/image";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { SOCIAL_LINKS } from "@/lib/social";

// Bandeau nuit-900 (desktop et mobile) → logo-lockup-dark.svg. Même règle
// dir="ltr" que le header (voir CLAUDE.md, Lot 3) : le logo ne se miroite
// ni ne se réordonne en RTL.
export function Footer() {
  const t = useTranslations("footer");
  const tSite = useTranslations("site");

  return (
    <footer className="bg-nuit-900">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 ps-6 pe-6 py-10 text-sm text-sable-300 sm:flex-row sm:justify-between">
        <div dir="ltr">
          <Image
            src="/brand/logo-lockup-dark.svg"
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

        {SOCIAL_LINKS.length > 0 && (
          <ul className="flex items-center gap-4">
            {SOCIAL_LINKS.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-lin-50"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}

        <LocaleSwitcher />
      </div>
    </footer>
  );
}
