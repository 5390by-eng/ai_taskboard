import { useState } from "react";
import { useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { useBoard } from "@/features/boards";
import { useBoardMembers } from "@/features/users";
import {
  useTasks,
  useCreateTask,
  useMoveTask,
  useLocalUpdateTask,
  useLocalDeleteTask,
} from "@/features/tasks";
import { useTaskStore } from "@/stores";
import { BoardHeader, BoardMembers, KanbanBoard } from "@/components/board";
import { FloatingLiveChat } from "@/components/chat";
import { CreateTaskModal, TaskDetailsPanel } from "@/components/tasks";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import type { Task, TaskStatus } from "@/types";
import type { Profile } from "@/features/auth/profile.service";
import type { CreateTaskFormValues, UpdateTaskLocalFormValues } from "@/lib/validators";

const EMPTY_MEMBERS: Profile[] = [];

const EMPTY_TASKS: Task[] = [];

export function BoardDetailsPage() {
  const { id = "" } = useParams<{ id: string }>();
  const { data: board, isLoading: boardLoading, isError: boardError, refetch } = useBoard(id);
  const {
    data: membersData,
    isLoading: membersLoading,
    isError: membersError,
  } = useBoardMembers(id);
  const members = membersData ?? EMPTY_MEMBERS;
  const { isLoading: tasksLoading, isError: tasksError } = useTasks(id);
  const createTask = useCreateTask(id);
  const moveTask = useMoveTask(id);
  const localUpdateTask = useLocalUpdateTask(id);
  const localDeleteTask = useLocalDeleteTask(id);
  const tasks = useTaskStore((s) => s.tasksByBoard[id] ?? EMPTY_TASKS);

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const selectedTask = selectedTaskId
    ? tasks.find((task) => task.id === selectedTaskId) ?? null
    : null;

  const handleTaskClick = (task: Task) => {
    setSelectedTaskId(task.id);
    setPanelOpen(true);
  };

  const handleMoveTask = (taskId: string, status: TaskStatus, previousStatus: TaskStatus) => {
    moveTask.mutate({ taskId, status, previousStatus });
  };

  const handleCreateTask = (values: CreateTaskFormValues) => {
    createTask.mutate(values);
  };

  const handleSaveTask = (taskId: string, values: UpdateTaskLocalFormValues) => {
    localUpdateTask.mutate({ taskId, input: values });
  };

  const handleDeleteTask = (taskId: string) => {
    localDeleteTask.mutate(taskId, {
      onSuccess: () => {
        setPanelOpen(false);
        setSelectedTaskId(null);
      },
    });
  };

  if (boardLoading || tasksLoading || membersLoading) {
    return <LoadingState message="Loading board..." />;
  }
  if (boardError || tasksError || !board) {
    return <ErrorState message="Board not found" onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <BoardHeader board={board} />
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          Add Task
        </Button>
      </div>

      <BoardMembers members={members} isLoading={membersLoading} isError={membersError} />

      <KanbanBoard
        tasks={tasks}
        members={members}
        onMoveTask={handleMoveTask}
        onTaskClick={handleTaskClick}
      />

      <CreateTaskModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateTask}
        members={members}
        membersLoading={membersLoading}
        isLoading={createTask.isPending}
      />

      <TaskDetailsPanel
        task={selectedTask}
        members={members}
        open={panelOpen}
        onOpenChange={setPanelOpen}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        isSaving={localUpdateTask.isPending}
        isDeleting={localDeleteTask.isPending}
      />

      <FloatingLiveChat boardId={id} members={members} />
    </div>
  );
}
