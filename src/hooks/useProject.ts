// src/hooks/useProject.ts
import { useState, useEffect } from "react";
import {
  createProject,
  subscribeToProject,
  subscribeToProjects,
  updateProject,
  deleteProject,
  inviteMember,
  updateMemberRole,
  removeMember,
} from "../lib/firestore";
import { useAuth } from "../context/AuthContext";
import type { Project, Role } from "../types";

// ═════════════════════════════════════════════════════════════════════════════
// useProjects — untuk DashboardPage (daftar semua proyek)
// ═════════════════════════════════════════════════════════════════════════════
interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  handleCreateProject: (name: string, description: string) => Promise<void>;
  clearError: () => void;
}

export function useProjects(): UseProjectsReturn {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Subscribe realtime ke semua proyek milik user
    const unsubscribe = subscribeToProjects(user.uid, (data) => {
      setProjects(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  async function handleCreateProject(
    name: string,
    description: string
  ): Promise<void> {
    if (!user) return;
    setError(null);
    try {
      await createProject(
        user.uid,
        user.name,
        user.email,
        name,
        description
      );
    } catch {
      setError("Gagal membuat proyek. Silakan coba lagi.");
    }
  }

  function clearError(): void {
    setError(null);
  }

  return { projects, loading, error, handleCreateProject, clearError };
}

// ═════════════════════════════════════════════════════════════════════════════
// useProject — untuk ProjectPage (satu proyek spesifik)
// ═════════════════════════════════════════════════════════════════════════════
interface UseProjectReturn {
  project: Project | null;
  loading: boolean;
  error: string | null;
  isOwner: boolean;
  canEdit: boolean;
  handleUpdateProject: (name: string, description: string) => Promise<void>;
  handleDeleteProject: () => Promise<void>;
  handleInviteMember: (email: string, role: "editor" | "viewer") => Promise<{ success: boolean; message: string }>;
  handleUpdateMemberRole: (uid: string, role: "editor" | "viewer") => Promise<void>;
  handleRemoveMember: (uid: string) => Promise<void>;
  clearError: () => void;
}

export function useProject(projectId: string): UseProjectReturn {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const unsubscribe = subscribeToProject(projectId, (data) => {
      setProject(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [projectId]);

  // ─── Permission check ───────────────────────────────────────────────────────
  const myRole = user && project ? project.members[user.uid]?.role : null;
  const isOwner = myRole === "owner";
  const canEdit = myRole === "owner" || myRole === "editor";

  // ─── Update proyek ──────────────────────────────────────────────────────────
  async function handleUpdateProject(
    name: string,
    description: string
  ): Promise<void> {
    if (!isOwner) return;
    setError(null);
    try {
      await updateProject(projectId, name, description);
    } catch {
      setError("Gagal mengubah proyek. Silakan coba lagi.");
    }
  }

  // ─── Hapus proyek ───────────────────────────────────────────────────────────
  async function handleDeleteProject(): Promise<void> {
    if (!isOwner) return;
    setError(null);
    try {
      await deleteProject(projectId);
    } catch {
      setError("Gagal menghapus proyek. Silakan coba lagi.");
    }
  }

  // ─── Invite anggota ─────────────────────────────────────────────────────────
  async function handleInviteMember(
    email: string,
    role: "editor" | "viewer"
  ): Promise<{ success: boolean; message: string }> {
    if (!isOwner) return { success: false, message: "Hanya owner yang bisa invite." };
    try {
      return await inviteMember(projectId, email, role);
    } catch {
      return { success: false, message: "Gagal mengundang anggota." };
    }
  }

  // ─── Ubah role anggota ──────────────────────────────────────────────────────
  async function handleUpdateMemberRole(
    uid: string,
    role: "editor" | "viewer"
  ): Promise<void> {
    if (!isOwner) return;
    setError(null);
    try {
      await updateMemberRole(projectId, uid, role);
    } catch {
      setError("Gagal mengubah role. Silakan coba lagi.");
    }
  }

  // ─── Keluarkan / keluar dari proyek ─────────────────────────────────────────
  async function handleRemoveMember(uid: string): Promise<void> {
    // Owner bisa keluarkan siapa saja
    // Non-owner hanya bisa keluarkan diri sendiri (leave)
    if (!isOwner && uid !== user?.uid) return;
    setError(null);
    try {
      await removeMember(projectId, uid);
    } catch {
      setError("Gagal mengeluarkan anggota. Silakan coba lagi.");
    }
  }

  function clearError(): void {
    setError(null);
  }

  return {
    project,
    loading,
    error,
    isOwner,
    canEdit,
    handleUpdateProject,
    handleDeleteProject,
    handleInviteMember,
    handleUpdateMemberRole,
    handleRemoveMember,
    clearError,
  };
}