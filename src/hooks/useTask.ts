// src/hooks/useTask.ts
import { useState, useEffect } from "react";
import {
  createTask,
  subscribeToTasks,
  updateTask,
  moveTask,
  deleteTask,
} from "../lib/firestore";
import { useAuth } from "../context/AuthContext";
import type { Task, TaskColumn } from "../types";

// ─── Shape return value ───────────────────────────────────────────────────────
interface UseTaskReturn {
  tasks: Task[];
  todoTasks: Task[];
  doingTasks: Task[];
  doneTasks: Task[];
  loading: boolean;
  error: string | null;
  handleCreateTask: (
    title: string,
    description: string,
    assigneeId: string,
    assigneeName: string
  ) => Promise<void>;
  handleUpdateTask: (
    taskId: string,
    title: string,
    description: string,
    assigneeId: string,
    assigneeName: string
  ) => Promise<void>;
  handleMoveTask: (
    taskId: string,
    newColumn: TaskColumn,
    newOrder: number
  ) => Promise<void>;
  handleDeleteTask: (taskId: string) => Promise<void>;
  clearError: () => void;
}

export function useTask(projectId: string): UseTaskReturn {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Subscribe realtime ke semua tasks ───────────────────────────────────────
  useEffect(() => {
    if (!projectId) return;

    const unsubscribe = subscribeToTasks(projectId, (data) => {
      setTasks(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [projectId]);

  // ─── Filter tasks per kolom ───────────────────────────────────────────────────
  const todoTasks  = tasks.filter((t) => t.column === "todo");
  const doingTasks = tasks.filter((t) => t.column === "doing");
  const doneTasks  = tasks.filter((t) => t.column === "done");

  // ─── Buat task baru ───────────────────────────────────────────────────────────
  async function handleCreateTask(
    title: string,
    description: string,
    assigneeId: string,
    assigneeName: string
  ): Promise<void> {
    if (!user) return;
    setError(null);
    try {
      await createTask(
        projectId,
        title,
        description,
        assigneeId,
        assigneeName
      );
    } catch {
      setError("Gagal membuat task. Silakan coba lagi.");
    }
  }

  // ─── Edit task ────────────────────────────────────────────────────────────────
  async function handleUpdateTask(
    taskId: string,
    title: string,
    description: string,
    assigneeId: string,
    assigneeName: string
  ): Promise<void> {
    if (!user) return;
    setError(null);
    try {
      await updateTask(
        projectId,
        taskId,
        title,
        description,
        assigneeId,
        assigneeName
      );
    } catch {
      setError("Gagal mengubah task. Silakan coba lagi.");
    }
  }

  // ─── Pindah kolom (drag & drop) ───────────────────────────────────────────────
  async function handleMoveTask(
    taskId: string,
    newColumn: TaskColumn,
    newOrder: number
  ): Promise<void> {
    if (!user) return;
    setError(null);

    // Optimistic update — update UI dulu sebelum tunggu Firestore
    // supaya drag & drop terasa instan
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, column: newColumn, order: newOrder }
          : t
      )
    );

    try {
      await moveTask(projectId, taskId, newColumn, newOrder);
    } catch {
      setError("Gagal memindahkan task. Silakan coba lagi.");
      // Kalau gagal, Firestore snapshot akan otomatis revert UI
    }
  }

  // ─── Hapus task ───────────────────────────────────────────────────────────────
  async function handleDeleteTask(taskId: string): Promise<void> {
    if (!user) return;
    setError(null);
    try {
      await deleteTask(projectId, taskId);
    } catch {
      setError("Gagal menghapus task. Silakan coba lagi.");
    }
  }

  function clearError(): void {
    setError(null);
  }

  return {
    tasks,
    todoTasks,
    doingTasks,
    doneTasks,
    loading,
    error,
    handleCreateTask,
    handleUpdateTask,
    handleMoveTask,
    handleDeleteTask,
    clearError,
  };
}