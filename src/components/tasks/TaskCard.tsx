import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PriorityBadge } from "./PriorityBadge";
import { findAssignee, getAssigneeDisplayName, getNameInitials, type AssigneeLookup } from "@/lib/assignee";
import { cn } from "@/lib/utils";

type TaskCardProps = {
  task: Task;
  members?: AssigneeLookup[];
  onClick?: () => void;
  isDragging?: boolean;
};

export function TaskCard({ task, members = [], onClick, isDragging }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: { task },
  });

  const assignee = findAssignee(task.assigneeId, members);
  const assigneeLabel = getAssigneeDisplayName(task.assigneeId, members);
  const initials = assignee ? getNameInitials(assignee.name) : "?";

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow",
        isDragging && "opacity-50 shadow-lg",
      )}
      onClick={onClick}
      {...listeners}
      {...attributes}
    >
      <CardHeader className="p-3 pb-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-tight">{task.title}</p>
          <PriorityBadge priority={task.priority} />
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {task.description}
          </p>
        )}
        {task.assigneeId && (
          <div className="flex items-center gap-2">
            {assignee ? (
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
              </Avatar>
            ) : null}
            <span className="text-xs text-muted-foreground">{assigneeLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
