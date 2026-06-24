import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Profile } from "@/features/auth/profile.service";
import type { Board } from "@/types";

type BoardHeaderProps = {
  board: Board;
  members?: Profile[];
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function BoardHeader({ board, members = [] }: BoardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{board.title}</h1>
        <p className="text-sm text-muted-foreground">{board.description}</p>
      </div>
      {members.length > 0 && (
        <div className="flex -space-x-2">
          {members.map((member) => (
            <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
              {member.avatarUrl ? (
                <AvatarImage src={member.avatarUrl} alt={member.name} />
              ) : null}
              <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      )}
    </div>
  );
}
