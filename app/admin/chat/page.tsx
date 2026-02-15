import dynamic from "next/dynamic";
import { constructMetadata } from "@/lib/metadata";
import { Loader2 } from "lucide-react";

const AdminChat = dynamic(() => import("@/components/pages/admin/admin-chat"), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

export const metadata = constructMetadata({
  title: "Support Chat | Hoster Admin",
  description: "View and respond to user support messages.",
  noIndex: true,
});

export default function Page() {
  return <AdminChat />;
}
