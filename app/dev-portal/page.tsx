import DevPortal from '@/components/pages/dev-portal';
import AppLayout from '@/components/layout/app-layout';
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Developer Portal | Hoster",
  description: "API documentation, webhooks, and developer tools for Hoster integrations.",
  noIndex: true,
});

export default function Page() {
  return (
    <AppLayout>
      <DevPortal />
    </AppLayout>
  );
}
