import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { ContentLocale } from "@/lib/content/schema";

/**
 * CTA "à paraître" — aucune URL externe dans les fichiers de contenu :
 * pointe systématiquement vers /club, qui affiche le titre du livre
 * concerné à partir de son slug (voir src/app/[locale]/club/page.tsx).
 */
export async function NotifyMe({ slug, langue }: { slug: string; langue: ContentLocale }) {
  const t = await getTranslations("books");

  return (
    <Link
      href={{ pathname: "/club", query: { book: slug, langue } }}
      className="inline-block rounded-md bg-gold-600 px-6 py-3 text-sm font-medium text-sand-50 hover:bg-gold-500"
    >
      {t("cta.notifyMe")}
    </Link>
  );
}
