import { AlertCircle } from "lucide-react";
import { isSupabaseConfigured, SUPABASE_CONFIG_MESSAGE } from "@/lib/env";
import { cn } from "@/lib/utils";

type SupabaseConfigBannerProps = {
  className?: string;
};

export function SupabaseConfigBanner({ className }: SupabaseConfigBannerProps) {
  if (isSupabaseConfigured) {
    return null;
  }

  return (
    <div
      role="alert"
      className={cn(
        "mb-4 flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive",
        className,
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{SUPABASE_CONFIG_MESSAGE}</p>
    </div>
  );
}
