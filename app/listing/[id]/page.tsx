import ListingDetailPage from '@/components/pages/host/listing-detail';
import AppLayout from '@/components/layout/app-layout';
import { constructMetadata } from "@/lib/metadata";
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  // In a real app we would fetch the listing title here.
  // For MVP/Demo with local data, we can just use a generic title or "Listing Details".
  // If we really want dynamic titles, we'd need to bypass the API client and hit Prisma directly or use fetch() to localhost (tricky in build).
  // Given this is an MVP, generic dynamic metadata is acceptable.
  return constructMetadata({
    title: `Listing Details | Hoster`,
    description: "View and manage your property details, photos, and amenities."
  });
}

export default function Page() {
  return (
    <AppLayout>
      <ListingDetailPage />
    </AppLayout>
  );
}
