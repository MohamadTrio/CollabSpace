// src/components/board/TaskCard.tsx
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../../types";
import ConfirmDialog from "../shared/ConfirmDialog";
// src/components/board/TaskCard.tsx
import { getAvatarColor, getInitials } from "../../lib/avatar";

interface Props {
  task: Task;
  canEdit: boolean;
  isDragging?: boolean;
  onEdit?: () => void;
  onDelete?: () => Promise<void>;
}

export default function TaskCard({
  task,
  canEdit,
  isDragging = false,
  onEdit,
  onDelete,
}: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // Ganti bagian assignee avatar
  const { bg, text } = getAvatarColor(task.assigneeName);
  const initials = getInitials(task.assigneeName);

  // Sortable hook untuk drag & drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id, disabled: !canEdit });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
  };

  async function handleDelete() {
    if (!onDelete) return;
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
    setShowConfirm(false);
  }

  // Format tanggal
  const createdAt =
    task.createdAt instanceof Date
      ? task.createdAt.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        })
      : "";

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        // 2. SESUAIKAN STYLING CURSOR AGAR SESUAI DENGAN canEdit 👇
        className={`bg-white rounded-lg border p-3 group transition ${
          isDragging
            ? "shadow-xl border-blue-300 rotate-2 cursor-grabbing"
            : `border-gray-200 hover:border-gray-300 hover:shadow-sm ${
                canEdit ? "cursor-grab" : "cursor-default"
              }`
        }`}
      >
        {/* Drag handle + actions */}
        <div className="flex items-start justify-between gap-2 mb-2">
          {/* Drag handle */}
          {/* 3. SEMBUNYIKAN/UBAH DRAG HANDLE JIKA TIDAK BISA EDIT 👇 */}
          <div
            {...attributes}
            {...listeners}
            className={`mt-0.5 shrink-0 ${
              canEdit
                ? "text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
                : "text-transparent cursor-default" // Sembunyikan handle jika Viewer
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 6a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4zm8-16a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </div>

          {/* Title */}
          <p className="text-sm font-medium text-gray-800 flex-1 leading-snug">
            {task.title}
          </p>

          {/* Edit & Delete — hanya muncul saat hover dan canEdit */}
          {canEdit && !isDragging && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
              <button
                onClick={onEdit}
                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Deskripsi */}
        {task.description && (
          <p className="text-xs text-gray-400 mb-2 line-clamp-2 ml-6">
            {task.description}
          </p>
        )}

        {/* Footer — assignee & tanggal */}
        <div className="flex items-center justify-between ml-6 mt-1">
          {task.assigneeName ? (
            <div className="flex items-center gap-1.5">
              <div
                className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${bg} ${text}`}
              >
                {initials}
              </div>
              <span className="text-xs text-gray-400 truncate max-w-20">
                {task.assigneeName}
              </span>
            </div>
          ) : (
            <span className="text-xs text-gray-300">Unassigned</span>
          )}
          <span className="text-xs text-gray-300">{createdAt}</span>
        </div>
      </div>
      {/* Confirm hapus */}
      {showConfirm && (
        <ConfirmDialog
          title="Hapus Task?"
          message={`Task "${task.title}" akan dihapus permanen.`}
          confirmLabel="Ya, Hapus"
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
          isLoading={isDeleting}
          isDanger
        />
      )}
    </>
  );
}
