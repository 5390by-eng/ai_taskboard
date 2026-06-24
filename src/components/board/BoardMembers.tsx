import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Profile } from "@/features/auth/profile.service";
import { getNameInitials } from "@/lib/assignee";
import { cn } from "@/lib/utils";

type BoardMembersProps = {
  members: Profile[];
  isLoading?: boolean;
  isError?: boolean;
};

function MemberChip({ member }: { member: Profile }) {
  const isOwner = member.role === "owner";

  return (
    <div className="inline-flex items-center gap-2 rounded-full border bg-background px-2 py-1">
      <Avatar className="h-6 w-6">
        {member.avatarUrl ? <AvatarImage src={member.avatarUrl} alt={member.name} /> : null}
        <AvatarFallback
          className={cn(
            "text-[10px] font-medium uppercase",
            isOwner ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground",
          )}
        >
          {getNameInitials(member.name)}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm text-foreground">{member.name}</span>
    </div>
  );
}

export function BoardMembers({ members, isLoading, isError }: BoardMembersProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading members...
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">Failed to load board members</p>
    );
  }

  if (members.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">Members ({members.length})</p>
      <div className="flex flex-wrap gap-2">
        {members.map((member) => (
          <MemberChip key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}
