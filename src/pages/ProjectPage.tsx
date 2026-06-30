import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProject } from "../hooks/useProject";
import Navbar from "../components/shared/Navbar";
import Spinner from "../components/shared/Spinner";
import ConfirmDialog from "../components/shared/ConfirmDialog";
import ProjectHeader from "../components/project/ProjectHeader";
import MemberList from "../components/project/MemberList";
import InviteMemberModal from "../components/project/InviteMemberModal";
import KanbanBoard from "../components/board/KanbanBoard";
import DocumentList from "../components/docs/DocumentList";

type Tab = "board" | "docs" | "members";

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const {
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
  } = useProject(projectId ?? "");

  const initialTab = (searchParams.get("tab") as Tab) ?? "board";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      </div>
    );
  }

  // ─── Proyek tidak ditemukan ──────────────────────────────────────────────────
  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Proyek tidak ditemukan
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Proyek ini mungkin sudah dihapus atau kamu tidak punya akses.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ─── Hapus proyek ────────────────────────────────────────────────────────────
  async function onDeleteProject() {
    setIsDeleting(true);
    await handleDeleteProject();
    navigate("/dashboard");
    setIsDeleting(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Header proyek */}
        <ProjectHeader
          project={project}
          isOwner={isOwner}
          onInvite={() => setShowInviteModal(true)}
          onEdit={() => setShowEditModal(true)}
          onDelete={() => setShowDeleteDialog(true)}
        />
        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
          {(["board", "docs", "members"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "board" && "📋 Board"}
              {tab === "docs" && "📄 Docs"}
              {tab === "members" && "👥 Anggota"}
            </button>
          ))}
        </div>
        {/* ─── TAB CONTENT (Konten yang berubah-ubah) ─── */}
        {/* 1. Konten Board */}
        {activeTab === "board" && (
          <KanbanBoard
            projectId={project.id}
            members={project.members}
            canEdit={canEdit}
          />
        )}
        {/* 2. Konten Docs */}
        {activeTab === "docs" && (
          <DocumentList projectId={project.id} canEdit={canEdit} />
        )}

        {/* 3. Konten Members */}
        {activeTab === "members" && (
          <MemberList
            members={project.members}
            currentUid={user?.uid ?? ""}
            isOwner={isOwner}
            onUpdateRole={handleUpdateMemberRole}
            onRemoveMember={handleRemoveMember}
          />
        )}
      </main>

      {/* Modal invite */}
      {showInviteModal && (
        <InviteMemberModal
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInviteMember}
        />
      )}

      {/* Modal edit proyek */}
      {showEditModal && (
        <EditProjectModal
          name={project.name}
          description={project.description}
          onClose={() => setShowEditModal(false)}
          onSave={async (name, description) => {
            await handleUpdateProject(name, description);
            setShowEditModal(false);
          }}
        />
      )}

      {/* Dialog konfirmasi hapus */}
      {showDeleteDialog && (
        <ConfirmDialog
          title="Hapus Proyek?"
          message={`Proyek "${project.name}" beserta semua task dan dokumen di dalamnya akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`}
          confirmLabel="Ya, Hapus"
          onConfirm={onDeleteProject}
          onCancel={() => setShowDeleteDialog(false)}
          isLoading={isDeleting}
          isDanger
        />
      )}
    </div>
  );
}

//  Edit Project Modal
interface EditProjectModalProps {
  name: string;
  description: string;
  onClose: () => void;
  onSave: (name: string, description: string) => Promise<void>;
}

function EditProjectModal({
  name,
  description,
  onClose,
  onSave,
}: EditProjectModalProps) {
  const [newName, setNewName] = useState(name);
  const [newDescription, setNewDescription] = useState(description);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) {
      setError("Nama proyek tidak boleh kosong.");
      return;
    }
    setLoading(true);
    try {
      await onSave(newName.trim(), newDescription.trim());
    } catch {
      setError("Gagal menyimpan perubahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Edit Proyek</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nama Proyek <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setError(null);
              }}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Deskripsi{" "}
              <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
