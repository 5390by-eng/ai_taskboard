import { X } from "lucide-react";
import type { GeneratedTaskPreview, TaskPriority } from "@/types";
import type { AssigneeLookup } from "@/lib/assignee";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import { mockUsers } from "@/lib/mock-data/users";
import { cn } from "@/lib/utils";

type GeneratedTaskCardProps = {
  task: GeneratedTaskPreview;
  onUpdate: (updates: Partial<GeneratedTaskPreview>) => void;
  onRemove: () => void;
  members?: AssigneeLookup[];
  compact?: boolean;
};

export function GeneratedTaskCard({
  task,
  onUpdate,
  onRemove,
  members,
  compact = false,
}: GeneratedTaskCardProps) {
  const assigneeOptions = members && members.length > 0 ? members : mockUsers;

  return (
    <Card className={cn(compact && "shadow-sm")}>
      <CardHeader className={cn("flex flex-row items-start justify-between", compact ? "p-3 pb-1" : "p-4 pb-2")}>
        <PriorityBadge priority={task.priority} />
        <Button variant="ghost" size="icon" className={cn(compact && "h-7 w-7")} onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className={cn("space-y-3", compact ? "p-3 pt-0" : "p-4 pt-0")}>
        <Input
          value={task.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className={cn(compact && "h-8 text-sm")}
        />
        {!compact && (
          <Textarea
            value={task.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            rows={2}
          />
        )}
        <div className="flex gap-2">
          <Select
            value={task.priority}
            onValueChange={(v) => onUpdate({ priority: v as TaskPriority })}
          >
            <SelectTrigger className={cn(compact ? "h-8 w-[110px] text-xs" : "w-[140px]")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={task.assigneeId ?? ""}
            onValueChange={(v) => onUpdate({ assigneeId: v })}
          >
            <SelectTrigger className={cn("flex-1", compact && "h-8 text-xs")}>
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              {assigneeOptions.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
