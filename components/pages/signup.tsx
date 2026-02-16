"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { COUNTRIES } from "@/lib/countries";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 20;
  if (/[a-z]/.test(password)) score += 20;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 20;
  if (/[^a-zA-Z0-9]/.test(password)) score += 20;

  const label =
    score <= 40 ? "Weak" : score <= 60 ? "Fair" : score <= 80 ? "Good" : "Strong";
  const barColor =
    score <= 40
      ? "bg-red-500"
      : score <= 60
        ? "bg-amber-500"
        : score <= 80
          ? "bg-emerald-500"
          : "bg-emerald-700";

  return { score, label, barColor };
}

const SignupSchema = Yup.object().shape({
  firstName: Yup.string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters")
    .matches(/^[a-zA-Z\s-]+$/, "Only letters, spaces, and hyphens are allowed"),
  lastName: Yup.string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .matches(/^[a-zA-Z\s-]+$/, "Only letters, spaces, and hyphens are allowed"),
  email: Yup.string()
    .required("Email is required")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"),
  country: Yup.string().required("Country is required"),
  phone: Yup.string()
    .required("Phone is required")
    .min(8, "Phone must be at least 8 digits")
    .matches(/^[0-9]+$/, "Phone must be numbers only"),
  city: Yup.string().optional(),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .matches(/[a-z]/, "Must include a lowercase letter")
    .matches(/[A-Z]/, "Must include an uppercase letter")
    .matches(/[0-9]/, "Must include a number"),
  confirmPassword: Yup.string()
    .required("Confirm your password")
    .oneOf([Yup.ref("password")], "Passwords must match"),
  agreeTerms: Yup.boolean().oneOf(
    [true],
    "You must agree to the terms and privacy policy",
  ),
});

