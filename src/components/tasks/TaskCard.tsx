import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PriorityBadge } from "./PriorityBadge";
import {
  findAssignees,
  getNameInitials,
  normalizeTaskAssignees,
  type AssigneeLookup,
} from "@/lib/assignee";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_ASSIGNEES = 3;

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

  const assigneeIds = normalizeTaskAssignees(task);
  const assignees = findAssignees(assigneeIds, members);
  const visibleAssignees = assignees.slice(0, MAX_VISIBLE_ASSIGNEES);
  const hiddenAssigneeCount = assignees.length - visibleAssignees.length;

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
        {assignees.length > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex -space-x-2">
              {visibleAssignees.map((assignee) => (
                <Avatar key={assignee.id} className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-[10px]">
                    {getNameInitials(assignee.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            {hiddenAssigneeCount > 0 && (
              <span className="text-xs text-muted-foreground">+{hiddenAssigneeCount}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
