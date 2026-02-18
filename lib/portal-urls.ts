const ADMIN_SUBDOMAIN = process.env.NEXT_PUBLIC_PORTAL_ADMIN_SUBDOMAIN || "admin";
const PROVIDER_SUBDOMAIN = process.env.NEXT_PUBLIC_PORTAL_PROVIDER_SUBDOMAIN || "provider";
const HOST_SUBDOMAIN = process.env.NEXT_PUBLIC_PORTAL_HOST_SUBDOMAIN || "hoster";
const KNOWN_PORTAL_SUBDOMAINS = new Set([ADMIN_SUBDOMAIN, PROVIDER_SUBDOMAIN, HOST_SUBDOMAIN]);

export function getLandingUrl(): string {
  if (typeof window === "undefined") return "/";

  const protocol = window.location.protocol || "https:";
  const parts = window.location.hostname.toLowerCase().split(".");
  if (parts.length < 2) return "/";

  let envPrefix: string | null = null;
  let rootDomain: string | null = null;

  if (parts.length >= 4 && KNOWN_PORTAL_SUBDOMAINS.has(parts[1])) {
    envPrefix = parts[0];
    rootDomain = parts.slice(2).join(".");
  } else if (parts.length >= 3 && KNOWN_PORTAL_SUBDOMAINS.has(parts[0])) {
    rootDomain = parts.slice(1).join(".");
  } else if (parts.length >= 3) {
    envPrefix = parts[0];
    rootDomain = parts.slice(1).join(".");
  }

  if (!rootDomain) return "/";

  return envPrefix
    ? `${protocol}//${envPrefix}.${rootDomain}/`
    : `${protocol}//${rootDomain}/`;
}
