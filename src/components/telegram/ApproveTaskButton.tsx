import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ApproveTaskButtonProps = {
  onClick: () => void;
  isLoading?: boolean;
};

export function ApproveTaskButton({ onClick, isLoading }: ApproveTaskButtonProps) {
  return (
    <Button size="sm" onClick={onClick} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Check />
      )}
      Approve
    </Button>
  );
}
