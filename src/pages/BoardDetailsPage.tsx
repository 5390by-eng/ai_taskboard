import { useState } from "react";
import { useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { useBoard } from "@/features/boards";
import { useBoardMembers } from "@/features/users";
import { useTasks, useCreateTask, useMoveTask } from "@/features/tasks";
import { useTaskStore } from "@/stores";
import { BoardHeader, BoardMembers, KanbanBoard } from "@/components/board";
import { CreateTaskModal, TaskDetailsPanel } from "@/components/tasks";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import type { Task, TaskStatus } from "@/types";
import type { CreateTaskFormValues } from "@/lib/validators";

export function BoardDetailsPage() {
  const { id = "" } = useParams<{ id: string }>();
  const { data: board, isLoading: boardLoading, isError: boardError, refetch } = useBoard(id);
  const {
    data: members = [],
    isLoading: membersLoading,
    isError: membersError,
  } = useBoardMembers(id);
  const { isLoading: tasksLoading, isError: tasksError } = useTasks(id);
  const createTask = useCreateTask(id);
  const moveTask = useMoveTask(id);
  const tasks = useTaskStore((s) => s.tasksByBoard[id] ?? []);

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setPanelOpen(true);
  };

  const handleMoveTask = (taskId: string, status: TaskStatus, previousStatus: TaskStatus) => {
    moveTask.mutate({ taskId, status, previousStatus });
  };

  const handleCreateTask = (values: CreateTaskFormValues) => {
    createTask.mutate(values);
  };

  if (boardLoading || tasksLoading) return <LoadingState message="Loading board..." />;
  if (boardError || tasksError || !board) {
    return <ErrorState message="Board not found" onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <BoardHeader board={board} members={members} />
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          Add Task
        </Button>
      </div>

      <BoardMembers members={members} isLoading={membersLoading} isError={membersError} />

      <KanbanBoard
        tasks={tasks}
        onMoveTask={handleMoveTask}
        onTaskClick={handleTaskClick}
      />

      <CreateTaskModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateTask}
        isLoading={createTask.isPending}
      />

      <TaskDetailsPanel
        task={selectedTask}
        open={panelOpen}
        onOpenChange={setPanelOpen}
      />
    </div>
  );
}
