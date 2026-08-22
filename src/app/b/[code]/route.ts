import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

// Placeholder lookup table for Phase 1 — no database yet.
// Maps a QR-code identifier to the (locale-prefixed) bonus page it redirects to.
const BONUS_TARGETS: Record<string, string> = {
  demo: `/${routing.defaultLocale}`,
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const target = BONUS_TARGETS[code] ?? `/${routing.defaultLocale}`;

  return NextResponse.redirect(new URL(target, request.url), 302);
}
