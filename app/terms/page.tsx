import AppLayout from "@/components/layout/app-layout";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Terms & Conditions | Hoster",
  description: "Terms and conditions for using Hoster.",
  noIndex: true,
});

export default function TermsPage() {
  return (
    <AppLayout>
      <div className="px-4 py-6 pb-16">
        <h1 className="text-2xl font-extrabold tracking-tight text-primary">
          Terms &amp; Conditions
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Last updated: February 16, 2026
        </p>

        {/* TODO: Replace placeholder content when client provides final documents. */}
        <div className="prose prose-sm dark:prose-invert max-w-none mt-6">
          <h2>1. Acceptance</h2>
          <p>[Content to be provided by client]</p>
          <h2>2. Use of Service</h2>
          <p>[Content to be provided by client]</p>
          <h2>3. Accounts</h2>
          <p>[Content to be provided by client]</p>
          <h2>4. Liability</h2>
          <p>[Content to be provided by client]</p>
          <h2>5. Contact</h2>
          <p>[Content to be provided by client]</p>
        </div>
      </div>
    </AppLayout>
  );
}
