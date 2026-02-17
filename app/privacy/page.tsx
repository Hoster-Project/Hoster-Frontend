import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function PrivacyBody() {
  return (
    <div className="space-y-6 text-sm">
      <section>
        <h3 className="font-semibold text-base mb-2">1. Introduction</h3>
        <p className="text-muted-foreground leading-relaxed">
          This Privacy Policy explains how Hoster collects, uses, stores, and
          protects personal and business data when you use our Service.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">
          2. Information We Collect
        </h3>

        <div className="space-y-3 mt-3">
          <div>
            <h4 className="font-medium mb-1">A. Account Information</h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Company details</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-1">B. Property & Operational Data</h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Property and unit information</li>
              <li>Reservations and booking data</li>
              <li>Availability and calendar data</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-1">
              C. Guest Data (Host-Provided or Platform-Authorized)
            </h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Guest names</li>
              <li>Contact details</li>
              <li>Stay details</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-1">D. Provider Data</h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Company profiles</li>
              <li>Task completion data</li>
              <li>Reviews and ratings</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-1">E. Technical Data</h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>IP address</li>
              <li>Device and browser information</li>
              <li>Usage logs</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">
          3. How We Use Information
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-2">
          We use data to:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
          <li>Provide and operate the Service</li>
          <li>Sync bookings and availability</li>
          <li>Enable communication and automation</li>
          <li>Improve performance and reliability</li>
          <li>Provide support and system notifications</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">4. Data Sharing</h3>
        <p className="text-muted-foreground leading-relaxed mb-2">
          We may share data with:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
          <li>Connected third-party platforms (authorized by you)</li>
          <li>Service providers involved in your operations</li>
          <li>Infrastructure providers (hosting, email, analytics)</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mt-2 font-medium">
          We do not sell personal data.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">
          5. Data Storage & Security
        </h3>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
          <li>Data is stored on secure servers</li>
          <li>Access is restricted and logged</li>
          <li>Industry-standard security practices are applied</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mt-2">
          No system is 100% secure, but we take reasonable measures to protect
          data.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">6. Data Retention</h3>
        <p className="text-muted-foreground leading-relaxed mb-2">
          We retain data only as long as necessary to:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
          <li>Provide the Service</li>
          <li>Meet legal and regulatory requirements</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mt-2">
          You may request deletion of your account data, subject to legal
          obligations.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">7. User Rights</h3>
        <p className="text-muted-foreground leading-relaxed mb-2">
          Depending on your jurisdiction, you may have rights to:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
          <li>Access your data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion</li>
          <li>Object to processing</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">8. Cookies & Tracking</h3>
        <p className="text-muted-foreground leading-relaxed mb-2">
          Hoster may use cookies or similar technologies to:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
          <li>Maintain sessions</li>
          <li>Improve user experience</li>
          <li>Analyze usage</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mt-2">
          You can control cookies via your browser settings.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">9. Third-Party Links</h3>
        <p className="text-muted-foreground leading-relaxed">
          Our Service may contain links to third-party services. We are not
          responsible for their privacy practices.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">
          10. International Data Transfers
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          Data may be processed in countries outside your own, subject to
          appropriate safeguards.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">
          11. Changes to This Policy
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          We may update this Privacy Policy from time to time. Material changes
          will be communicated via the Service or email.
        </p>
      </section>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <span className="text-lg font-semibold text-black">Hoster</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Card>
          <CardContent className="p-6 sm:p-8">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-2">
                <ShieldCheck className="h-7 w-7 text-muted-foreground" />
                Privacy Policy
              </h1>
              <p className="text-sm text-muted-foreground">
                Last updated: 15/02/2026
              </p>
            </div>

            <PrivacyBody />

            <div className="mt-12 pt-8 border-t">
              <h3 className="font-semibold text-base mb-2">12. Contact</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For privacy-related questions or requests:
                <br />
                <Mail className="h-4 w-4 text-muted-foreground inline-block mr-2 align-text-bottom" />
                <a
                  href="mailto:support@tryhoster.com"
                  className="text-black hover:underline"
                >
                  support@tryhoster.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

