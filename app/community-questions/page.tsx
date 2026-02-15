import CommunityQuestionsPage from '@/components/pages/community-questions';
import AppLayout from '@/components/layout/app-layout';
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Community Q&A | Hoster",
  description: "Ask questions and share knowledge with the Hoster community.",
  noIndex: true,
});

export default function Page() {
  return (
    <AppLayout>
      <CommunityQuestionsPage />
    </AppLayout>
  );
}
