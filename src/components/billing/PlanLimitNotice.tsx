import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type PlanLimitNoticeProps = {
  message: string;
  className?: string;
};

export function PlanLimitNotice({ message, className }: PlanLimitNoticeProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100",
        className,
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        {message}{" "}
        <Link to="/billing" className="font-medium underline underline-offset-2">
          View plans
        </Link>
      </p>
    </div>
  );
}
