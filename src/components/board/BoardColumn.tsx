import { useDroppable } from "@dnd-kit/core";
import type { Task, TaskStatus } from "@/types";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AssigneeLookup } from "@/lib/assignee";

type BoardColumnProps = {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  members: AssigneeLookup[];
  onTaskClick: (task: Task) => void;
};

export function BoardColumn({ id, title, tasks, members, onTaskClick }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-lg bg-muted/50",
        isOver && "ring-2 ring-primary/50",
      )}
    >
      <div className="flex items-center justify-between p-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Badge variant="secondary" className="text-xs">
          {tasks.length}
        </Badge>
      </div>
      <div className="flex flex-col gap-2 p-2 pt-0 min-h-[200px]">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            members={members}
            onClick={() => onTaskClick(task)}
          />
        ))}
      </div>
    </div>
  );
}
