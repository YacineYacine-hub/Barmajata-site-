/**
 * Identité légale de l'éditeur du site.
 *
 * **À remplir par l'utilisateur.** Ces informations ne s'inventent pas :
 * une mention légale fausse est pire qu'une mention absente, et
 * l'obligation d'identification (LCEN art. 6-III pour un site
 * professionnel) porte sur des données exactes.
 *
 * Tant que `raisonSociale`, `adresse` ou `directeurPublication` est vide,
 * les quatre pages légales continuent d'afficher leur texte d'attente
 * plutôt qu'un document à trous — voir `identiteLegaleComplete()`. Le jour
 * où ce fichier est rempli, les quatre pages s'écrivent d'elles-mêmes.
 *
 * Les champs d'immatriculation sont **optionnels et volontairement
 * neutres**, parce que la structure retenue n'est pas française : c'est
 * une **LLC américaine, non encore créée** au 2026-09-02. On y mettra donc
 * l'État de constitution et le numéro de dossier, là où une société
 * française porterait un SIREN. Ce qui compte n'est pas la forme du
 * numéro, c'est que le lecteur puisse identifier et joindre l'éditeur.
 */
export type IdentiteLegale = {
  /** Dénomination sociale complète, telle qu'immatriculée. */
  raisonSociale: string;
  /** Forme juridique (SAS, SARL, FZ-LLC…). Optionnelle. */
  formeJuridique?: string;
  /** Capital social, avec sa devise. Optionnel. */
  capital?: string;
  /** Adresse postale complète du siège. */
  adresse: string;
  /** Juridiction de constitution — pour une LLC, l'État (« Delaware », « Wyoming »…). */
  juridiction?: string;
  /** Immatriculation : numéro de dossier de l'État, SIREN… Libellé compris. */
  immatriculation?: string;
  /** Numéro de TVA, si la structure en a un. */
  tva?: string;
  /** Nom de la personne physique directrice de la publication. */
  directeurPublication: string;
  /** Adresse de contact publiée. */
  email: string;
  /** Téléphone. Optionnel — l'e-mail suffit à l'obligation de contact. */
  telephone?: string;
};

/** Hébergeur du site : nom, adresse et moyen de le joindre sont exigés. */
export type Hebergeur = {
  nom: string;
  adresse: string;
  contact: string;
};

/**
 * Fournisseur d'envoi des e-mails du club, à nommer dans la politique de
 * confidentialité en tant que destinataire des données. Doit correspondre
 * au fournisseur réellement configuré (voir `src/lib/club/providers.ts`) :
 * nommer le mauvais rendrait l'information trompeuse.
 */
export type FournisseurEmail = { nom: string; pays: string };

export const IDENTITE: IdentiteLegale = {
  raisonSociale: "",
  formeJuridique: "",
  capital: "",
  adresse: "",
  juridiction: "",
  immatriculation: "",
  tva: "",
  directeurPublication: "",
  email: "",
  telephone: "",
};

export const HEBERGEUR: Hebergeur = {
  nom: "",
  adresse: "",
  contact: "",
};

export const FOURNISSEUR_EMAIL: FournisseurEmail = { nom: "", pays: "" };

/**
 * Le minimum sans lequel une page légale ne doit pas s'afficher : qui
 * édite, où il est, qui dirige la publication, et comment le joindre.
 * L'hébergeur est exigé séparément par les mentions légales seules.
 */
export function identiteLegaleComplete(): boolean {
  return Boolean(
    IDENTITE.raisonSociale && IDENTITE.adresse && IDENTITE.directeurPublication && IDENTITE.email,
  );
}

export function hebergeurComplet(): boolean {
  return Boolean(HEBERGEUR.nom && HEBERGEUR.adresse);
}

/**
 * Bloc d'identification, une ligne par information.
 *
 * Les libellés sont **passés en paramètre** et non écrits ici : ils
 * s'affichent sur les trois locales, et une mention légale à moitié en
 * français sur la version espagnole ferait mauvais effet.
 */
export function lignesIdentite(labels: {
  directeur: string;
  capital: string;
  tva: string;
}): string[] {
  const lignes = [
    [IDENTITE.raisonSociale, IDENTITE.formeJuridique].filter(Boolean).join(" — "),
    IDENTITE.capital ? `${labels.capital} : ${IDENTITE.capital}` : "",
    IDENTITE.adresse,
    IDENTITE.juridiction,
    IDENTITE.immatriculation,
    IDENTITE.tva ? `${labels.tva} : ${IDENTITE.tva}` : "",
    `${labels.directeur} : ${IDENTITE.directeurPublication}`,
    IDENTITE.email,
    IDENTITE.telephone,
  ];
  return lignes.filter((ligne): ligne is string => Boolean(ligne));
}

export function lignesHebergeur(): string[] {
  return [HEBERGEUR.nom, HEBERGEUR.adresse, HEBERGEUR.contact].filter(Boolean);
}
