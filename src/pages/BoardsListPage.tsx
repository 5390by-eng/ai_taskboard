import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutGrid } from "lucide-react";
import { useBoards } from "@/features/boards";
import { ROUTES } from "@/lib/constants";
import { queryKeys } from "@/lib/query-keys";
import { currentMockUser } from "@/lib/mock-data/users";
import { generateId } from "@/lib/utils";
import { useBoardStore } from "@/stores";
import type { Board } from "@/types";
import type { CreateBoardFormValues } from "@/lib/validators";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateBoardCard } from "@/components/board/CreateBoardCard";
import { CreateBoardModal } from "@/components/board/CreateBoardModal";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";

export function BoardsListPage() {
  const queryClient = useQueryClient();
  const addBoard = useBoardStore((state) => state.addBoard);
  const { data: boards, isLoading, isError, refetch } = useBoards();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateBoard = async (values: CreateBoardFormValues) => {
    setIsCreating(true);

    try {
      const board: Board = {
        id: generateId("board"),
        title: values.title.trim(),
        description: "",
        ownerId: currentMockUser.id,
        memberIds: values.memberIds,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addBoard(board);
      queryClient.setQueryData<Board[]>(queryKeys.boards.all, (currentBoards) => [
        ...(currentBoards ?? []),
        board,
      ]);
    } finally {
      setIsCreating(false);
    }
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
          {boards?.map((board) => (
            <Link key={board.id} to={ROUTES.boardDetails(board.id)}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>{board.title}</CardTitle>
                  <CardDescription>{board.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {board.memberIds.length} members
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
          <CreateBoardCard onClick={() => setDialogOpen(true)} />
        </div>
      )}

      <CreateBoardModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateBoard}
        isLoading={isCreating}
      />
    </div>
  );
}
