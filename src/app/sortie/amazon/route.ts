import { NextRequest, NextResponse } from "next/server";
import { buildAmazonUrl } from "@/lib/amazon/marketplaces";
import { validerSortieAmazon } from "@/lib/amazon/sortie";

/**
 * Sortie mesurée vers Amazon.
 *
 * Le bouton d'achat passe par ici plutôt que de pointer directement chez
 * Amazon. Le clic devient alors une ligne dans le journal du serveur, avec
 * le livre et la boutique — ce qui donne le rapport visites / clics
 * d'achat **sans aucun traceur, aucun cookie et aucun script**. La mesure
 * se fait côté serveur, là où elle ne regarde personne.
 *
 * ⚠ SÉCURITÉ — LA RAISON D'ÊTRE DE TOUTE LA VALIDATION CI-DESSOUS
 *
 * Une route qui redirige d'après un paramètre d'URL est une **redirection
 * ouverte** si elle fait confiance à ce paramètre : n'importe qui
 * fabriquerait `barmajata.com/sortie/amazon?...` menant vers un site
 * d'hameçonnage, avec la caution de notre domaine.
 *
 * D'où le principe : **on ne redirige JAMAIS vers une URL reçue**. On
 * reçoit un ASIN et un code de boutique, on les valide, et on
 * **reconstruit** l'URL nous-mêmes avec `buildAmazonUrl()`. Tout ce qui
 * s'écarte de ce cadre part à l'accueil.
 *
 * Le champ `urlOverride` d'un format ne passe pas par ici : c'est une URL
 * libre, elle reste en lien direct, non mesuré. C'est le prix de ne pas
 * ouvrir une brèche pour une échappatoire rarement utilisée.
 */

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  // Toute la validation vit dans `validerSortieAmazon`, testée à part.
  const sortie = validerSortieAmazon(params.get("asin"), params.get("m"));

  if (!sortie) {
    // Ni erreur ni page blanche : l'accueil. Un lien d'achat malformé ne
    // doit pas laisser un acheteur devant un message technique.
    return NextResponse.redirect(new URL("/", request.url), 302);
  }
  const { asin, marketplace } = sortie;

  /*
   * La ligne qui rend la mesure possible. Elle part dans la sortie
   * standard du service, donc dans le journal de systemd — rien à
   * installer, rien à sauvegarder. `livre` est purement indicatif et
   * n'entre jamais dans l'URL construite.
   */
  console.log(
    `[sortie-amazon] ${new Date().toISOString()} livre=${params.get("livre") ?? "?"} asin=${asin} marketplace=${marketplace}`,
  );

  return NextResponse.redirect(buildAmazonUrl(asin, marketplace), 302);
}
