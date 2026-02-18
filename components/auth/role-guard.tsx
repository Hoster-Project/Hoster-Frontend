"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[]; // e.g., ['admin', 'moderator']
}

function roleSubdomain(role: string): string | null {
  const adminSub = process.env.NEXT_PUBLIC_PORTAL_ADMIN_SUBDOMAIN || "admin";
  const providerSub = process.env.NEXT_PUBLIC_PORTAL_PROVIDER_SUBDOMAIN || "provider";
  const hostSub = process.env.NEXT_PUBLIC_PORTAL_HOST_SUBDOMAIN || "hoster";

  if (role === "admin" || role === "moderator") return adminSub;
  if (role === "provider" || role === "employee") return providerSub;
  if (role === "host") return hostSub;
  return null;
}

function roleHomePath(role: string): string {
  if (role === "admin" || role === "moderator") return "/";
  if (role === "provider" || role === "employee") return "/";
  return "/dashboard";
}

function buildPortalOriginFromHostname(hostname: string, targetSubdomain: string): string | null {
  const adminSub = process.env.NEXT_PUBLIC_PORTAL_ADMIN_SUBDOMAIN || "admin";
  const providerSub = process.env.NEXT_PUBLIC_PORTAL_PROVIDER_SUBDOMAIN || "provider";
  const hostSub = process.env.NEXT_PUBLIC_PORTAL_HOST_SUBDOMAIN || "hoster";
  const knownPortalSubs = new Set([adminSub, providerSub, hostSub]);

  const parts = hostname.toLowerCase().split(".");
  if (parts.length < 2) return null;

  let envPrefix: string | null = null;
  let rootDomain: string | null = null;

  if (parts.length >= 4 && knownPortalSubs.has(parts[1])) {
    envPrefix = parts[0];
    rootDomain = parts.slice(2).join(".");
  } else if (parts.length >= 3 && knownPortalSubs.has(parts[0])) {
    rootDomain = parts.slice(1).join(".");
  } else if (parts.length >= 3) {
    envPrefix = parts[0];
    rootDomain = parts.slice(1).join(".");
  }

  if (!rootDomain) return null;
  return envPrefix
    ? `${window.location.protocol}//${envPrefix}.${targetSubdomain}.${rootDomain}`
    : `${window.location.protocol}//${targetSubdomain}.${rootDomain}`;
}

function redirectToRolePortal(role: string): string {
  if (typeof window === "undefined") {
    return role === "host" ? "/dashboard" : "/";
  }

  const targetSub = roleSubdomain(role);
  const path = roleHomePath(role);

  if (!targetSub) return "/";

  const origin = buildPortalOriginFromHostname(window.location.hostname, targetSub);
  if (!origin) {
    if (role === "admin" || role === "moderator") return "/admin";
    if (role === "provider" || role === "employee") return "/provider";
    return "/dashboard";
  }

  return `${origin}${path}`;
}

function loginPathForAllowedRoles(): string {
  return "/login";
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const verified = Boolean(user.emailVerified) || Boolean(user.emailVerifiedAt);
      if (!verified) {
        if (!window.location.pathname.startsWith("/verify-email")) {
          router.push("/verify-email");
        }
        return;
      }

      if (!allowedRoles.includes(user.role)) {
        const target = redirectToRolePortal(user.role);
        if (/^https?:\/\//i.test(target)) {
          window.location.assign(target);
        } else {
          router.push(target);
        }
      }
    } else if (!isLoading && !user) {
      router.push(loginPathForAllowedRoles());
    }
  }, [user, isLoading, router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const verified = Boolean(user?.emailVerified) || Boolean(user?.emailVerifiedAt);
  if (!user || !verified || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