export default function SignupPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  useEffect(() => {
    if (user && !isLoading) {
      if (user.role === "admin") router.push("/admin");
      else if (user.role === "provider") router.push("/provider");
      else router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.message || "Registration failed");
      }
      return json;
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Account created",
        description: "Check your email to verify your account, then log in.",
      });
      router.push("/login");
    },
    onError: (err: any) => {
      toast({
        title: "Sign up failed",
        description: err?.message || "Could not create account",
        variant: "destructive",
      });
    },
  });

  const countriesFiltered = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dialCode.includes(q.replace("+", "")),
    );
  }, [countrySearch]);

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
            <span className="text-xl font-extrabold tracking-tight text-primary" data-testid="text-logo">
              Hoster
            </span>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight" data-testid="text-auth-heading">
              Create your account
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Start managing your rentals smarter
            </p>
          </div>

          <Formik
            initialValues={{
              firstName: "",
              lastName: "",
              email: "",
              country: "",
              phone: "",
              city: "",
              password: "",
              confirmPassword: "",
              agreeTerms: false,
            }}
            validationSchema={SignupSchema}
            onSubmit={(values: any, { setSubmitting }: FormikHelpers<any>) => {
              const email = String(values.email || "").trim().toLowerCase();
              const country = COUNTRIES.find((c) => c.code === values.country);
              const digits = String(values.phone || "").replace(/\D/g, "");
              const fullPhone = country ? `+${country.dialCode}${digits}` : digits;

              registerMutation.mutate(
                {
                  firstName: values.firstName.trim(),
                  lastName: values.lastName.trim(),
                  email,
                  password: values.password,
                  country: values.country,
                  phone: fullPhone,
                  city: values.city?.trim() || undefined,
                },
                { onSettled: () => setSubmitting(false) },
              );
            }}
          >
            {({
              values,
              setFieldValue,
              isSubmitting,
              errors,
              touched,
            }: {
              values: any;
              setFieldValue: any;
              isSubmitting: boolean;
              errors: any;
              touched: any;
            }) => {
              const country = COUNTRIES.find((c) => c.code === values.country);
              const strength = getPasswordStrength(values.password || "");
              const isPhoneEnabled = Boolean(values.country);

              return (
                <Form className="space-y-4" data-testid="form-signup">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-first" className="text-xs font-medium text-muted-foreground">
                        First name *
                      </Label>
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
                      <Label htmlFor="reg-last" className="text-xs font-medium text-muted-foreground">
                        Last name *
                      </Label>
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
                    <Label htmlFor="reg-email" className="text-xs font-medium text-muted-foreground">
                      Email address *
                    </Label>
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
                    <Label className="text-xs font-medium text-muted-foreground">
                      Country *
                    </Label>
                    <Select
                      value={values.country}
                      onValueChange={(val) => {
                        setCountrySearch("");
                        setFieldValue("country", val);
                        setFieldValue("phone", "");
                      }}
                    >
                      <SelectTrigger className={`bg-card border-border rounded-md ${errors.country && touched.country ? "border-destructive" : ""}`} data-testid="select-reg-country">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            placeholder="Search country…"
                            className="h-8"
                            data-testid="input-country-search"
                          />
                        </div>
                        {countriesFiltered.map((c) => (
                          <SelectItem key={c.code} value={c.code} data-testid={`option-country-${c.code.toLowerCase()}`}>
                            {c.flag} {c.name} (+{c.dialCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <ErrorMessage name="country" component="div" className="text-xs text-destructive" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-phone" className="text-xs font-medium text-muted-foreground">
                      Phone number *
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap flex-shrink-0 min-w-[4.2rem]" data-testid="text-phone-dial-code">
                        {country ? `${country.flag} +${country.dialCode}` : "--"}
                      </span>
                      <Field
                        as={Input}
                        id="reg-phone"
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        disabled={!isPhoneEnabled}
                        placeholder={isPhoneEnabled ? "501234567" : "Select country first"}
                        className={`bg-card border-border rounded-md ${errors.phone && touched.phone ? "border-destructive" : ""}`}
                        onChange={(e: any) => {
                          const onlyDigits = String(e.target.value || "").replace(/\D/g, "");
                          setFieldValue("phone", onlyDigits);
                        }}
                        data-testid="input-reg-phone"
                      />
                    </div>
                    <ErrorMessage name="phone" component="div" className="text-xs text-destructive" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-city" className="text-xs font-medium text-muted-foreground">
                      City <span className="text-muted-foreground">(Optional)</span>
                    </Label>
                    <Field
                      as={Input}
                      id="reg-city"
                      name="city"
                      placeholder="Riyadh"
                      className="bg-card border-border rounded-md"
                      data-testid="input-reg-city"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-password" className="text-xs font-medium text-muted-foreground">
                      Password *
                    </Label>
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
                    <div className="flex items-center gap-2">
                      <div className="h-1 flex-1 rounded bg-muted overflow-hidden">
                        <div
                          className={`h-full ${strength.barColor}`}
                          style={{ width: `${strength.score}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground min-w-[3.5rem] text-right">
                        {values.password ? strength.label : ""}
                      </span>
                    </div>
                    <ErrorMessage name="password" component="div" className="text-xs text-destructive" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-confirm" className="text-xs font-medium text-muted-foreground">
                      Confirm password *
                    </Label>
                    <div className="relative">
                      <Field
                        as={Input}
                        id="reg-confirm"
                        name="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Re-enter password"
                        className={`pr-10 bg-card border-border rounded-md ${errors.confirmPassword && touched.confirmPassword ? "border-destructive" : ""}`}
                        data-testid="input-reg-confirm-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        data-testid="button-toggle-confirm-password"
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <ErrorMessage name="confirmPassword" component="div" className="text-xs text-destructive" />
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <Checkbox
                      checked={values.agreeTerms}
                      onCheckedChange={(v) => setFieldValue("agreeTerms", Boolean(v))}
                      id="agree-terms"
                      data-testid="checkbox-agree-terms"
                    />
                    <Label htmlFor="agree-terms" className="text-xs text-muted-foreground cursor-pointer leading-relaxed">
                      I agree to the{" "}
                      <Link href="/terms" target="_blank" rel="noopener noreferrer" className="underline">
                        Terms
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="underline">
                        Privacy Policy
                      </Link>
                      .
                    </Label>
                  </div>
                  <ErrorMessage name="agreeTerms" component="div" className="text-xs text-destructive" />

                  <Button
                    className="w-full"
                    type="submit"
                    disabled={isSubmitting || registerMutation.isPending}
                    style={{ backgroundColor: "#FF385C", borderColor: "#FF385C" }}
                    data-testid="button-submit-signup"
                  >
                    {isSubmitting || registerMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Create account
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Already have an account?{" "}
                    <Link href="/login" className="underline">
                      Log in
                    </Link>
                  </p>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}
