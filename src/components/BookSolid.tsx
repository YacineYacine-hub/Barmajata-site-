"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

// Constantes explicitement données par la spec.
const FOCAL = 780;
const AMBIENT = 0.62;
const DIFFUSE = 0.38;
const STROKE_WIDTH = 1.1;
const INERTIA_DECAY = 0.93;

// Choix d'implémentation (non spécifiés), documentés ici.
const HALF_W = 130; // demi-largeur de la couverture, unités locales
const HALF_H = 190; // demi-hauteur
const BOOK_HEIGHT_MM = 210; // hauteur physique supposée, pour convertir epaisseurMm en unités locales
const UNITS_PER_MM = (HALF_H * 2) / BOOK_HEIGHT_MM;
const DEFAULT_EPAISSEUR_MM = 20;
const CAMERA_DISTANCE = 900; // doit rester très supérieur à la profondeur du livre
const VIEWBOX_W = 460;
const VIEWBOX_H = 560;
const INITIAL_YAW = -24;
const INITIAL_PITCH = 8;
// Rotation libre sur les deux axes (Lot H10) : le livre tournait
// librement en lacet mais son tangage était bloqué à ±60°, il ne pouvait
// donc jamais être vu de dessus ni de dessous. La projection et le tri
// des faces gèrent déjà toutes les orientations — la borne était une
// prudence, pas une nécessité.
const DRAG_SENSITIVITY = 0.35; // degrés par pixel glissé
const KEY_STEP_DEG = 6;
const INERTIA_STOP_THRESHOLD = 0.01; // deg/frame en dessous duquel l'inertie s'arrête
const GRAZING_THRESHOLD = 0.35; // nz en dessous duquel le contenu d'une face s'estompe

type Vec3 = readonly [number, number, number];

function normalize3([x, y, z]: Vec3): Vec3 {
  const len = Math.sqrt(x * x + y * y + z * z) || 1;
  return [x / len, y / len, z / len];
}
const LIGHT_DIR = normalize3([0.4, 0.5, 0.75]);

function rotateYX([x, y, z]: Vec3, yawDeg: number, pitchDeg: number): Vec3 {
  const yaw = (yawDeg * Math.PI) / 180;
  const pitch = (pitchDeg * Math.PI) / 180;
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const x1 = x * cosY + z * sinY;
  const y1 = y;
  const z1 = -x * sinY + z * cosY;
  const cosX = Math.cos(pitch);
  const sinX = Math.sin(pitch);
  const y2 = y1 * cosX - z1 * sinX;
  const z2 = y1 * sinX + z1 * cosX;
  return [x1, y2, z2];
}

function project([x, y, z]: Vec3): { sx: number; sy: number; depth: number } {
  const depth = CAMERA_DISTANCE - z;
  const scale = FOCAL / depth;
  return { sx: x * scale, sy: -y * scale, depth };
}

