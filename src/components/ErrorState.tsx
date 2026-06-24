import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  message = "Something went wrong",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-12", className)}>
      <AlertCircle className="h-10 w-10 text-destructive" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
