# BARMAJATA

Site vitrine de BARMAJATA, maison d'édition.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) (configuration CSS-first, `src/app/globals.css`)
- [next-intl v4](https://next-intl.dev/) pour l'internationalisation (fr/en/ar)

## Commandes

```bash
npm run dev     # serveur de développement
npm run build   # build de production
npm run start   # sert le build de production
npm run lint    # ESLint
```

## Variables d'environnement

Voir `.env.example`.

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_DEMO_CONTENT` | `true` charge du contenu de démonstration factice en plus du contenu réel (voir `CLAUDE.md`). Fixée au build, jamais activée sur Vercel en production. |

## Locales

Les locales du site (`fr`, `en`, `ar`) sont déclarées en dur dans
`src/i18n/routing.ts` — aucune variable d'environnement ne les pilote.

`PUBLIC_LOCALES` (`src/lib/seo.ts`) est une constante distincte : elle ne
détermine pas les locales du routing, seulement lesquelles apparaissent
dans le `hreflang` et le sitemap.

## Structure

```
src/app/             Routes Next.js App Router ([locale]/...)
src/components/      Composants React partagés (Header, Hero, Reveal...)
src/lib/             Logique métier (content, amazon, seo, social)
src/content/         Contenu livres/auteurs en JSON (+ _demo/ optionnel)
src/i18n/            Configuration next-intl (routing, navigation)
messages/            Traductions par locale (fr.json, en.json, ar.json)
public/brand/        Assets d'identité visuelle (logo, favicon, OG image)
public/demo/         Couvertures de démonstration (SVG générées)
.github/workflows/   CI (tsc, lint, build)
CLAUDE.md            Documentation technique détaillée du projet
```
