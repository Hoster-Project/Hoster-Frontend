"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { ArrowLeft, Eye, EyeOff, Loader2, UserPlus } from "lucide-react";

import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ProviderSignupSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required").min(2, "First name must be at least 2 characters"),
  lastName: Yup.string().required("Last name is required").min(2, "Last name must be at least 2 characters"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  country: Yup.string().required("Country is required"),
  city: Yup.string().optional(),
  phone: Yup.string().required("Phone is required").min(8, "Phone must be at least 8 digits"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .matches(/[a-z]/, "Must include lowercase")
    .matches(/[A-Z]/, "Must include uppercase")
    .matches(/[0-9]/, "Must include number"),
  confirmPassword: Yup.string().required("Confirm your password").oneOf([Yup.ref("password")], "Passwords must match"),
});

export default function ProviderSignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!user || isLoading) return;
    if (user.role === "provider" || user.role === "employee") {
      router.push("/provider");
      return;
    }
    if (user.role === "admin") {
      router.push("/admin");
      return;
    }
    router.push("/dashboard");
  }, [user, isLoading, router]);

  const signupMutation = useMutation({
    mutationFn: async (payload: {
      firstName: string;
      lastName: string;
      email: string;
      country: string;
      city?: string;
      phone: string;
      password: string;
      role: "provider";
      portal: "provider";
    }) => {
      const res = await apiRequest("POST", "/api/auth/register", payload);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Provider account created",
        description: "Check your email to verify your account, then log in.",
      });
      router.push("/provider/login");
    },
    onError: (err: any) => {
      toast({
        title: "Signup failed",
        description: err.message || "Could not create provider account",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-8" data-testid="provider-signup-page">
      <div className="w-full max-w-sm">
        <div className="mb-2">
          <Button variant="ghost" size="sm" className="-ml-2" asChild>
            <Link href="/provider/login">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Link>
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-primary">Provider Signup</h1>
          <p className="text-sm text-muted-foreground mt-1">Create your provider account</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Formik
              initialValues={{
                firstName: "",
                lastName: "",
                email: "",
                country: "",
                city: "",
                phone: "",
                password: "",
                confirmPassword: "",
              }}
              validationSchema={ProviderSignupSchema}
              onSubmit={(values, helpers) => {
                signupMutation.mutate(
                  {
                    firstName: values.firstName.trim(),
                    lastName: values.lastName.trim(),
                    email: values.email.trim().toLowerCase(),
                    country: values.country.trim(),
                    city: values.city.trim() || undefined,
                    phone: values.phone.trim(),
                    password: values.password,
                    role: "provider",
                    portal: "provider",
                  },
                  {
                    onSettled: () => helpers.setSubmitting(false),
                  },
                );
              }}
            >
              {({ isSubmitting, errors, touched, values }) => (
                <Form className="space-y-3" data-testid="form-provider-signup">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="provider-signup-first-name">First name</Label>
                      <Field
                        as={Input}
                        id="provider-signup-first-name"
                        name="firstName"
                        className={`bg-card ${errors.firstName && touched.firstName ? "border-destructive" : ""}`}
                      />
                      <ErrorMessage name="firstName" component="div" className="text-xs text-destructive" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="provider-signup-last-name">Last name</Label>
                      <Field
                        as={Input}
                        id="provider-signup-last-name"
                        name="lastName"
                        className={`bg-card ${errors.lastName && touched.lastName ? "border-destructive" : ""}`}
                      />
                      <ErrorMessage name="lastName" component="div" className="text-xs text-destructive" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="provider-signup-email">Email</Label>
                    <Field
                      as={Input}
                      id="provider-signup-email"
                      name="email"
                      type="email"
                      className={`bg-card ${errors.email && touched.email ? "border-destructive" : ""}`}
                    />
                    <ErrorMessage name="email" component="div" className="text-xs text-destructive" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="provider-signup-country">Country</Label>
                      <Field
                        as={Input}
                        id="provider-signup-country"
                        name="country"
                        className={`bg-card ${errors.country && touched.country ? "border-destructive" : ""}`}
                      />
                      <ErrorMessage name="country" component="div" className="text-xs text-destructive" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="provider-signup-city">City</Label>
                      <Field as={Input} id="provider-signup-city" name="city" className="bg-card" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="provider-signup-phone">Phone</Label>
                    <Field
                      as={Input}
                      id="provider-signup-phone"
                      name="phone"
                      className={`bg-card ${errors.phone && touched.phone ? "border-destructive" : ""}`}
                    />
                    <ErrorMessage name="phone" component="div" className="text-xs text-destructive" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="provider-signup-password">Password</Label>
                    <div className="relative">
                      <Field
                        as={Input}
                        id="provider-signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        className={`bg-card ${errors.password && touched.password ? "border-destructive" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <ErrorMessage name="password" component="div" className="text-xs text-destructive" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="provider-signup-confirm-password">Confirm password</Label>
                    <div className="relative">
                      <Field
                        as={Input}
                        id="provider-signup-confirm-password"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        className={`bg-card ${errors.confirmPassword && touched.confirmPassword ? "border-destructive" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <ErrorMessage name="confirmPassword" component="div" className="text-xs text-destructive" />
                  </div>

                  <Button className="w-full mt-2" type="submit" disabled={isSubmitting || signupMutation.isPending || !values.email}>
                    {isSubmitting || signupMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Create provider account
                  </Button>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground text-center mt-4">
          Registering a provider company?{" "}
          <Link href="/provider/company-signup" className="text-primary font-medium underline">
            Continue here
          </Link>
        </p>
      </div>
    </div>
  );
}
