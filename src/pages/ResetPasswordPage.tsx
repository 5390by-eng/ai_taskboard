import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useResetPassword } from "@/features/auth";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/validators";
import { ROUTES } from "@/lib/constants";
import { SupabaseConfigBanner } from "@/components/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ResetPasswordPage() {
  const resetPassword = useResetPassword();
  const [hasRecoverySession, setHasRecoverySession] = useState<boolean | null>(
    isSupabaseConfigured ? null : false,
  );
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setHasRecoverySession(false);
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      setHasRecoverySession(false);
      return;
    }

    let isMounted = true;

    const verifyRecoverySession = async () => {
      const {
        data: { session },
      } = await client.auth.getSession();

      if (isMounted) {
        setHasRecoverySession(Boolean(session));
      }
    };

    void verifyRecoverySession();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setHasRecoverySession(Boolean(session));
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isSubmitDisabled =
    !isSupabaseConfigured || hasRecoverySession === false || resetPassword.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set new password</CardTitle>
        <CardDescription>Choose a new password for your account</CardDescription>
      </CardHeader>
      <CardContent>
        <SupabaseConfigBanner />
        {hasRecoverySession === false && isSupabaseConfigured && (
          <p className="mb-4 text-sm text-destructive">
            Password reset link is invalid or has expired. Request a new link below.
          </p>
        )}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => resetPassword.mutate(values))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
              {resetPassword.isPending ? "Updating..." : "Update password"}
            </Button>
          </form>
        </Form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link to={ROUTES.forgotPassword} className="text-primary hover:underline">
            Request a new reset link
          </Link>
          {" · "}
          <Link to={ROUTES.login} className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
