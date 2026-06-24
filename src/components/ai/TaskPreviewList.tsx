import type { GeneratedTaskPreview } from "@/types";
import { GeneratedTaskCard } from "./GeneratedTaskCard";

type TaskPreviewListProps = {
  tasks: GeneratedTaskPreview[];
  onUpdate: (id: string, updates: Partial<GeneratedTaskPreview>) => void;
  onRemove: (id: string) => void;
};

export function TaskPreviewList({ tasks, onUpdate, onRemove }: TaskPreviewListProps) {
  if (tasks.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Generated Tasks Preview</h3>
      <p className="text-sm text-muted-foreground">
        Review and edit tasks before adding them to your board.
      </p>
      <div className="space-y-3">
        {tasks.map((task) => (
          <GeneratedTaskCard
            key={task.id}
            task={task}
            onUpdate={(updates) => onUpdate(task.id, updates)}
            onRemove={() => onRemove(task.id)}
          />
        ))}
      </div>
    </div>
  );
}
