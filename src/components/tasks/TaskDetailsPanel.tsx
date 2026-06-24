import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "./PriorityBadge";
import {
  findAssignees,
  getNameInitials,
  normalizeTaskAssignees,
  type AssigneeLookup,
} from "@/lib/assignee";
import {
  createUpdateTaskLocalSchema,
  type UpdateTaskLocalFormValues,
} from "@/lib/validators";
import { formatDate } from "@/lib/utils";
import type { Task, TaskPriority } from "@/types";

type TaskDetailsPanelProps = {
  task: Task | null;
  members: AssigneeLookup[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (taskId: string, values: UpdateTaskLocalFormValues) => void;
  onDelete: (taskId: string) => void;
  isSaving?: boolean;
  isDeleting?: boolean;
};

function getDefaultValues(task: Task): UpdateTaskLocalFormValues {
  return {
    title: task.title,
    priority: task.priority,
    assigneeIds: normalizeTaskAssignees(task),
  };
}

export function TaskDetailsPanel({
  task,
  members,
  open,
  onOpenChange,
  onSave,
  onDelete,
  isSaving = false,
  isDeleting = false,
}: TaskDetailsPanelProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addAssigneeValue, setAddAssigneeValue] = useState("");

  const validationSchema = useMemo(
    () => createUpdateTaskLocalSchema(members.map((member) => member.id)),
    [members],
  );

  const form = useForm<UpdateTaskLocalFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: task ? getDefaultValues(task) : undefined,
  });

  useEffect(() => {
    if (task && open) {
      form.reset(getDefaultValues(task));
      setAddAssigneeValue("");
    }
  }, [task, open, form]);

  if (!task) return null;

  const assigneeIds = form.watch("assigneeIds") ?? [];
  const availableMembers = members.filter(
    (member) => !assigneeIds.includes(member.id),
  );

  const handleAddAssignee = (memberId: string) => {
    if (!memberId || assigneeIds.includes(memberId)) {
      return;
    }

    form.setValue("assigneeIds", [...assigneeIds, memberId], { shouldValidate: true });
    setAddAssigneeValue("");
  };

  const handleRemoveAssignee = (memberId: string) => {
    form.setValue(
      "assigneeIds",
      assigneeIds.filter((id) => id !== memberId),
      { shouldValidate: true },
    );
  };

  const handleCancel = () => {
    form.reset(getDefaultValues(task));
    setAddAssigneeValue("");
  };

  const handleSubmit = (values: UpdateTaskLocalFormValues) => {
    onSave(task.id, values);
  };

  const handleDelete = () => {
    onDelete(task.id);
    setDeleteOpen(false);
  };

  const selectedAssignees = findAssignees(assigneeIds, members);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Task details</SheetTitle>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-6 space-y-4">
              <div className="flex gap-2">
                <StatusBadge status={task.status} />
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(["low", "medium", "high"] as TaskPriority[]).map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {task.description || "No description"}
                </p>
              </div>

              <FormField
                control={form.control}
                name="assigneeIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Assignees</FormLabel>
                    <div className="space-y-3">
                      {selectedAssignees.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedAssignees.map((assignee) => (
                            <Badge
                              key={assignee.id}
                              variant="secondary"
                              className="flex items-center gap-1.5 py-1 pl-1 pr-2"
                            >
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[9px]">
                                  {getNameInitials(assignee.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{assignee.name}</span>
                              <button
                                type="button"
                                className="rounded-sm opacity-70 hover:opacity-100"
                                onClick={() => handleRemoveAssignee(assignee.id)}
                                aria-label={`Remove ${assignee.name}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No assignees</p>
                      )}

                      <Select
                        value={addAssigneeValue}
                        onValueChange={(value) => {
                          handleAddAssignee(value);
                        }}
                        disabled={availableMembers.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                availableMembers.length === 0
                                  ? "All members assigned"
                                  : "Add member"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <h4 className="text-sm font-medium mb-1">Created</h4>
                <p className="text-sm text-muted-foreground">{formatDate(task.createdAt)}</p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button type="submit" disabled={isSaving || isDeleting}>
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving || isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="ml-auto"
                  onClick={() => setDeleteOpen(true)}
                  disabled={isSaving || isDeleting}
                >
                  Delete
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove &quot;{task.title}&quot; from the board. This action only affects
              your current session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
