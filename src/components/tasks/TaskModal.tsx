import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PriorityBadge, StatusBadge } from "./PriorityBadge";
import { findAssignee, getNameInitials, type AssigneeLookup } from "@/lib/assignee";
import { formatDate } from "@/lib/utils";
import type { Task } from "@/types";

type TaskModalProps = {
  task: Task | null;
  members: AssigneeLookup[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TaskModal({ task, members, open, onOpenChange }: TaskModalProps) {
  if (!task) return null;

  const assignee = findAssignee(task.assigneeId, members);
  const initials = assignee ? getNameInitials(assignee.name) : "?";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>
          <p className="text-sm text-muted-foreground">{task.description}</p>
          <div className="flex items-center justify-between text-sm">
            {assignee && (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span>{assignee.name}</span>
              </div>
            )}
            <span className="text-muted-foreground">{formatDate(task.createdAt)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
