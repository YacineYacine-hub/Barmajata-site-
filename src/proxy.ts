import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Runs on every path except: api routes, Next internals, the QR-code
  // redirect (/b/...), the generated sitemap/robots files, and files with
  // an extension (static assets). Those are intentionally kept outside the
  // locale-prefixed routing scheme.
  matcher: ["/((?!api|_next|_vercel|b/|sitemap\\.xml|robots\\.txt|.*\\..*).*)"],
};
