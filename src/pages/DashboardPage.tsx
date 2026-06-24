import { Link } from "react-router-dom";
import { LayoutGrid, Sparkles, Send, CheckCircle2 } from "lucide-react";
import { useBoards } from "@/features/boards";
import { useTaskStore } from "@/stores";
import { ROUTES } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ErrorState";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import { mockTasks } from "@/lib/mock-data/tasks";

export function DashboardPage() {
  const { data: boards, isLoading, isError, refetch } = useBoards();
  const tasksByBoard = useTaskStore((s) => s.tasksByBoard);

  const allTasks = Object.values(tasksByBoard).flat();
  const recentTasks = allTasks.length > 0 ? allTasks.slice(0, 5) : mockTasks.slice(0, 5);
  const inProgressCount = recentTasks.filter((t) => t.status === "in_progress").length;
  const doneCount = recentTasks.filter((t) => t.status === "done").length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your workspace</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Boards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{boards?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{inProgressCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{doneCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to={ROUTES.boards}>
                <LayoutGrid />
                View Boards
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={ROUTES.aiGenerator}>
                <Sparkles />
                AI Generator
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={ROUTES.telegram}>
                <Send />
                Telegram Inbox
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{task.title}</span>
                </div>
                <PriorityBadge priority={task.priority} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
