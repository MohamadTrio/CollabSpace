import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDocuments } from "../../hooks/useDocument";
import type { Document } from "../../types";
import Spinner from "../shared/Spinner";
import ConfirmDialog from "../shared/ConfirmDialog";

interface Props {
  projectId: string;
  canEdit: boolean;
}

export default function DocumentList({ projectId, canEdit }: Props) {
  const navigate = useNavigate();
  const {
    documents,
    loading,
    error,
    handleCreateDocument,
    handleDeleteDocument,
    clearError,
  } = useDocuments(projectId);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const hasDocuments = documents.length > 0;
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Buat dokumen & langsung buka
  async function handleCreate(title: string) {
    const docId = await handleCreateDocument(title);
    if (docId) {
      navigate(`/document/${docId}?from=${projectId}`);
    }
  }

  // Hapus dokumen 
  async function handleDelete(documentId: string) {
    setDeletingId(documentId);
    await handleDeleteDocument(documentId);
    setDeletingId(null);
    setConfirmDeleteId(null);
  }

  // Format tanggal
  function formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days < 7) return `${days} hari lalu`;

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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
        <span className="text-sm text-gray-500">
          {documents.length} dokumen
        </span>

        {canEdit && hasDocuments && (
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
            Dokumen Baru
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

      {/* Empty state */}
      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          {canEdit ? (
            <>
              <h3 className="text-gray-900 font-medium mb-1">
                Belum ada dokumen
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Buat dokumen pertama untuk mulai menulis bersama
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
              >
                Buat Dokumen Pertama
              </button>
            </>
          ) : (
            <>
              <h3 className="text-gray-900 font-medium mb-1">
                Belum ada dokumen
              </h3>
              <p className="text-gray-500 text-sm">
                Belum ada dokumen yang dibuat di proyek ini
              </p>
            </>
          )}
        </div>
      ) : (
        /* Daftar dokumen */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              canEdit={canEdit}
              formatDate={formatDate}
              onOpen={() => navigate(`/document/${doc.id}?from=${projectId}`)}
              onDelete={() => setConfirmDeleteId(doc.id)}
              isDeleting={deletingId === doc.id}
            />
          ))}
        </div>
      )}

      {/* Modal buat dokumen */}
      {showCreateModal && (
        <CreateDocumentModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}

      {/* Confirm hapus dokumen */}
      {confirmDeleteId && (
        <ConfirmDialog
          title="Hapus Dokumen?"
          message={`Dokumen "${documents.find((d) => d.id === confirmDeleteId)?.title}" beserta semua chat di dalamnya akan dihapus permanen.`}
          confirmLabel="Ya, Hapus"
          onConfirm={() => handleDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
          isLoading={deletingId === confirmDeleteId}
          isDanger
        />
      )}
    </div>
  );
}

// ─── Document Card ────────────────────────────────────────────────────────────
interface CardProps {
  document: Document;
  canEdit: boolean;
  formatDate: (date: Date) => string;
  onOpen: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function DocumentCard({
  document,
  canEdit,
  formatDate,
  onOpen,
  onDelete,
  isDeleting,
}: CardProps) {
  // Preview isi konten — ambil 100 karakter pertama
  const preview = document.content
    ? document.content
        .replace(/<[^>]*>/g, " ") // hapus semua HTML tag
        .replace(/&nbsp;/g, " ") // ganti &nbsp;
        .replace(/&amp;/g, "&") // ganti &amp;
        .replace(/&lt;/g, "<") // ganti &lt;
        .replace(/&gt;/g, ">") // ganti &gt;
        .replace(/\s+/g, " ") // rapikan spasi berlebih
        .trim()
        .slice(0, 120) +
      (document.content.replace(/<[^>]*>/g, "").length > 120 ? "..." : "")
    : "Dokumen kosong";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition group relative">
      {/* Tombol hapus */}
      {canEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={isDeleting}
          className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
        >
          {isDeleting ? (
            <svg
              className="animate-spin w-4 h-4 text-red-400"
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
          ) : (
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          )}
        </button>
      )}

      {/* buka dokumen */}
      <div onClick={onOpen} className="cursor-pointer">
        {/* Icon */}
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-100 transition">
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        {/* Judul */}
        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition pr-6">
          {document.title}
        </h3>

        {/* Preview konten */}
        <p className="text-xs text-gray-400 line-clamp-2 mb-4">{preview}</p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            Diedit oleh{" "}
            <span className="text-gray-500 font-medium">
              {document.lastEditedBy}
            </span>
          </span>
          <span>{formatDate(document.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Create Document Modal ────────────────────────────────────────────────────
interface CreateDocumentModalProps {
  onClose: () => void;
  onCreate: (title: string) => Promise<void>;
}

function CreateDocumentModal({ onClose, onCreate }: CreateDocumentModalProps) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Judul dokumen tidak boleh kosong.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onCreate(title.trim());
      onClose();
    } catch {
      setError("Gagal membuat dokumen. Silakan coba lagi.");
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Buat Dokumen Baru
          </h2>
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

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Judul Dokumen <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(null);
              }}
              placeholder="Contoh: Bab 1 - Pendahuluan"
              required
              autoFocus
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                  Membuat...
                </>
              ) : (
                "Buat & Buka"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
