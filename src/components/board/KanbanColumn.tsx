import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Task, TaskColumn } from "../../types";
import TaskCard from "./TaskCard";

interface Props {
  id: TaskColumn;
  label: string;
  color: string;
  tasks: Task[];
  canEdit: boolean;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
}

const columnHeaderColor: Record<TaskColumn, string> = {
  todo  : "text-gray-600 bg-gray-200",
  doing : "text-blue-700 bg-blue-100",
  done  : "text-green-700 bg-green-100",
};

export default function KanbanColumn({
  id,
  label,
  color,
  tasks,
  canEdit,
  onEditTask,
  onDeleteTask,
}: Props) {
  // Kolom sebagai droppable area
  const { setNodeRef, isOver } = useDroppable({ id, disabled: !canEdit });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border transition ${color} ${
        isOver ? "border-blue-400 shadow-md" : "border-gray-200"
      }`}
    >
      {/* Header kolom */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${columnHeaderColor[id]}`}>
            {label}
          </span>
          <span className="text-xs text-gray-400 font-medium">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks */}
      <div className="px-3 pb-3">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2 min-h-20">
            {tasks.length === 0 ? (
              <div className={`flex items-center justify-center h-20 rounded-lg border-2 border-dashed text-xs text-gray-400 transition ${
                isOver ? "border-blue-300 bg-blue-50/50" : "border-gray-200"
              }`}>
                Tidak ada task
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  canEdit={canEdit}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onDeleteTask(task.id)}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}