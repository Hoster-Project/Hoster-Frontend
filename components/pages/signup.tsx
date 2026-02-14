import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";

const SignupSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  country: Yup.string(),
  phone: Yup.string(),
  agreeTerms: Yup.boolean().oneOf([true], "You must agree to the terms and privacy policy"),
});

const COUNTRIES: Array<{ name: string; code: string; dial: string }> = [
  { name: "Australia", code: "AU", dial: "+61" },
  { name: "Bahrain", code: "BH", dial: "+973" },
  { name: "Brazil", code: "BR", dial: "+55" },
  { name: "Canada", code: "CA", dial: "+1" },
  { name: "Croatia", code: "HR", dial: "+385" },
  { name: "Egypt", code: "EG", dial: "+20" },
  { name: "France", code: "FR", dial: "+33" },
  { name: "Germany", code: "DE", dial: "+49" },
  { name: "Greece", code: "GR", dial: "+30" },
  { name: "Indonesia", code: "ID", dial: "+62" },
  { name: "Italy", code: "IT", dial: "+39" },
  { name: "Japan", code: "JP", dial: "+81" },
  { name: "Jordan", code: "JO", dial: "+962" },
  { name: "Kuwait", code: "KW", dial: "+965" },
  { name: "Mexico", code: "MX", dial: "+52" },
  { name: "Netherlands", code: "NL", dial: "+31" },
  { name: "New Zealand", code: "NZ", dial: "+64" },
  { name: "Portugal", code: "PT", dial: "+351" },
  { name: "Qatar", code: "QA", dial: "+974" },
  { name: "Saudi Arabia", code: "SA", dial: "+966" },
  { name: "South Africa", code: "ZA", dial: "+27" },
  { name: "Spain", code: "ES", dial: "+34" },
  { name: "Thailand", code: "TH", dial: "+66" },
  { name: "Turkey", code: "TR", dial: "+90" },
  { name: "United Arab Emirates", code: "AE", dial: "+971" },
  { name: "United Kingdom", code: "GB", dial: "+44" },
  { name: "United States", code: "US", dial: "+1" },
  { name: "Other", code: "OT", dial: "" },
];

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      const resData = await res.json();
      await apiRequest("POST", "/api/auth/logout");
      return resData;
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Account created",
        description: "Please log in with your new account.",
      });
      router.push("/login");
    },
    onError: (err: any) => {
      toast({
        title: "Sign up failed",
        description: err.message || "Could not create account",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="signup-page">
      <nav className="h-14 flex items-center px-4 sm:px-6 border-b border-border/50">
        <Link href="/">
          <Button variant="ghost" size="sm" data-testid="button-back-landing">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
        </Link>
        <div className="flex-1 text-center pr-16">
          <Link href="/">
            <span className="text-xl font-extrabold tracking-tight text-primary" data-testid="text-logo">Hoster</span>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight" data-testid="text-auth-heading">Create your account</h2>
            <p className="text-sm text-muted-foreground mt-2">Start managing your rentals smarter</p>
          </div>

          <Formik
            initialValues={{
              firstName: "",
              lastName: "",
              email: "",
              password: "",
              country: "",
              phone: "",
              agreeTerms: false,
            }}
            validationSchema={SignupSchema}
            onSubmit={(values: any, { setSubmitting }: FormikHelpers<any>) => {
              const fullPhone = values.phone
                ? (COUNTRIES.find((c) => c.name === values.country)?.dial || "") + " " + values.phone
                : "";
              
              registerMutation.mutate(
                { ...values, phone: fullPhone },
                { onSettled: () => setSubmitting(false) }
              );
            }}
          >
            {({ values, handleChange, setFieldValue, isSubmitting, errors, touched }: { values: any; handleChange: any; setFieldValue: any; isSubmitting: boolean; errors: any; touched: any }) => (
              <Form className="space-y-4" data-testid="form-signup">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-first" className="text-xs font-medium text-muted-foreground">First name</Label>
                    <Field
                      as={Input}
                      id="reg-first"
                      name="firstName"
                      placeholder="John"
                      className={`bg-card border-border rounded-md ${errors.firstName && touched.firstName ? "border-destructive" : ""}`}
                      data-testid="input-reg-first-name"
                    />
                    <ErrorMessage name="firstName" component="div" className="text-xs text-destructive" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-last" className="text-xs font-medium text-muted-foreground">Last name</Label>
                    <Field
                      as={Input}
                      id="reg-last"
                      name="lastName"
                      placeholder="Smith"
                      className={`bg-card border-border rounded-md ${errors.lastName && touched.lastName ? "border-destructive" : ""}`}
                      data-testid="input-reg-last-name"
                    />
                    <ErrorMessage name="lastName" component="div" className="text-xs text-destructive" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-email" className="text-xs font-medium text-muted-foreground">Email address</Label>
                  <Field
                    as={Input}
                    id="reg-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className={`bg-card border-border rounded-md ${errors.email && touched.email ? "border-destructive" : ""}`}
                    data-testid="input-reg-email"
                  />
                  <ErrorMessage name="email" component="div" className="text-xs text-destructive" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-password" className="text-xs font-medium text-muted-foreground">Password</Label>
                  <div className="relative">
                    <Field
                      as={Input}
                      id="reg-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      className={`pr-10 bg-card border-border rounded-md ${errors.password && touched.password ? "border-destructive" : ""}`}
                      data-testid="input-reg-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      data-testid="button-toggle-reg-password"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="div" className="text-xs text-destructive" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Country (optional)</Label>
                  <Select
                    value={values.country}
                    onValueChange={(val) => setFieldValue("country", val)}
                  >
                    <SelectTrigger className="bg-card border-border rounded-md" data-testid="select-reg-country">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.name} data-testid={`option-country-${c.code.toLowerCase()}`}>
                          {c.name}{c.dial ? ` (${c.dial})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-phone" className="text-xs font-medium text-muted-foreground">Phone (optional)</Label>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const selectedCountry = COUNTRIES.find((c) => c.name === values.country);
                      return selectedCountry?.dial ? (
                        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap flex-shrink-0 min-w-[3rem]" data-testid="text-phone-dial-code">
                          {selectedCountry.dial}
                        </span>
                      ) : null;
                    })()}
                    <Field
                      as={Input}
                      id="reg-phone"
                      name="phone"
                      type="tel"
                      placeholder={
                        COUNTRIES.find((c) => c.name === values.country)?.dial
                          ? "Phone number"
                          : "+1 (555) 000-0000"
                      }
                      className="bg-card border-border rounded-md"
                      data-testid="input-reg-phone"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="agree-terms"
                      checked={values.agreeTerms}
                      onCheckedChange={(checked) => setFieldValue("agreeTerms", checked === true)}
                      className="mt-0.5"
                      data-testid="checkbox-agree-terms"
                    />
                    <Label htmlFor="agree-terms" className="text-xs text-muted-foreground cursor-pointer leading-relaxed">
                      I agree to the <span className="text-primary font-medium">Terms & Conditions</span> and <span className="text-primary font-medium">Privacy Policy</span>
                    </Label>
                  </div>
                  <ErrorMessage name="agreeTerms" component="div" className="text-xs text-destructive mt-1" />
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  type="submit"
                  disabled={isSubmitting || registerMutation.isPending}
                  data-testid="button-signup"
                >
                  {isSubmitting || registerMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary font-medium" data-testid="link-to-login">Log in</Link>
                </p>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
