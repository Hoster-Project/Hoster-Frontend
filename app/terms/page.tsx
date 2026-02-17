import Link from "next/link";
import { ArrowLeft, FileText, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function TermsBody() {
  return (
    <div className="space-y-6 text-sm">
      <section>
        <h3 className="font-semibold text-base mb-2">1. Introduction</h3>
        <p className="text-muted-foreground leading-relaxed">
          Welcome to Hoster ("Company", "we", "our", "us"). These Terms &
          Conditions ("Terms") govern your access to and use of the Hoster
          platform, including our website, web application, mobile applications,
          and related services (collectively, the "Service").
        </p>
        <p className="text-muted-foreground leading-relaxed mt-2">
          By creating an account or using the Service, you agree to be bound by
          these Terms.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">2. Eligibility</h3>
        <p className="text-muted-foreground leading-relaxed">
          You must be at least 18 years old and legally able to enter into a
          binding agreement to use Hoster. If you use Hoster on behalf of a
          company or organization, you confirm that you have authority to bind
          that entity.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">
          3. Services Description
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-2">
          Hoster is a B2B SaaS platform that helps short-term rental hosts
          manage property operations, including:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
          <li>Booking and availability synchronization</li>
          <li>Guest communication</li>
          <li>Operational automation</li>
          <li>Coordination with cleaning and maintenance service providers</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mt-2">
          Hoster does not own, operate, or rent properties and is not a booking
          marketplace.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">4. Accounts & Access</h3>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
          <li>
            You are responsible for maintaining the confidentiality of your
            login credentials
          </li>
          <li>
            You are responsible for all activities performed under your account
          </li>
          <li>You agree to provide accurate and up-to-date information</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mt-2">
          We reserve the right to suspend or terminate accounts that violate
          these Terms.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">
          5. Integrations & Third-Party Platforms
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-2">
          Hoster integrates with third-party platforms (e.g., booking channels
          and service providers) using authorized APIs. You acknowledge that:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
          <li>
            Third-party platforms are governed by their own terms and policies
          </li>
          <li>
            Hoster is not responsible for outages, errors, or changes caused by
            third-party services
          </li>
          <li>
            You authorize Hoster to access and process data from connected
            platforms on your behalf
          </li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">
          6. Automation & Operational Services
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-2">
          Automation features (including messaging and task creation) are
          provided "as is". You acknowledge that:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
          <li>
            Automation depends on accurate data from third-party platforms
          </li>
          <li>
            Final responsibility for property readiness, guest compliance, and
            service execution remains with the host and service provider
          </li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">
          7. Service Providers (Cleaning & Maintenance)
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-2">
          Hoster may facilitate communication and coordination between hosts and
          service providers. Hoster:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
          <li>Does not guarantee service quality or availability</li>
          <li>Is not a party to agreements between hosts and providers</li>
          <li>Is not responsible for disputes, damages, or service outcomes</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">
          8. Fees & Billing (If Applicable)
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-2">
          Certain features may require payment under a subscription plan.
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
          <li>
            Fees are billed in advance and are non-refundable unless stated
            otherwise
          </li>
          <li>Failure to pay may result in service suspension</li>
          <li>Pricing and plans may change with reasonable notice</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">9. Acceptable Use</h3>
        <p className="text-muted-foreground leading-relaxed mb-2">
          You agree not to:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
          <li>Use the Service for unlawful purposes</li>
          <li>Interfere with system security or performance</li>
          <li>Misuse integrations or data</li>
          <li>Attempt unauthorized access</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mt-2">
          Violation may result in account termination.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">
          10. Intellectual Property
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          All software, content, branding, and materials provided by Hoster are
          owned by or licensed to Hoster. You are granted a limited,
          non-exclusive, non-transferable license to use the Service during your
          subscription.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">11. Data & Privacy</h3>
        <p className="text-muted-foreground leading-relaxed">
          Your use of the Service is subject to our Privacy Policy, which
          explains how we collect and process data.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">
          12. Disclaimer of Warranties
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          The Service is provided "as is" and "as available" without warranties
          of any kind. Hoster does not guarantee uninterrupted or error-free
          operation.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">
          13. Limitation of Liability
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-2">
          To the maximum extent permitted by law, Hoster shall not be liable
          for:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
          <li>Indirect or consequential damages</li>
          <li>Loss of revenue, data, or business</li>
          <li>Third-party platform failures</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">14. Termination</h3>
        <p className="text-muted-foreground leading-relaxed">
          You may stop using the Service at any time. We may suspend or
          terminate access if you violate these Terms.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">15. Governing Law</h3>
        <p className="text-muted-foreground leading-relaxed">
          These Terms are governed by the laws of the Kingdom of Saudi Arabia.
        </p>
      </section>
    </div>
  );
}

export default function TermsPage() {
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
          <span className="text-lg font-semibold text-primary">Hoster</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Card>
          <CardContent className="p-6 sm:p-8">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-2">
                <FileText className="h-7 w-7 text-muted-foreground" />
                Terms & Conditions
              </h1>
              <p className="text-sm text-muted-foreground">
                Last updated: 15/02/2026
              </p>
            </div>

            <TermsBody />

            <div className="mt-12 pt-8 border-t">
              <h3 className="font-semibold text-base mb-2">16. Contact</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For questions regarding these Terms:
                <br />
                <Mail className="h-4 w-4 text-muted-foreground inline-block mr-2 align-text-bottom" />
                <a
                  href="mailto:support@tryhoster.com"
                  className="text-primary hover:underline"
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

