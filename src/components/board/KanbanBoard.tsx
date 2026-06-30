// import { useState } from "react";
// import {
//   DndContext,
//   DragOverlay,
//   PointerSensor,
//   useSensor,
//   useSensors,
//   closestCorners,
//   type DragStartEvent,
//   type DragEndEvent,
// } from "@dnd-kit/core";
// import { useTask } from "../../hooks/useTask";
// import type { Member, Task, TaskColumn } from "../../types";
// import KanbanColumn from "./KanbanColumn";
// import TaskCard from "./TaskCard";
// import CreateTaskModal from "./CreateTaskModal";
// import Spinner from "../shared/Spinner";

// interface Props {
//   projectId: string;
//   members: Record<string, Member>;
//   canEdit: boolean;
// }

// const COLUMNS: { id: TaskColumn; label: string; color: string }[] = [
//   { id: "todo", label: "To Do", color: "bg-gray-100" },
//   { id: "doing", label: "Doing", color: "bg-blue-50" },
//   { id: "done", label: "Done", color: "bg-green-50" },
// ];

// export default function KanbanBoard({ projectId, members, canEdit }: Props) {
//   const {
//     todoTasks,
//     doingTasks,
//     doneTasks,
//     loading,
//     error,
//     handleCreateTask,
//     handleUpdateTask,
//     handleMoveTask,
//     handleDeleteTask,
//     clearError,
//   } = useTask(projectId);

//   const [activeTask, setActiveTask] = useState<Task | null>(null);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [editingTask, setEditingTask] = useState<Task | null>(null);

//   // Map kolom ke tasks
//   const tasksByColumn: Record<TaskColumn, Task[]> = {
//     todo: todoTasks,
//     doing: doingTasks,
//     done: doneTasks,
//   };

//   // ─── DnD Sensors ─────────────────────────────────────────────────────────────
//   const sensors = useSensors(
//     useSensor(PointerSensor, {
//       activationConstraint: {
//         distance: 8,
//       },
//     }),
//   );

//   // ─── Drag Start ───────────────────────────────────────────────────────────────
//   function onDragStart(event: DragStartEvent) {
//     const allTasks = [...todoTasks, ...doingTasks, ...doneTasks];
//     const task = allTasks.find((t) => t.id === event.active.id);
//     if (task) setActiveTask(task);
//   }

//   // ─── Drag End ─────────────────────────────────────────────────────────────────
//   async function onDragEnd(event: DragEndEvent) {
//     setActiveTask(null);
//     const { active, over } = event;

//     if (!over) return;

//     const taskId = active.id as string;
//     const overId = over.id as string;

//     // Cari task yang di-drag
//     const allTasks = [...todoTasks, ...doingTasks, ...doneTasks];
//     const draggedTask = allTasks.find((t) => t.id === taskId);
//     if (!draggedTask) return;

//     let targetColumn: TaskColumn;
//     let newOrder: number;

//     const isOverColumn =
//       overId === "todo" || overId === "doing" || overId === "done";

//     if (isOverColumn) {
//       // Skenario 1: Di-drop di area kosong (header/background kolom)
//       targetColumn = overId as TaskColumn;

//       // Jika kolom tidak berubah dan di-drop ke header, urutan jangan berubah
//       if (draggedTask.column === targetColumn) return;

//       // Taruh di paling bawah kolom baru
//       newOrder = tasksByColumn[targetColumn].length;
//     } else {
//       // Skenario 2: Di-drop di atas task lain
//       const overTask = allTasks.find((t) => t.id === overId);
//       if (!overTask) return;

//       targetColumn = overTask.column;
//       const targetTasks = tasksByColumn[targetColumn];

//       // Cari urutan (index) dari task yang ditabrak/ditimpa
//       const overIndex = targetTasks.findIndex((t) => t.id === overId);

//       if (draggedTask.column === targetColumn) {
//         // REORDER DI KOLOM YANG SAMA
//         const activeIndex = targetTasks.findIndex((t) => t.id === taskId);

//         // Jika tidak ada perubahan posisi, skip
//         if (activeIndex === overIndex) return;

