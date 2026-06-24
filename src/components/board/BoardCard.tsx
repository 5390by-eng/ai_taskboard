import { Link } from "react-router-dom";
import type { Profile } from "@/features/auth/profile.service";
import { ROUTES } from "@/lib/constants";
import type { Board } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberAvatarStack } from "./MemberAvatarStack";

type BoardCardProps = {
  board: Board;
  members: Profile[];
};

function formatUpdatedAt(date: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function BoardCard({ board, members }: BoardCardProps) {
  const description = board.description.trim() || "No description";
  const orderedMembers = board.memberIds
    .map((memberId) => members.find((member) => member.id === memberId))
    .filter((member): member is Profile => member !== undefined);

  return (
    <Link to={ROUTES.boardDetails(board.id)} className="block h-full">
      <Card className="flex h-full cursor-pointer flex-col transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{board.title}</CardTitle>
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        </CardHeader>

        <CardContent className="mt-auto space-y-4">
          <div className="flex items-center gap-2">
            <MemberAvatarStack members={orderedMembers} ownerId={board.ownerId} />
            <span className="text-xs text-muted-foreground">
              {board.memberIds.length} members
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            Updated {formatUpdatedAt(board.updatedAt)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
