"use client";

/**
 * Filet de sécurité ultime : une erreur survenue dans un layout racine
 * (`[locale]/layout.tsx` ou `bonus/layout.tsx`) remplace tout l'arbre,
 * `<html>` compris — d'où le `<html>`/`<body>` déclarés ici.
 *
 * Volontairement sans dépendance : ni next-intl (aucun provider ne
 * subsiste à ce niveau, donc texte en français, la locale par défaut), ni
 * `globals.css` ni `next/font` (l'erreur peut justement venir de leur
 * chargement). Les styles sont donc en ligne, avec les valeurs de la
 * palette écrites en dur plutôt que par variables CSS.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr" dir="ltr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fbf8f2",
          color: "#2a2521",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          padding: "1.5rem",
          textAlign: "center",
        }}
      >
        <main style={{ maxWidth: "36rem" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.875rem",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#5a5048",
            }}
          >
            Erreur 500
          </p>
          <h1
            style={{
              margin: "0.5rem 0 0",
              fontFamily: "ui-serif, Georgia, serif",
              fontSize: "1.875rem",
              fontWeight: 400,
            }}
          >
            Une erreur est survenue
          </h1>
          <p style={{ margin: "1.5rem 0 0", color: "#5a5048" }}>
            La page n&apos;a pas pu être affichée. Vous pouvez réessayer, ou
            revenir à l&apos;accueil.
          </p>
          {error.digest && (
            <p style={{ margin: "1rem 0 0", fontSize: "0.75rem", color: "#5a5048" }}>
              Référence : {error.digest}
            </p>
          )}
          <p style={{ margin: "2rem 0 0", display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                borderRadius: "0.375rem",
                border: "none",
                backgroundColor: "#2a2521",
                color: "#fbf8f2",
                padding: "0.75rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Réessayer
            </button>
            {/* `<a>` volontaire plutôt que `next/link` : à ce niveau
                l'arbre React est en échec, et seul un rechargement complet
                du document garantit d'en sortir. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/fr"
              style={{
                borderRadius: "0.375rem",
                border: "1px solid #d9c7a8",
                color: "#5a5048",
                padding: "0.75rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Retour à l&apos;accueil
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
