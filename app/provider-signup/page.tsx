import { redirect } from "next/navigation";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Provider Company Signup | Hoster",
  description: "Sign up your provider company account for review and approval.",
  noIndex: true,
});

export default function Page() {
  redirect("/provider/company-signup");
}
