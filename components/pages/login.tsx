"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getLandingUrl } from "@/lib/portal-urls";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const landingHref = useMemo(() => getLandingUrl(), []);

  useEffect(() => {
    if (user && !isLoading) {
      if (user.role === "provider" || user.role === "employee") {
        router.push("/provider");
      } else if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, router]);

  const loginMutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await apiRequest("POST", "/api/auth/login", {
        ...values,
        portal: "hoster",
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/user"], data);
      if (data.role === "provider" || data.role === "employee") {
        router.push("/provider");
      } else if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    },
    onError: (err: any) => {
      toast({
        title: "Login failed",
        description: err.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  return (
    <div
      className="min-h-screen bg-muted/30 flex items-center justify-center p-4"
      data-testid="login-page"
    >
      <div className="w-full max-w-sm">
        <div className="mb-2">
          <Button variant="ghost" size="sm" className="-ml-2" asChild>
            <Link href={landingHref} data-testid="link-back-landing" prefetch={false}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Link>
          </Button>
        </div>

        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <h1
            className="text-2xl font-extrabold text-primary"
            data-testid="text-logo"
          >
            Hoster
          </h1>
          <p
            className="text-sm text-muted-foreground mt-1"
            data-testid="text-auth-heading"
          >
            Welcome back
          </p>
        </div>

        {/* Card Container */}
        <Card>
          <CardContent className="p-6">
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={LoginSchema}
              onSubmit={(
                values: any,
                { setSubmitting }: FormikHelpers<any>,
              ) => {
                loginMutation.mutate(values, {
                  onSettled: () => setSubmitting(false),
                });
              }}
            >
              {({
                isSubmitting,
                errors,
                touched,
                values,
              }: {
                isSubmitting: boolean;
                errors: any;
                touched: any;
                values: any;
              }) => (
                <Form className="space-y-4" data-testid="form-login">
                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email">Email</Label>
                    <Field
                      as={Input}
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      autoFocus
                      className={`bg-card ${errors.email && touched.email ? "border-destructive" : ""}`}
                      data-testid="input-login-email"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-xs text-destructive"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Field
                        as={Input}
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className={`bg-card ${errors.password && touched.password ? "border-destructive" : ""}`}
                        data-testid="input-login-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        data-testid="button-toggle-password"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-xs text-destructive"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    className="w-full"
                    type="submit"
                    disabled={
                      isSubmitting ||
                      loginMutation.isPending ||
                      !values.email ||
                      !values.password
                    }
                    data-testid="button-login"
                  >
                    {isSubmitting || loginMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Log in
                  </Button>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>

        {/* Signup Link */}
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-primary font-medium underline"
              data-testid="link-to-signup"
            >
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Terms
          </Link>
          <span aria-hidden="true">•</span>
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Privacy
          </Link>
        </div>

        {/* Footer Text */}
        {/* <p className="text-center text-xs text-muted-foreground mt-4">
          Restricted access. Authorized personnel only.
        </p> */}
      </div>
    </div>
  );
}