//         newOrder = overIndex;
//       } else {
//         // PINDAH KOLOM & DISISIPKAN DI TENGAH TASK LAIN
//         newOrder = overIndex;
//       }
//     }

//     // Panggil hook untuk update state/database
//     await handleMoveTask(taskId, targetColumn, newOrder);
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-20">
//         <Spinner />
//       </div>
//     );
//   }

//   return (
//     <div>
//       {/* Toolbar */}
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center gap-3">
//           <span className="text-sm text-gray-500">
//             {todoTasks.length + doingTasks.length + doneTasks.length} task total
//           </span>
//         </div>
//         {canEdit && (
//           <button
//             onClick={() => setShowCreateModal(true)}
//             className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
//           >
//             <svg
//               className="w-4 h-4"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M12 4v16m8-8H4"
//               />
//             </svg>
//             Tambah Task
//           </button>
//         )}
//       </div>

//       {/* Error */}
//       {error && (
//         <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center justify-between">
//           <span>{error}</span>
//           <button
//             onClick={clearError}
//             className="text-red-400 hover:text-red-600"
//           >
//             ✕
//           </button>
//         </div>
//       )}

//       {/* Board */}
//       <DndContext
//         sensors={sensors}
//         collisionDetection={closestCorners}
//         onDragStart={onDragStart}
//         onDragEnd={onDragEnd}
//       >
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {COLUMNS.map((col) => (
//             <KanbanColumn
//               key={col.id}
//               id={col.id}
//               label={col.label}
//               color={col.color}
//               tasks={tasksByColumn[col.id]}
//               canEdit={canEdit}
//               onEditTask={setEditingTask}
//               onDeleteTask={handleDeleteTask}
//             />
//           ))}
//         </div>

//         {/* Drag overlay — task yang sedang di-drag */}
//         <DragOverlay>
//           {activeTask && (
//             <TaskCard task={activeTask} canEdit={false} isDragging />
//           )}
//         </DragOverlay>
//       </DndContext>

//       {/* Modal buat task */}
//       {showCreateModal && (
//         <CreateTaskModal
//           members={members}
//           onClose={() => setShowCreateModal(false)}
//           onCreate={handleCreateTask}
//         />
//       )}

//       {/* Modal edit task */}
//       {editingTask && (
//         <CreateTaskModal
//           task={editingTask}
//           members={members}
//           onClose={() => setEditingTask(null)}
//           onCreate={handleCreateTask}
//           onUpdate={async (title, description, assigneeId, assigneeName) => {
//             await handleUpdateTask(
//               editingTask.id,
//               title,
//               description,
//               assigneeId,
//               assigneeName,
//             );
//             setEditingTask(null);
//           }}
//         />
//       )}
//     </div>
//   );
// }

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useTask } from "../../hooks/useTask";
import type { Member, Task, TaskColumn } from "../../types";
import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";
import CreateTaskModal from "./CreateTaskModal";
import Spinner from "../shared/Spinner";

interface Props {
  projectId: string;
  members: Record<string, Member>;
  canEdit: boolean;
}

const COLUMNS: { id: TaskColumn; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "bg-gray-100" },
  { id: "doing", label: "Doing", color: "bg-blue-50" },
  { id: "done", label: "Done", color: "bg-green-50" },
];

export default function KanbanBoard({ projectId, members, canEdit }: Props) {
  const {
    todoTasks,
    doingTasks,
    doneTasks,
    loading,
    error,
    handleCreateTask,
    handleUpdateTask,
    handleReorderTasks, // 👈 Pakai hook yang baru
    handleDeleteTask,
    clearError,
  } = useTask(projectId);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Map kolom ke tasks
  const tasksByColumn: Record<TaskColumn, Task[]> = {
    todo: todoTasks,
    doing: doingTasks,
    done: doneTasks,
  };

  // ─── DnD Sensors ─────────────────────────────────────────────────────────────
  const sensors = useSensors(
    // 1. Sensor untuk Mouse (Desktop)
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // Kursor harus geser 8px baru drag dimulai
      },
    }),
    // 2. Sensor untuk Layar Sentuh (Mobile/Tablet)
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Jari harus menekan dan menahan selama 250 milidetik
        tolerance: 5, // Saat menekan, jari boleh bergeser maksimal 5px (agar tidak batal jika jari sedikit bergetar)
      },
    }),
  );

  // ─── Drag Start ───────────────────────────────────────────────────────────────
  function onDragStart(event: DragStartEvent) {
    const allTasks = [...todoTasks, ...doingTasks, ...doneTasks];
    const task = allTasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  // ─── Drag End ─────────────────────────────────────────────────────────────────
  async function onDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Cari task yang di-drag
    const allTasks = [...todoTasks, ...doingTasks, ...doneTasks];
    const draggedTask = allTasks.find((t) => t.id === taskId);
    if (!draggedTask) return;

    const isOverColumn =
      overId === "todo" || overId === "doing" || overId === "done";
    let targetColumn = draggedTask.column;
    let overIndex = -1;

    // Menentukan target pindah dan index-nya
    if (isOverColumn) {
      targetColumn = overId as TaskColumn;
      overIndex = tasksByColumn[targetColumn].length;
    } else {
      const overTask = allTasks.find((t) => t.id === overId);
      if (overTask) {
        targetColumn = overTask.column;
        overIndex = tasksByColumn[targetColumn].findIndex(
          (t) => t.id === overId,
        );
      }
    }

    // Jika di-drop di tempatnya sendiri (tidak berpindah sama sekali), abaikan
    if (draggedTask.column === targetColumn && taskId === overId) return;

    // Salin array sumber agar bisa dimanipulasi indeksnya
    const sourceTasks = [...tasksByColumn[draggedTask.column]];
    const activeIndex = sourceTasks.findIndex((t) => t.id === taskId);
    let updates: { id: string; column: TaskColumn; order: number }[] = [];

    if (draggedTask.column === targetColumn) {
      // 📌 REORDER DI KOLOM YANG SAMA
      if (activeIndex === overIndex) return;

      const [movedTask] = sourceTasks.splice(activeIndex, 1);
      sourceTasks.splice(overIndex, 0, movedTask);

      // Hitung ulang nomor order
      updates = sourceTasks.map((t, index) => ({
        id: t.id,
        column: targetColumn,
        order: index,
      }));
    } else {
      // 📌 PINDAH BEDA KOLOM
      const targetTasks = [...tasksByColumn[targetColumn]];
      const [movedTask] = sourceTasks.splice(activeIndex, 1);

      if (isOverColumn) {
        targetTasks.push(movedTask); // Taruh di paling bawah
      } else {
        targetTasks.splice(overIndex, 0, movedTask); // Disisipkan di indeks tertentu
      }

      // Hitung ulang order untuk kedua kolom yang terpengaruh
      updates = [
        ...sourceTasks.map((t, index) => ({
          id: t.id,
          column: draggedTask.column,
          order: index,
        })),
        ...targetTasks.map((t, index) => ({
          id: t.id,
          column: targetColumn,
          order: index,
        })),
      ];
    }

    // Panggil hook untuk simpan ke database jika ada perubahan data
    if (updates.length > 0) {
      await handleReorderTasks(updates);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {todoTasks.length + doingTasks.length + doneTasks.length} task total
          </span>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Tambah Task
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              label={col.label}
              color={col.color}
              tasks={tasksByColumn[col.id]}
              canEdit={canEdit}
              onEditTask={setEditingTask}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>

        {/* Drag overlay — task yang sedang di-drag */}
        <DragOverlay>
          {activeTask && (
            <TaskCard task={activeTask} canEdit={false} isDragging />
          )}
        </DragOverlay>
      </DndContext>

      {/* Modal buat task */}
      {showCreateModal && (
        <CreateTaskModal
          members={members}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTask}
        />
      )}

      {/* Modal edit task */}
      {editingTask && (
        <CreateTaskModal
          task={editingTask}
          members={members}
          onClose={() => setEditingTask(null)}
          onCreate={handleCreateTask}
          onUpdate={async (title, description, assigneeId, assigneeName) => {
            await handleUpdateTask(
              editingTask.id,
              title,
              description,
              assigneeId,
              assigneeName,
            );
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}
