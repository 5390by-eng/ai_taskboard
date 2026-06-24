import { useState } from "react";
import { Loader2, X } from "lucide-react";
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
import { useSearchProfilesByEmail } from "@/features/users";
import type { Profile } from "@/features/auth/profile.service";
import { cn } from "@/lib/utils";

type CreateBoardModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateBoardFormValues) => void | Promise<void>;
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
  const [emailQuery, setEmailQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Profile[]>([]);
  const { data: searchResults = [], isFetching, isError } = useSearchProfilesByEmail(emailQuery);

  const form = useForm<CreateBoardFormValues>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      title: "",
      memberIds: [],
    },
  });

  const selectedMemberIds = form.watch("memberIds");
  const availableResults = searchResults.filter(
    (profile) => !selectedMemberIds.includes(profile.id),
  );

  const resetFormState = () => {
    form.reset({
      title: "",
      memberIds: [],
    });
    setEmailQuery("");
    setSelectedMembers([]);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetFormState();
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (values: CreateBoardFormValues) => {
    try {
      await onSubmit(values);
      resetFormState();
      onOpenChange(false);
    } catch {
      // Keep modal open so the user can retry.
    }
  };

  const addMember = (profile: Profile) => {
    if (selectedMemberIds.includes(profile.id)) {
      return;
    }

    setSelectedMembers((current) => [...current, profile]);
    form.setValue("memberIds", [...selectedMemberIds, profile.id], {
      shouldValidate: true,
    });
    setEmailQuery("");
  };

  const removeMember = (userId: string) => {
    setSelectedMembers((current) => current.filter((member) => member.id !== userId));
    form.setValue(
      "memberIds",
      selectedMemberIds.filter((id) => id !== userId),
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
                  <p className="text-xs text-muted-foreground">
                    Search registered users by email. You will be added as the board owner
                    automatically.
                  </p>

                  {selectedMembers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedMembers.map((member) => (
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
                      ))}
                    </div>
                  )}

                  <FormControl>
                    <Input
                      value={emailQuery}
                      onChange={(event) => setEmailQuery(event.target.value)}
                      placeholder="Search by email"
                      autoComplete="off"
                    />
                  </FormControl>

                  {emailQuery.trim().length >= 2 && (
                    <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-2">
                      {isFetching ? (
                        <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Searching users...
                        </div>
                      ) : isError ? (
                        <p className="py-4 text-center text-sm text-destructive">
                          Failed to search users
                        </p>
                      ) : availableResults.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                          No registered users found
                        </p>
                      ) : (
                        availableResults.map((profile) => (
                          <button
                            key={profile.id}
                            type="button"
                            onClick={() => addMember(profile)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-muted/50",
                            )}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {getInitials(profile.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{profile.name}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {profile.email}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {emailQuery.trim().length > 0 && emailQuery.trim().length < 2 && (
                    <p className="text-xs text-muted-foreground">
                      Enter at least 2 characters to search
                    </p>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
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
