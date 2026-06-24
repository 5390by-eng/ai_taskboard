import { SupabaseConfigBanner, GoogleSignInButton } from "@/components/auth";
import { Separator } from "@/components/ui/separator";

type AuthSocialLoginProps = {
  className?: string;
};

export function AuthSocialLogin({ className }: AuthSocialLoginProps) {
  return (
    <div className={className}>
      <SupabaseConfigBanner />
      <GoogleSignInButton />
      <div className="relative my-4">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          or
        </span>
      </div>
    </div>
  );
}
