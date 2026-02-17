import dynamic from "next/dynamic";
import { constructMetadata } from "@/lib/metadata";
import { Loader2 } from "lucide-react";

const AdminLogin = dynamic(() => import("@/components/pages/admin/admin-login"), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

export const metadata = constructMetadata({
  title: "Admin Login | Hoster",
  description: "Sign in to the Hoster admin panel.",
  noIndex: true,
});

export default function Page() {
  return <AdminLogin />;
}