function dot3([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): number {
  return ax * bx + ay * by + az * bz;
}

function mixColor(hex: string, brightness: number): string {
  const clamped = Math.max(0, Math.min(1, brightness));
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const mix = (channel: number) => Math.round(Math.max(0, Math.min(255, channel * clamped)));
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

// Indices dans LOCAL_VERTICES : 0..3 face arrière (z-), 4..7 face avant (z+).
type FaceName = "couverture" | "quatrieme" | "dos" | "tranche" | "haut" | "bas";

type TextureField = "couvertureImage" | "quatriemeImage" | "dosImage";

type FaceDef = {
  name: FaceName;
  indices: readonly [number, number, number, number];
  normal: Vec3;
  fallbackColor: string;
  texture?: { field: TextureField; topLeft: number; topRight: number; bottomLeft: number };
};

const FACES: readonly FaceDef[] = [
  {
    name: "couverture",
    indices: [4, 5, 6, 7],
    normal: [0, 0, 1],
    fallbackColor: "#F0E9DC",
    texture: { field: "couvertureImage", topLeft: 7, topRight: 6, bottomLeft: 4 },
  },
  {
    name: "quatrieme",
    indices: [1, 0, 3, 2],
    normal: [0, 0, -1],
    fallbackColor: "#F0E9DC",
    texture: { field: "quatriemeImage", topLeft: 2, topRight: 3, bottomLeft: 1 },
  },
  {
    name: "dos",
    indices: [0, 4, 7, 3],
    normal: [-1, 0, 0],
    fallbackColor: "#D9C7A8",
    texture: { field: "dosImage", topLeft: 3, topRight: 7, bottomLeft: 0 },
  },
  { name: "tranche", indices: [5, 1, 2, 6], normal: [1, 0, 0], fallbackColor: "#FBF8F2" },
  { name: "haut", indices: [7, 6, 2, 3], normal: [0, 1, 0], fallbackColor: "#FBF8F2" },
  { name: "bas", indices: [0, 1, 5, 4], normal: [0, -1, 0], fallbackColor: "#FBF8F2" },
];

export type BookSolidProps = {
  title: string;
  couvertureImage?: string;
  quatriemeImage?: string;
  dosImage?: string;
  epaisseurMm?: number;
};

/**
 * Livre en volume par projection SVG (pas de CSS 3D — les faces sont des
 * polygones SVG dérivés des 8 sommets, pas des <div> "soudées"). Rotation
 * libre à la souris/au toucher, inertie, flèches clavier, bouton
 * "Redresser". Sans image sur une face, aplat coloré teinté par
 * l'éclairage.
 */
export function BookSolid({
  title,
  couvertureImage,
  quatriemeImage,
  dosImage,
  epaisseurMm,
}: BookSolidProps) {
  const t = useTranslations("solid");
  const halfDepth = ((epaisseurMm ?? DEFAULT_EPAISSEUR_MM) * UNITS_PER_MM) / 2;

  const localVertices = useMemo<Vec3[]>(
    () => [
      [-HALF_W, -HALF_H, -halfDepth],
      [HALF_W, -HALF_H, -halfDepth],
      [HALF_W, HALF_H, -halfDepth],
      [-HALF_W, HALF_H, -halfDepth],
      [-HALF_W, -HALF_H, halfDepth],
      [HALF_W, -HALF_H, halfDepth],
      [HALF_W, HALF_H, halfDepth],
      [-HALF_W, HALF_H, halfDepth],
    ],
    [halfDepth],
  );

  const [yaw, setYaw] = useState(INITIAL_YAW);
  const [pitch, setPitch] = useState(INITIAL_PITCH);

  const dragRef = useRef<{ lastX: number; lastY: number } | null>(null);
  const velocityRef = useRef({ yaw: 0, pitch: 0 });
  const inertiaFrameRef = useRef<number | null>(null);

  const stopInertia = useCallback(() => {
    if (inertiaFrameRef.current !== null) {
      cancelAnimationFrame(inertiaFrameRef.current);
      inertiaFrameRef.current = null;
    }
  }, []);

  const runInertia = useCallback(() => {
    stopInertia();
    function step() {
      const v = velocityRef.current;
      if (Math.abs(v.yaw) < INERTIA_STOP_THRESHOLD && Math.abs(v.pitch) < INERTIA_STOP_THRESHOLD) {
        inertiaFrameRef.current = null;
        return;
      }
      setYaw((prev) => prev + v.yaw);
      setPitch((prev) => prev + v.pitch);
      v.yaw *= INERTIA_DECAY;
      v.pitch *= INERTIA_DECAY;
      inertiaFrameRef.current = requestAnimationFrame(step);
    }
    inertiaFrameRef.current = requestAnimationFrame(step);
  }, [stopInertia]);

  useEffect(() => stopInertia, [stopInertia]);

  function handlePointerDown(event: React.PointerEvent<SVGSVGElement>) {
    (event.target as Element).setPointerCapture?.(event.pointerId);
    stopInertia();
    velocityRef.current = { yaw: 0, pitch: 0 };
    dragRef.current = { lastX: event.clientX, lastY: event.clientY };
  }

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.lastX;
    const dy = event.clientY - drag.lastY;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;

    const deltaYaw = dx * DRAG_SENSITIVITY;
    const deltaPitch = dy * DRAG_SENSITIVITY;
    setYaw((prev) => prev + deltaYaw);
    setPitch((prev) => prev + deltaPitch);
    velocityRef.current = { yaw: deltaYaw, pitch: deltaPitch };
  }

  function handlePointerUp() {
    if (!dragRef.current) return;
    dragRef.current = null;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      velocityRef.current = { yaw: 0, pitch: 0 };
    } else {
      runInertia();
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<SVGSVGElement>) {
    stopInertia();
    velocityRef.current = { yaw: 0, pitch: 0 };
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setYaw((prev) => prev - KEY_STEP_DEG);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setYaw((prev) => prev + KEY_STEP_DEG);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setPitch((prev) => prev - KEY_STEP_DEG);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setPitch((prev) => prev + KEY_STEP_DEG);
    }
  }

  function straighten() {
    stopInertia();
    velocityRef.current = { yaw: 0, pitch: 0 };
    setYaw(0);
    setPitch(0);
  }

  const images: Record<TextureField, string | undefined> = {
    couvertureImage,
    quatriemeImage,
    dosImage,
  };

  const rotatedVertices = localVertices.map((v) => rotateYX(v, yaw, pitch));
  const projected = rotatedVertices.map((v) => project(v));

  const visibleFaces = FACES.map((face) => {
    const rotatedNormal = rotateYX(face.normal, yaw, pitch);
    const nz = rotatedNormal[2];
    const avgDepth =
      face.indices.reduce((sum, i) => sum + rotatedVertices[i][2], 0) / face.indices.length;
    const brightness = AMBIENT + DIFFUSE * Math.max(0, dot3(rotatedNormal, LIGHT_DIR));
    return { face, nz, avgDepth, brightness };
  })
    .filter(({ nz }) => nz > 0)
    .sort((a, b) => a.avgDepth - b.avgDepth);

  return (
    <div className="flex flex-col items-start gap-3">
      <svg
        role="img"
        aria-label={t("label")}
        tabIndex={0}
        viewBox={`${-VIEWBOX_W / 2} ${-VIEWBOX_H / 2} ${VIEWBOX_W} ${VIEWBOX_H}`}
        className="w-full max-w-sm touch-none select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        {visibleFaces.map(({ face, nz, brightness }) => {
          const points = face.indices
            .map((i) => `${projected[i].sx},${projected[i].sy}`)
            .join(" ");
          const litColor = mixColor(face.fallbackColor, brightness);
          const texture = face.texture;
          const imageSrc = texture ? images[texture.field] : undefined;

          return (
            <g key={face.name}>
              {/* fill ET stroke de la même couleur, pour supprimer les
                  interstices d'anticrénelage entre polygones adjacents. */}
              <polygon
                points={points}
                fill={litColor}
                stroke={litColor}
                strokeWidth={STROKE_WIDTH}
                strokeLinejoin="round"
              />
              {texture && imageSrc && (
                <FaceTexture
                  src={imageSrc}
                  topLeft={projected[texture.topLeft]}
                  topRight={projected[texture.topRight]}
                  bottomLeft={projected[texture.bottomLeft]}
                  localW={face.name === "dos" ? halfDepth * 2 : HALF_W * 2}
                  localH={HALF_H * 2}
                  opacity={Math.max(0, Math.min(1, nz / GRAZING_THRESHOLD))}
                  title={title}
                />
              )}
            </g>
          );
        })}
      </svg>

      <button
        type="button"
        onClick={straighten}
        className="rounded-md border border-sable-300 px-4 py-2 text-sm text-nuit-900 hover:border-or-500"
      >
        {t("straighten")}
      </button>
    </div>
  );
}

