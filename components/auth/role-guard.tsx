"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[]; // e.g., ['admin', 'moderator']
}

function getBaseDomainFromHostname(hostname: string): string | null {
  const parts = hostname.split(".");
  if (parts.length < 3) return null;
  return parts.slice(1).join(".");
}

function roleHomePath(role: string): string {
  if (role === "admin" || role === "moderator") return "/";
  if (role === "provider" || role === "employee") return "/";
  return "/dashboard";
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

function redirectToRolePortal(role: string): string {
  if (typeof window === "undefined") {
    return role === "host" ? "/dashboard" : "/";
  }

  const sub = roleSubdomain(role);
  const base = getBaseDomainFromHostname(window.location.hostname);
  const path = roleHomePath(role);

  if (!sub || !base) {
    if (role === "admin" || role === "moderator") return "/admin";
    if (role === "provider" || role === "employee") return "/provider";
    return "/dashboard";
  }

  const protocol = window.location.protocol || "https:";
  return `${protocol}//${sub}.${base}${path}`;
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
