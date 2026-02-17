import { NextRequest, NextResponse } from "next/server";

const ADMIN_SUBDOMAIN = process.env.PORTAL_ADMIN_SUBDOMAIN || "admin";
const PROVIDER_SUBDOMAIN = process.env.PORTAL_PROVIDER_SUBDOMAIN || "provider";
const HOST_SUBDOMAIN = process.env.PORTAL_HOST_SUBDOMAIN || "hoster";

const PUBLIC_PREFIXES = [
  "/_next",
  "/api",
  "/uploads",
  "/auth",
  "/verify-email",
  "/set-password",
  "/terms",
  "/privacy",
];

const PUBLIC_EXACT = ["/favicon.ico", "/robots.txt", "/sitemap.xml"];
const PUBLIC_PAGES = ["/provider-signup"];

function getSubdomain(hostHeader: string | null): string | null {
  if (!hostHeader) return null;
  const host = hostHeader.split(":")[0].toLowerCase();
  const parts = host.split(".");
  if (parts.length < 2) return null;
  return parts[0] || null;
}

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.includes(pathname)) return true;
  if (PUBLIC_PAGES.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function redirectTo(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

export function middleware(req: NextRequest) {
  const subdomain = getSubdomain(req.headers.get("host"));
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) return NextResponse.next();

  if (subdomain === ADMIN_SUBDOMAIN) {
    if (pathname === "/") return redirectTo(req, "/admin");
    if (!pathname.startsWith("/admin")) return redirectTo(req, "/admin");
    return NextResponse.next();
  }

  if (subdomain === PROVIDER_SUBDOMAIN) {
    if (pathname === "/") return redirectTo(req, "/provider");
    if (!pathname.startsWith("/provider")) return redirectTo(req, "/provider");
    return NextResponse.next();
  }

  if (subdomain === HOST_SUBDOMAIN) {
    if (pathname.startsWith("/admin") || pathname.startsWith("/provider")) {
      return redirectTo(req, "/");
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
