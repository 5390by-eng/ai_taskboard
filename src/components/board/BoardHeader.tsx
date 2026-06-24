import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mockUsers } from "@/lib/mock-data/users";
import type { Board } from "@/types";

type BoardHeaderProps = {
  board: Board;
};

export function BoardHeader({ board }: BoardHeaderProps) {
  const members = mockUsers.filter((u) => board.memberIds.includes(u.id));

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">{board.title}</h1>
        <p className="text-sm text-muted-foreground">{board.description}</p>
      </div>
      <div className="flex -space-x-2">
        {members.map((member) => {
          const initials = member.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2);
          return (
            <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          );
        })}
      </div>
    </div>
  );
}
