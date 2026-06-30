import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDocument } from "../hooks/useDocument";
import { useProject } from "../hooks/useProject";
import { exportResultToPDF } from "../lib/exportPdf";
import Spinner from "../components/shared/Spinner";
import DocumentEditor from "../components/docs/DocumentEditor";
import OnlineUsers from "../components/docs/OnlineUsers";
import SaveStatus from "../components/docs/SaveStatus";
import ChatPanel from "../components/chat/ChatPanel";

export default function DocumentPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Ambil projectId dari query param ?from=projectId
  const fromProjectId = searchParams.get("from");

  const {
    document,
    content,
    title,
    onlineUsers,
    typingNames,
    isSaving,
    lastSaved,
    loading,
    handleContentChange,
    handleTitleChange,
  } = useDocument(documentId ?? "");

  // Ambil data proyek untuk cek permission
  const { project } = useProject(document?.projectId ?? "");
  const myRole = user && project ? project.members[user.uid]?.role : null;
  const canEdit = myRole === "owner" || myRole === "editor";

  const [showChat, setShowChat] = useState(false);

  //  Loading 
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  //  Dokumen tidak ditemukan 
  if (!document) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Dokumen tidak ditemukan
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          Dokumen ini mungkin sudah dihapus atau kamu tidak punya akses.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          Kembali
        </button>
      </div>
    );
  }

  // Fungsi kembali — ke tab docs kalau ada fromProjectId
  function handleBack() {
    if (fromProjectId) {
      navigate(`/project/${fromProjectId}?tab=docs`);
    } else {
      navigate(-1);
    }
  }

  //  Download functions 
  async function handleDownloadPdf() {
    if (!content) return;
    try {
      await exportResultToPDF(content, title);
    } catch (error) {
      console.error("Gagal mengekspor PDF:", error);
      alert("Terjadi kesalahan saat mengunduh PDF.");
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/*  Navbar editor  */}
      <header className="border-b border-gray-200 px-4 py-2 flex items-center gap-3 sticky top-0 bg-white z-40">
        {/* Tombol kembali */}
        <button
          onClick={handleBack}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition shrink-0"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Judul dokumen */}
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          disabled={!canEdit}
          placeholder="Judul dokumen..."
          className="flex-1 text-lg font-semibold text-gray-900 bg-transparent border-none outline-none focus:bg-gray-50 rounded-lg px-2 py-1 transition disabled:cursor-default min-w-0"
        />

        <div className="flex items-center gap-3 shrink-0">
          {/* Save status */}
          <SaveStatus isSaving={isSaving} lastSaved={lastSaved} />

          {/* Online users */}
          <OnlineUsers users={onlineUsers} />

          {/* Tombol toggle chat */}
          {canEdit && (
            <button
              onClick={() => setShowChat((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                showChat
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="hidden sm:block">Chat</span>
            </button>
          )}
        </div>

        {/* Download */}
        <div className="relative group">
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition"
            title="Download dokumen"
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span className="hidden sm:block">Download</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Editor */}
        <main className="flex-1 overflow-y-auto">
          <DocumentEditor
            content={content}
            canEdit={canEdit}
            typingNames={typingNames}
            onChange={handleContentChange}
          />
        </main>

        {/* Chat panel  */}
        {showChat && canEdit && (
          <div className="fixed top-14.25 right-0 bottom-0 w-80 bg-white border-l border-gray-200 flex flex-col z-30 shadow-lg">
            <ChatPanel
              documentId={documentId ?? ""}
              onClose={() => setShowChat(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
