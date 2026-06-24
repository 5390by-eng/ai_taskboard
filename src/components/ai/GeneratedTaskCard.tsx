import { X } from "lucide-react";
import type { GeneratedTaskPreview, TaskPriority } from "@/types";
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

type GeneratedTaskCardProps = {
  task: GeneratedTaskPreview;
  onUpdate: (updates: Partial<GeneratedTaskPreview>) => void;
  onRemove: () => void;
};

export function GeneratedTaskCard({ task, onUpdate, onRemove }: GeneratedTaskCardProps) {
  return (
    <Card>
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
        <PriorityBadge priority={task.priority} />
        <Button variant="ghost" size="icon" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <Input
          value={task.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
        <Textarea
          value={task.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          rows={2}
        />
        <div className="flex gap-3">
          <Select
            value={task.priority}
            onValueChange={(v) => onUpdate({ priority: v as TaskPriority })}
          >
            <SelectTrigger className="w-[140px]">
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
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              {mockUsers.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
