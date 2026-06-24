import type { GeneratedTaskPreview } from "@/types";
import type { AssigneeLookup } from "@/lib/assignee";
import { GeneratedTaskCard } from "./GeneratedTaskCard";
import { cn } from "@/lib/utils";

type TaskPreviewListProps = {
  tasks: GeneratedTaskPreview[];
  onUpdate: (id: string, updates: Partial<GeneratedTaskPreview>) => void;
  onRemove: (id: string) => void;
  members?: AssigneeLookup[];
  compact?: boolean;
  className?: string;
};

export function TaskPreviewList({
  tasks,
  onUpdate,
  onRemove,
  members,
  compact = false,
  className,
}: TaskPreviewListProps) {
  if (tasks.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {!compact && (
        <>
          <h3 className="text-lg font-semibold">Generated Tasks Preview</h3>
          <p className="text-sm text-muted-foreground">
            Review and edit tasks before adding them to your board.
          </p>
        </>
      )}
      {compact && (
        <p className="text-xs font-medium text-muted-foreground">
          Preview ({tasks.length})
        </p>
      )}
      <div className="space-y-2">
        {tasks.map((task) => (
          <GeneratedTaskCard
            key={task.id}
            task={task}
            onUpdate={(updates) => onUpdate(task.id, updates)}
            onRemove={() => onRemove(task.id)}
            members={members}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}
