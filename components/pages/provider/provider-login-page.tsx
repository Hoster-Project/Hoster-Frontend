"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { ArrowLeft, Eye, EyeOff, Loader2, LogIn } from "lucide-react";

import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function ProviderLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();
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

  const loginMutation = useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", {
        ...values,
        portal: "provider",
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.setQueryData(["/api/auth/user"], data);
      if (data.role !== "provider" && data.role !== "employee") {
        toast({
          title: "Access denied",
          description: "This login page is for provider accounts only.",
          variant: "destructive",
        });
        return;
      }
      router.push("/provider");
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
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4" data-testid="provider-login-page">
      <div className="w-full max-w-sm">
        <div className="mb-2">
          <Button variant="ghost" size="sm" className="-ml-2" asChild>
            <Link href="/" data-testid="link-provider-back-home">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Link>
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-primary">Provider Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={LoginSchema}
              onSubmit={(values, helpers) => {
                loginMutation.mutate(values, {
                  onSettled: () => helpers.setSubmitting(false),
                });
              }}
            >
              {({ isSubmitting, errors, touched, values }) => (
                <Form className="space-y-4" data-testid="form-provider-login">
                  <div className="space-y-1.5">
                    <Label htmlFor="provider-login-email">Email</Label>
                    <Field
                      as={Input}
                      id="provider-login-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      className={`bg-card ${errors.email && touched.email ? "border-destructive" : ""}`}
                    />
                    <ErrorMessage name="email" component="div" className="text-xs text-destructive" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="provider-login-password">Password</Label>
                    <div className="relative">
                      <Field
                        as={Input}
                        id="provider-login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
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

                  <Button
                    className="w-full"
                    type="submit"
                    disabled={isSubmitting || loginMutation.isPending || !values.email || !values.password}
                  >
                    {isSubmitting || loginMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Log in
                  </Button>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>

        <div className="text-center mt-4 text-sm text-muted-foreground">
          <p>
            Need a provider account?{" "}
            <Link href="/provider/signup" className="text-primary font-medium underline">
              Sign up
            </Link>
          </p>
          <p className="mt-2">
            Registering a company?{" "}
            <Link href="/provider/company-signup" className="text-primary font-medium underline">
              Company signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
