import { ArrowUpRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type UpgradeButtonProps = {
  onClick: () => void;
  isLoading?: boolean;
  planName?: string;
};

export function UpgradeButton({ onClick, isLoading, planName }: UpgradeButtonProps) {
  return (
    <Button className="w-full" onClick={onClick} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="animate-spin" />
          Upgrading...
        </>
      ) : (
        <>
          Upgrade to {planName}
          <ArrowUpRight />
        </>
      )}
    </Button>
  );
}
