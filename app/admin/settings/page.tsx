import dynamic from "next/dynamic";
import { constructMetadata } from "@/lib/metadata";
import { Loader2 } from "lucide-react";

const AdminSettings = dynamic(() => import("@/components/pages/admin/admin-settings"), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

export const metadata = constructMetadata({
  title: "Admin Settings | Hoster",
  description: "Configure platform settings and system preferences.",
  noIndex: true,
});

export default function Page() {
  return <AdminSettings />;
}
