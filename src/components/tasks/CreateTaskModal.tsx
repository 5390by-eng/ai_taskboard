import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createTaskSchema, type CreateTaskFormValues } from "@/lib/validators";
import type { AssigneeLookup } from "@/lib/assignee";
import type { TaskPriority } from "@/types";

type CreateTaskModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateTaskFormValues) => void;
  members: AssigneeLookup[];
  membersLoading?: boolean;
  isLoading?: boolean;
};

export function CreateTaskModal({
  open,
  onOpenChange,
  onSubmit,
  members,
  membersLoading = false,
  isLoading,
}: CreateTaskModalProps) {
  const form = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      assigneeId: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: "",
        description: "",
        priority: "medium",
        assigneeId: undefined,
      });
    }
  }, [open, form]);

  const handleSubmit = (values: CreateTaskFormValues) => {
    onSubmit({
      ...values,
      assigneeId: values.assigneeId || undefined,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Task description" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(["low", "medium", "high"] as TaskPriority[]).map((p) => (
                        <SelectItem key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assigneeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignee</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value || undefined)}
                    value={field.value ?? ""}
                    disabled={membersLoading || members.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            membersLoading
                              ? "Loading members..."
                              : members.length === 0
                                ? "No board members"
                                : "Select assignee"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
