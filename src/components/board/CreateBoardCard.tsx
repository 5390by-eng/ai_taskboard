import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CreateBoardCardProps = {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
};

export function CreateBoardCard({ onClick, className, disabled }: CreateBoardCardProps) {
  return (
    <Card
      className={cn(
        "border-dashed transition-colors",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:border-primary hover:bg-muted/50",
        className,
      )}
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
    >
      <CardContent className="flex flex-col items-center justify-center h-full min-h-[160px] gap-2 text-muted-foreground">
        <Plus className="h-8 w-8" />
        <span className="text-sm font-medium">
          {disabled ? "Board limit reached" : "Create Board"}
        </span>
      </CardContent>
    </Card>
  );
}
