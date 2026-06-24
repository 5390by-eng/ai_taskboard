import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { PriorityBadge, StatusBadge } from "./PriorityBadge";
import { mockUsers } from "@/lib/mock-data/users";
import { formatDate } from "@/lib/utils";
import type { Task } from "@/types";

type TaskDetailsPanelProps = {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TaskDetailsPanel({ task, open, onOpenChange }: TaskDetailsPanelProps) {
  if (!task) return null;

  const assignee = mockUsers.find((u) => u.id === task.assigneeId);
  const initials = assignee?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2) ?? "?";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{task.title}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="flex gap-2">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>
          <Separator />
          <div>
            <h4 className="text-sm font-medium mb-1">Description</h4>
            <p className="text-sm text-muted-foreground">{task.description || "No description"}</p>
          </div>
          {assignee && (
            <div>
              <h4 className="text-sm font-medium mb-2">Assignee</h4>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{assignee.name}</span>
              </div>
            </div>
          )}
          <div>
            <h4 className="text-sm font-medium mb-1">Created</h4>
            <p className="text-sm text-muted-foreground">{formatDate(task.createdAt)}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
