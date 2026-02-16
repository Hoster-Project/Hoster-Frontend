import AppLayout from "@/components/layout/app-layout";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Privacy Policy | Hoster",
  description: "Privacy policy for using Hoster.",
  noIndex: true,
});

export default function PrivacyPage() {
  return (
    <AppLayout>
      <div className="px-4 py-6 pb-16">
        <h1 className="text-2xl font-extrabold tracking-tight text-primary">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Last updated: February 16, 2026
        </p>

        {/* TODO: Replace placeholder content when client provides final documents. */}
        <div className="prose prose-sm dark:prose-invert max-w-none mt-6">
          <h2>1. Information We Collect</h2>
          <p>[Content to be provided by client]</p>
          <h2>2. How We Use Information</h2>
          <p>[Content to be provided by client]</p>
          <h2>3. Sharing</h2>
          <p>[Content to be provided by client]</p>
          <h2>4. Security</h2>
          <p>[Content to be provided by client]</p>
          <h2>5. Your Rights</h2>
          <p>[Content to be provided by client]</p>
        </div>
      </div>
    </AppLayout>
  );
}
