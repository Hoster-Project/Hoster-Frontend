"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[]; // e.g., ['admin', 'moderator']
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (!allowedRoles.includes(user.role)) {
        // Logged in but wrong role
        if (user.role === "admin" && !window.location.pathname.startsWith("/admin")) {
          router.push("/admin");
        } else if (user.role === "provider" && !window.location.pathname.startsWith("/provider")) {
          router.push("/provider");
        } else if (user.role === "host" && !window.location.pathname.startsWith("/dashboard")) {
          router.push("/dashboard");
        }
        // If none of the above match, or if they are already on the target page but still don't have access,
        // we do NOT redirect to avoid loops. We let the component render the "Unauthorized" state below.
      }
    } else if (!isLoading && !user) {
       router.push("/");
    }
  }, [user, isLoading, router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Prevent flash of unauthorized content while redirecting
  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
