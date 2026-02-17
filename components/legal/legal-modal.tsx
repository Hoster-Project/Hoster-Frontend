import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Mail, ShieldCheck } from "lucide-react";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "terms" | "privacy";
}

export function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {type === "terms" ? (
              <>
                <FileText className="h-5 w-5 text-muted-foreground" />
                Terms & Conditions
              </>
            ) : (
              <>
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                Privacy Policy
              </>
            )}
          </DialogTitle>
          <DialogDescription>Last updated: 15/02/2026</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {type === "terms" ? <TermsContent /> : <PrivacyContent />}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function TermsContent() {
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

      <section>
        <h3 className="font-semibold text-base mb-2">16. Contact</h3>
        <p className="text-muted-foreground leading-relaxed">
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
      </section>
    </div>
  );
}

function PrivacyContent() {
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
        <p className="text-muted-foreground leading-relaxed mt-2">
          Requests can be sent to{" "}
          <a
            href="mailto:support@tryhoster.com"
            className="text-primary hover:underline"
          >
            support@tryhoster.com
          </a>
        </p>
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

      <section>
        <h3 className="font-semibold text-base mb-2">12. Contact</h3>
        <p className="text-muted-foreground leading-relaxed">
          For privacy-related questions or requests:
          <br />
          <Mail className="h-4 w-4 text-muted-foreground inline-block mr-2 align-text-bottom" />
          <a
            href="mailto:support@tryhoster.com"
            className="text-primary hover:underline"
          >
            support@tryhoster.com
          </a>
        </p>
      </section>
    </div>
  );
}
