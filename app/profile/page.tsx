import dynamic from "next/dynamic";
import AppLayout from "@/components/layout/app-layout";
import { constructMetadata } from "@/lib/metadata";
import { Loader2 } from "lucide-react";

const ProfilePage = dynamic(() => import("@/components/pages/profile"), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

export const metadata = constructMetadata({
  title: "Edit Profile | Hoster",
  description: "Update your profile information, avatar, and account settings.",
  noIndex: true,
});

export default function Page() {
  return (
    <AppLayout>
      <ProfilePage />
    </AppLayout>
  );
}
