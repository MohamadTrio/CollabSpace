// src/components/board/CreateTaskModal.tsx
import { useState } from "react";
import type { Member, Task } from "../../types";

interface Props {
  members: Record<string, Member>;
  task?: Task;           // kalau ada = mode edit
  onClose: () => void;
  onCreate: (
    title: string,
    description: string,
    assigneeId: string,
    assigneeName: string
  ) => Promise<void>;
  onUpdate?: (
    title: string,
    description: string,
    assigneeId: string,
    assigneeName: string
  ) => Promise<void>;
}

export default function CreateTaskModal({
  members,
  task,
  onClose,
  onCreate,
  onUpdate,
}: Props) {
  const isEdit = !!task;
  const memberList = Object.values(members);

  const [title, setTitle]           = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId ?? "");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Judul task tidak boleh kosong.");
      return;
    }

    // Cari nama assignee
    const assignee = memberList.find((m) => m.uid === assigneeId);
    const assigneeName = assignee?.name ?? "";

    setLoading(true);
    setError(null);

    try {
      if (isEdit && onUpdate) {
        await onUpdate(title.trim(), description.trim(), assigneeId, assigneeName);
      } else {
        await onCreate(title.trim(), description.trim(), assigneeId, assigneeName);
        // Reset form setelah buat
        setTitle("");
        setDescription("");
        setAssigneeId("");
      }
      onClose();
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Edit Task" : "Tambah Task Baru"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
          {/* Judul */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Judul Task <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(null); }}
              placeholder="Contoh: Budi mengerjakan Bab 1"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Deskripsi <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail tambahan tentang task ini..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Assign ke */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Assign ke <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
            >
              <option value="">-- Pilih anggota --</option>
              {memberList.map((m) => (
                <option key={m.uid} value={m.uid}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          {/* Tombol */}
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
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  {isEdit ? "Menyimpan..." : "Membuat..."}
                </>
              ) : (
                isEdit ? "Simpan Perubahan" : "Buat Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}