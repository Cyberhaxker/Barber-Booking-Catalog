import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logoPath from "@assets/Untitled_design_1781856857171.png";

const schema = z.object({
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function AdminLogin() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "" },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    setError(null);
    const ok = await login(values.password);
    setIsSubmitting(false);
    if (ok) {
      setLocation("/admin");
    } else {
      setError("Incorrect password. Try again.");
    }
  }

  return (
    <div
      data-testid="page-admin-login"
      className="min-h-screen flex items-center justify-center bg-background px-4"
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-xl overflow-hidden border border-primary/30 mb-4 flex items-center justify-center bg-black">
            <img src={logoPath} alt="MamboFades logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Access</h1>
          <p className="text-sm text-muted-foreground mt-1">MamboFades — Staff Only</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card p-8 shadow-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Password</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-admin-password"
                        type="password"
                        placeholder="Enter admin password"
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <p
                  data-testid="text-login-error"
                  className="text-sm text-destructive font-medium text-center"
                >
                  {error}
                </p>
              )}

              <Button
                data-testid="button-admin-login"
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Verifying..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Client booking?{" "}
          <a href="/" className="text-primary hover:underline">
            Return to site
          </a>
        </p>
      </div>
    </div>
  );
}
