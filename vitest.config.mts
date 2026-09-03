import { defineConfig } from "vitest/config";

/*
 * Vitest, et RIEN d'autre.
 *
 * La documentation de Next propose `jsdom`, `@testing-library/react` et
 * `@vitejs/plugin-react` — utiles pour tester des composants. Ils ne sont
 * pas installés ici, délibérément : ce qui est testé est de la **logique
 * pure**, sans DOM ni React. Quatre paquets de moins à maintenir, et une
 * suite qui s'exécute en moins de deux dixièmes de seconde.
 *
 * `vite-tsconfig-paths` avait été installé pour résoudre les imports
 * `@/lib/...`, puis retiré : Vite le fait nativement via
 * `resolve.tsconfigPaths`, et l'a signalé lui-même au premier lancement.
 * Une dépendance de moins.
 *
 * Extension `.mts` et non `.ts` : le fichier est en syntaxe ESM alors que
 * le projet n'est pas déclaré `"type": "module"`. Sans elle, Vite avertit
 * à chaque exécution.
 *
 * Le jour où un composant devra être testé, la documentation de Next dit
 * quoi ajouter. Ne pas l'ajouter avant d'en avoir besoin.
 */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
