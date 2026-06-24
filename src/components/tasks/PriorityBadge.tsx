import type { TaskPriority, TaskStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/constants";

const priorityColors: Record<TaskPriority, string> = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

type PriorityBadgeProps = {
  priority: TaskPriority;
  className?: string;
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <Badge variant="outline" className={cn("border-0 font-normal", priorityColors[priority], className)}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}

const statusColors: Record<TaskStatus, string> = {
  backlog: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  todo: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  review: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  done: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

type StatusBadgeProps = {
  status: TaskStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn("border-0 font-normal", statusColors[status], className)}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
