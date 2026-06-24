import { useState } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import { useBoards, useCreateBoard } from "@/features/boards";
import { ROUTES } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateBoardCard } from "@/components/board/CreateBoardCard";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function BoardsListPage() {
  const { data: boards, isLoading, isError, refetch } = useBoards();
  const createBoard = useCreateBoard();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    if (!title.trim()) return;
    createBoard.mutate(
      { title, description },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setTitle("");
          setDescription("");
        },
      },
    );
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Board</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createBoard.isPending}>
              {createBoard.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
