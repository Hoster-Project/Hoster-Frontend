import dynamic from "next/dynamic";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Marketplace Admin | Hoster",
  description: "Manage marketplace employees, requests, approvals, and company settings.",
});

const AdminMarketplace = dynamic(() => import("@/components/pages/admin/admin-marketplace"), {
  loading: () => <div className="p-6">Loading...</div>,
});

export default function Page() {
  return <AdminMarketplace />;
}
