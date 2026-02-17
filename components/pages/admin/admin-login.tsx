"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";



const AdminLoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const setupEnabled =
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_ADMIN_SETUP_ENABLED === "true";
  const setupTokenRequired =
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_ADMIN_SETUP_REQUIRE_TOKEN === "true";

  const AdminSetupSchema = AdminLoginSchema.shape({
    setupToken: setupTokenRequired
      ? Yup.string().required("Setup token is required")
      : Yup.string().notRequired(),
  });

  const handleLogin = async (values: { email: string; password: string }, { setSubmitting }: FormikHelpers<any>) => {
    const { email, password } = values;

    try {
      await apiRequest("POST", "/api/auth/login", { email, password });

      const checkRes = await apiRequest("GET", "/api/admin/auth-check");
      const checkData = await checkRes.json();

      if (!checkData.isAdmin) {
        await apiRequest("POST", "/api/auth/logout");
        toast({
          title: "Access denied",
          description: "This account does not have admin privileges.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      router.push('/admin');
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error?.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetup = async (
    values: { email: string; password: string; setupToken?: string },
    { setSubmitting }: FormikHelpers<any>,
  ) => {
    const { email, password, setupToken } = values;

    try {
      await apiRequest("POST", "/api/auth/login", { email, password });

      const setupRes = await apiRequest("POST", "/api/admin/setup", {
        token: (setupToken || "").trim() || undefined,
      });
      const setupData = await setupRes.json();

      if (setupData.success) {
        toast({ title: "Admin setup complete", description: "You are now the admin." });
        router.push('/admin');
      } else {
        await apiRequest("POST", "/api/auth/logout");
        toast({
          title: "Setup failed",
          description: setupData.message || "An admin already exists. Please log in instead.",
          variant: "destructive",
        });
        setShowSetup(false);
      }
    } catch (error: any) {
      toast({
        title: "Setup failed",
        description: error?.message || "Could not complete admin setup",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            {showSetup ? (
              <ShieldCheck className="h-6 w-6 text-primary" />
            ) : (
              <Lock className="h-6 w-6 text-primary" />
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-primary" data-testid="text-admin-title">Hoster</h1>
          <p className="text-sm text-muted-foreground mt-1" data-testid="text-admin-subtitle">
            {showSetup ? "First-Time Admin Setup" : "Admin Panel"}
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Formik
              initialValues={{ email: "", password: "", setupToken: "" }}
              validationSchema={showSetup ? AdminSetupSchema : AdminLoginSchema}
              onSubmit={showSetup ? handleSetup : handleLogin}
            >
              {({ isSubmitting, values, handleChange }: { isSubmitting: boolean; values: any; handleChange: any }) => (
                <Form className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-email">Email</Label>
                    <Field
                      as={Input}
                      id="admin-email"
                      name="email"
                      type="email"
                      placeholder="admin@tryhoster.com"
                      autoFocus
                      data-testid="input-admin-email"
                      className="bg-card"
                    />
                    <ErrorMessage name="email" component="div" className="text-xs text-destructive" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-password">Password</Label>
                    <div className="relative">
                      <Field
                        as={Input}
                        id="admin-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        data-testid="input-admin-password"
                        className="bg-card"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        data-testid="button-toggle-admin-password"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <ErrorMessage name="password" component="div" className="text-xs text-destructive" />
                  </div>
                  {showSetup ? (
                    <div className="space-y-1.5">
                      <Label htmlFor="admin-setup-token">Setup token</Label>
                      <Field
                        as={Input}
                        id="admin-setup-token"
                        name="setupToken"
                        type="text"
                        placeholder="Enter setup token"
                        data-testid="input-admin-setup-token"
                        className="bg-card"
                      />
                      <ErrorMessage name="setupToken" component="div" className="text-xs text-destructive" />
                    </div>
                  ) : null}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      isSubmitting ||
                      !values.email ||
                      !values.password ||
                      (showSetup && setupTokenRequired && !values.setupToken)
                    }
                    data-testid="button-admin-login"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {showSetup ? "Set Up Admin Account" : "Sign in to Admin"}
                  </Button>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>

        <div className="text-center mt-4">
          {!setupEnabled ? null : showSetup ? (
            <button
              className="text-xs text-muted-foreground underline"
              onClick={() => setShowSetup(false)}
              data-testid="button-switch-to-login"
            >
              Already set up? Sign in instead
            </button>
          ) : (
            <button
              className="text-xs text-muted-foreground underline"
              onClick={() => setShowSetup(true)}
              data-testid="button-switch-to-setup"
            >
              First time? Set up admin account
            </button>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Restricted access. Authorized personnel only.
        </p>
      </div>
    </div>
  );
}
