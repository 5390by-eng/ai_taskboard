import { X } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createBoardSchema, type CreateBoardFormValues } from "@/lib/validators";
import { currentMockUser, mockUsers } from "@/lib/mock-data/users";
import { cn } from "@/lib/utils";

type CreateBoardModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateBoardFormValues) => void;
  isLoading?: boolean;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function CreateBoardModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: CreateBoardModalProps) {
  const form = useForm<CreateBoardFormValues>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      title: "",
      memberIds: [currentMockUser.id],
    },
  });

  const selectedMemberIds = form.watch("memberIds");

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset({
        title: "",
        memberIds: [currentMockUser.id],
      });
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = (values: CreateBoardFormValues) => {
    onSubmit(values);
    form.reset({
      title: "",
      memberIds: [currentMockUser.id],
    });
    onOpenChange(false);
  };

  const toggleMember = (userId: string) => {
    const current = form.getValues("memberIds");
    const next = current.includes(userId)
      ? current.filter((id) => id !== userId)
      : [...current, userId];
    form.setValue("memberIds", next, { shouldValidate: true });
  };

  const removeMember = (userId: string) => {
    const current = form.getValues("memberIds");
    form.setValue(
      "memberIds",
      current.filter((id) => id !== userId),
      { shouldValidate: true },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Board</DialogTitle>
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
                    <Input placeholder="Board name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="memberIds"
              render={() => (
                <FormItem>
                  <FormLabel>Members</FormLabel>
                  {selectedMemberIds.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedMemberIds.map((memberId) => {
                        const member = mockUsers.find((user) => user.id === memberId);
                        if (!member) return null;

                        return (
                          <Badge
                            key={member.id}
                            variant="secondary"
                            className="gap-1 pr-1"
                          >
                            {member.name}
                            <button
                              type="button"
                              className="ml-1 rounded-full p-0.5 hover:bg-muted"
                              onClick={() => removeMember(member.id)}
                              aria-label={`Remove ${member.name}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-2">
                    {mockUsers.map((user) => {
                      const isSelected = selectedMemberIds.includes(user.id);

                      return (
                        <label
                          key={user.id}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted/50",
                            isSelected && "bg-muted/50",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleMember(user.id)}
                            className="h-4 w-4 rounded border-input"
                          />
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{user.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Board"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
