import { useState } from "react";
import { LayoutGrid } from "lucide-react";
import { useBoards, useCreateBoard } from "@/features/boards";
import { useBoardMemberProfilesMap } from "@/features/boards";
import type { CreateBoardFormValues } from "@/lib/validators";
import { BoardCard } from "@/components/board/BoardCard";
import { CreateBoardCard } from "@/components/board/CreateBoardCard";
import { CreateBoardModal } from "@/components/board/CreateBoardModal";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";

export function BoardsListPage() {
  const { data: boards, isLoading, isError, refetch } = useBoards();
  const { profilesById } = useBoardMemberProfilesMap(boards);
  const createBoard = useCreateBoard();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateBoard = async (values: CreateBoardFormValues) => {
    await createBoard.mutateAsync({
      title: values.title.trim(),
      description: "",
      memberIds: values.memberIds,
    });
  };

  if (isLoading) return <LoadingState message="Loading boards..." />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Boards</h1>
        <p className="text-muted-foreground">Manage your project boards</p>
      </div>

      {boards && boards.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="No boards yet"
          description="Create your first board to start organizing tasks"
          actionLabel="Create Board"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards?.map((board) => {
            const members = board.memberIds.flatMap((memberId) => {
              const profile = profilesById.get(memberId);
              return profile ? [profile] : [];
            });

            return <BoardCard key={board.id} board={board} members={members} />;
          })}
          <CreateBoardCard onClick={() => setDialogOpen(true)} />
        </div>
      )}

      <CreateBoardModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateBoard}
        isLoading={createBoard.isPending}
      />
    </div>
  );
}
