import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await apiRequest("POST", "/api/auth/login", values);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/user"], data);
      router.push("/");
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
    <div className="min-h-screen bg-background flex flex-col" data-testid="login-page">
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
            <h2 className="text-2xl font-extrabold tracking-tight" data-testid="text-auth-heading">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-2">Log in to manage your properties</p>
          </div>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={LoginSchema}
            onSubmit={(values: any, { setSubmitting }: FormikHelpers<any>) => {
              loginMutation.mutate(values, {
                onSettled: () => setSubmitting(false),
              });
            }}
          >
            {({ isSubmitting, errors, touched }: { isSubmitting: boolean; errors: any; touched: any }) => (
              <Form className="space-y-4" data-testid="form-login">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-xs font-medium text-muted-foreground">Email address</Label>
                  <Field
                    as={Input}
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className={`bg-card border-border rounded-md ${errors.email && touched.email ? "border-destructive" : ""}`}
                    data-testid="input-login-email"
                  />
                  <ErrorMessage name="email" component="div" className="text-xs text-destructive" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="login-password" className="text-xs font-medium text-muted-foreground">Password</Label>
                  <div className="relative">
                    <Field
                      as={Input}
                      id="login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className={`pr-10 bg-card border-border rounded-md ${errors.password && touched.password ? "border-destructive" : ""}`}
                      data-testid="input-login-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="div" className="text-xs text-destructive" />
                </div>
                <Button className="w-full" size="lg" type="submit" disabled={isSubmitting || loginMutation.isPending} data-testid="button-login">
                  {isSubmitting || loginMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log in"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-primary font-medium" data-testid="link-to-signup">Sign up</Link>
                </p>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
