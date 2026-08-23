import Image from "next/image";
import { Reveal } from "./Reveal";

type HeroProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Sans image : dégradé lin-100 → sable-300 → gres-600. */
  image?: { src: string; alt: string };
};

// Ratio 4/5 mobile, 16/9 desktop. Titre toujours en nuit-900, y compris
// avec une image (pas de scrim ajouté pour l'instant — à revoir si une
// vraie photo trop sombre/claire pose un problème de contraste).
export function Hero({ eyebrow, title, subtitle, image }: HeroProps) {
  return (
    <section className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/9]">
      {image ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-lin-100 via-sable-300 to-gres-600" />
      )}

      <div className="relative z-10 mx-auto flex h-full max-w-3xl flex-col items-start justify-center ps-6 pe-6 text-start">
        <Reveal>
          {eyebrow && (
            <p className="text-sm uppercase tracking-wide text-nuit-900">{eyebrow}</p>
          )}
          <h1 className="mt-3 font-serif text-4xl text-nuit-900 sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-6 max-w-xl text-nuit-900">{subtitle}</p>}
        </Reveal>
      </div>
    </section>
  );
}
