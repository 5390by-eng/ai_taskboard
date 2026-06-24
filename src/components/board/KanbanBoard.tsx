import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { Task, TaskStatus } from "@/types";
import { BOARD_COLUMNS } from "@/lib/constants";
import { BoardColumn } from "./BoardColumn";
import { TaskCard } from "@/components/tasks/TaskCard";
import type { AssigneeLookup } from "@/lib/assignee";

type KanbanBoardProps = {
  tasks: Task[];
  members: AssigneeLookup[];
  onMoveTask: (taskId: string, status: TaskStatus, previousStatus: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
};

export function KanbanBoard({ tasks, members, onMoveTask, onTaskClick }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newStatus = over.id as TaskStatus;
    if (task.status !== newStatus) {
      onMoveTask(taskId, newStatus, task.status);
    }
  };

  const tasksByColumn = BOARD_COLUMNS.reduce(
    (acc, col) => {
      acc[col.id] = tasks.filter((t) => t.status === col.id);
      return acc;
    },
    {} as Record<TaskStatus, Task[]>,
  );

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {BOARD_COLUMNS.map((col) => (
          <BoardColumn
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={tasksByColumn[col.id]}
            members={members}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} members={members} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