function FaceTexture({
  src,
  topLeft,
  topRight,
  bottomLeft,
  localW,
  localH,
  opacity,
  title,
}: {
  src: string;
  topLeft: { sx: number; sy: number };
  topRight: { sx: number; sy: number };
  bottomLeft: { sx: number; sy: number };
  localW: number;
  localH: number;
  opacity: number;
  title: string;
}) {
  // Matrice affine dérivée de 3 des 4 coins projetés (origine + deux
  // vecteurs de base) — approximation affine assumée par la spec, pas une
  // correction perspective par pixel.
  const a = (topRight.sx - topLeft.sx) / localW;
  const b = (topRight.sy - topLeft.sy) / localW;
  const c = (bottomLeft.sx - topLeft.sx) / localH;
  const d = (bottomLeft.sy - topLeft.sy) / localH;
  const e = topLeft.sx;
  const f = topLeft.sy;
  const clipId = useId();

  return (
    <g transform={`matrix(${a} ${b} ${c} ${d} ${e} ${f})`} opacity={opacity}>
      <clipPath id={clipId}>
        <rect x={0} y={0} width={localW} height={localH} />
      </clipPath>
      <image
        href={src}
        x={0}
        y={0}
        width={localW}
        height={localH}
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clipId})`}
      >
        <title>{title}</title>
      </image>
    </g>
  );
}
