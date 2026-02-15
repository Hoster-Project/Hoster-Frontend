import dynamic from "next/dynamic";
import { constructMetadata } from "@/lib/metadata";
import { Loader2 } from "lucide-react";

const AdminCleaning = dynamic(() => import("@/components/pages/admin/admin-cleaning"), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

export const metadata = constructMetadata({
  title: "Cleaning Management | Hoster",
  description: "Manage cleaning tasks, providers, and reports.",
  noIndex: true,
});

export default function Page() {
  return <AdminCleaning />;
}
