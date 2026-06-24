import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Profile } from "@/features/auth/profile.service";
import { getNameInitials } from "@/lib/assignee";
import { cn } from "@/lib/utils";

const MAX_VISIBLE = 3;

type MemberAvatarStackProps = {
  members: Profile[];
  ownerId: string;
  className?: string;
};

export function MemberAvatarStack({ members, ownerId, className }: MemberAvatarStackProps) {
  if (members.length === 0) {
    return null;
  }

  const visibleMembers = members.slice(0, MAX_VISIBLE);
  const hiddenCount = members.length - visibleMembers.length;

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex -space-x-2">
        {visibleMembers.map((member) => {
          const isOwner = member.id === ownerId;

          return (
            <Avatar key={member.id} className="h-7 w-7 border-2 border-background">
              {member.avatarUrl ? (
                <AvatarImage src={member.avatarUrl} alt={member.name} />
              ) : null}
              <AvatarFallback
                className={cn(
                  "text-[10px] font-medium uppercase",
                  isOwner ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground",
                )}
              >
                {getNameInitials(member.name)}
              </AvatarFallback>
            </Avatar>
          );
        })}
        {hiddenCount > 0 && (
          <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground">
            +{hiddenCount}
          </div>
        )}
      </div>
    </div>
  );
}
