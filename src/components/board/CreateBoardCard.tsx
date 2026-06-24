import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CreateBoardCardProps = {
  onClick: () => void;
  className?: string;
};

export function CreateBoardCard({ onClick, className }: CreateBoardCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer border-dashed hover:border-primary hover:bg-muted/50 transition-colors",
        className,
      )}
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center h-full min-h-[160px] gap-2 text-muted-foreground">
        <Plus className="h-8 w-8" />
        <span className="text-sm font-medium">Create Board</span>
      </CardContent>
    </Card>
  );
}
