import dynamic from "next/dynamic";
import { constructMetadata } from "@/lib/metadata";
import { Loader2 } from "lucide-react";

const AdminFinance = dynamic(() => import("@/components/pages/admin/admin-finance"), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

export const metadata = constructMetadata({
  title: "Finance | Hoster Admin",
  description: "Financial overview, revenue tracking, and payment management.",
  noIndex: true,
});

export default function Page() {
  return <AdminFinance />;
}
