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
const HOST_APP_PREFIXES = [
  "/dashboard",
  "/calendar",
  "/channels",
  "/chat",
  "/community-questions",
  "/inbox",
  "/listing",
  "/notifications",
  "/profile",
  "/settings",
  "/support-chat",
  "/dev-portal",
  "/login",
  "/signup",
];

function getHostParts(hostHeader: string | null): string[] {
  if (!hostHeader) return [];
  return hostHeader.split(":")[0].toLowerCase().split(".");
}

function getSubdomain(hostHeader: string | null): string | null {
  const parts = getHostParts(hostHeader);
  if (parts.length < 2) return null;
  return parts[0] || null;
}

function getBaseDomain(hostHeader: string | null): string | null {
  const parts = getHostParts(hostHeader);
  if (parts.length < 3) return null;
  return parts.slice(1).join(".");
}

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.includes(pathname)) return true;
  if (PUBLIC_PAGES.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isHostPortalPath(pathname: string): boolean {
  return HOST_APP_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function stripPrefix(pathname: string, prefix: string): string {
  if (pathname === prefix) return "/";
  if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  return pathname;
}

function redirectTo(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

function redirectToSubdomain(req: NextRequest, subdomain: string, pathname: string) {
  const baseDomain = getBaseDomain(req.headers.get("host"));
  if (!baseDomain) return redirectTo(req, pathname);
  const url = req.nextUrl.clone();
  url.hostname = `${subdomain}.${baseDomain}`;
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

function rewriteTo(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.rewrite(url);
}

function toAdminInternal(pathname: string): string {
  if (pathname === "/") return "/admin";
  if (pathname === "/login") return "/admin/login";
  if (pathname === "/admin-login") return "/admin/admin-login";
  return `/admin${pathname}`;
}

function toProviderInternal(pathname: string): string {
  if (pathname === "/") return "/provider";
  if (pathname === "/login") return "/provider/login";
  if (pathname === "/signup") return "/provider/signup";
  if (pathname === "/company-signup") return "/provider/company-signup";
  return `/provider${pathname}`;
}

export function middleware(req: NextRequest) {
  const hostHeader = req.headers.get("host");
  const subdomain = getSubdomain(hostHeader);
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) return NextResponse.next();

  if (subdomain === ADMIN_SUBDOMAIN) {
    if (pathname.startsWith("/provider")) {
      return redirectToSubdomain(req, PROVIDER_SUBDOMAIN, stripPrefix(pathname, "/provider"));
    }
    if (pathname.startsWith("/admin")) {
      return redirectTo(req, stripPrefix(pathname, "/admin"));
    }
    if (isHostPortalPath(pathname)) {
      return redirectToSubdomain(req, HOST_SUBDOMAIN, pathname);
    }
    return rewriteTo(req, toAdminInternal(pathname));
  }

  if (subdomain === PROVIDER_SUBDOMAIN) {
    if (pathname.startsWith("/admin")) {
      return redirectToSubdomain(req, ADMIN_SUBDOMAIN, stripPrefix(pathname, "/admin"));
    }
    if (pathname.startsWith("/provider")) {
      return redirectTo(req, stripPrefix(pathname, "/provider"));
    }
    if (isHostPortalPath(pathname)) {
      return redirectToSubdomain(req, HOST_SUBDOMAIN, pathname);
    }
    return rewriteTo(req, toProviderInternal(pathname));
  }

  if (subdomain === HOST_SUBDOMAIN) {
    if (pathname === "/") return redirectTo(req, "/dashboard");
    if (pathname.startsWith("/admin")) {
      return redirectToSubdomain(req, ADMIN_SUBDOMAIN, stripPrefix(pathname, "/admin"));
    }
    if (pathname.startsWith("/provider")) {
      return redirectToSubdomain(req, PROVIDER_SUBDOMAIN, stripPrefix(pathname, "/provider"));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    return redirectToSubdomain(req, ADMIN_SUBDOMAIN, stripPrefix(pathname, "/admin"));
  }

  if (pathname.startsWith("/provider")) {
    return redirectToSubdomain(req, PROVIDER_SUBDOMAIN, stripPrefix(pathname, "/provider"));
  }

  if (isHostPortalPath(pathname)) {
    return redirectToSubdomain(req, HOST_SUBDOMAIN, pathname);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
