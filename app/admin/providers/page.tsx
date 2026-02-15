import dynamic from "next/dynamic";
import { constructMetadata } from "@/lib/metadata";
import { Loader2 } from "lucide-react";

const AdminProviders = dynamic(() => import("@/components/pages/admin/admin-providers"), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

export const metadata = constructMetadata({
  title: "Service Providers | Hoster Admin",
  description: "Manage service provider registrations and promotions.",
  noIndex: true,
});

export default function Page() {
  return <AdminProviders />;
}
