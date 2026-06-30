// src/hooks/useDocument.ts
import { useState, useEffect, useRef, useCallback } from "react";
import {
  createDocument,
  subscribeToDocuments,
  subscribeToDocument,
  updateDocumentContent,
  updateDocumentTitle,
  deleteDocument,
} from "../lib/firestore";
import {
  joinDocument,
  leaveDocument,
  setTyping,
  subscribeToPresence,
  subscribeToTyping,
} from "../lib/presence";
import { useAuth } from "../context/AuthContext";
import type { Document, OnlineUser } from "../types";

// ═════════════════════════════════════════════════════════════════════════════
// useDocuments — untuk DocumentList (daftar dokumen dalam proyek)
// ═════════════════════════════════════════════════════════════════════════════
interface UseDocumentsReturn {
  documents: Document[];
  loading: boolean;
  error: string | null;
  handleCreateDocument: (title: string) => Promise<string | null>;
  handleDeleteDocument: (documentId: string) => Promise<void>;
  clearError: () => void;
}

export function useDocuments(projectId: string): UseDocumentsReturn {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const unsubscribe = subscribeToDocuments(projectId, (data) => {
      setDocuments(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [projectId]);

  // ─── Buat dokumen baru ───────────────────────────────────────────────────────
  async function handleCreateDocument(title: string): Promise<string | null> {
    if (!user) return null;
    setError(null);
    try {
      const docId = await createDocument(projectId, title, user.uid, user.name);
      return docId;
    } catch {
      setError("Gagal membuat dokumen. Silakan coba lagi.");
      return null;
    }
  }

  // ─── Hapus dokumen ───────────────────────────────────────────────────────────
  async function handleDeleteDocument(documentId: string): Promise<void> {
    setError(null);
    try {
      await deleteDocument(documentId);
    } catch {
      setError("Gagal menghapus dokumen. Silakan coba lagi.");
    }
  }

  function clearError(): void {
    setError(null);
  }

  return {
    documents,
    loading,
    error,
    handleCreateDocument,
    handleDeleteDocument,
    clearError,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// useDocument — untuk DocumentPage (editor satu dokumen)
// ═════════════════════════════════════════════════════════════════════════════
interface UseDocumentReturn {
  document: Document | null;
  content: string;
  title: string;
  onlineUsers: OnlineUser[];
  typingNames: string[];
  isSaving: boolean;
  lastSaved: Date | null;
  loading: boolean;
  handleContentChange: (newContent: string) => void;
  handleTitleChange: (newTitle: string) => Promise<void>;
}

const SAVE_DEBOUNCE_MS = 1500; // tunggu 1.5 detik setelah berhenti mengetik

export function useDocument(documentId: string): UseDocumentReturn {
  const { user } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingNames, setTypingNames] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  // Refs untuk debounce — pakai ref supaya tidak trigger re-render
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const typingTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // ─── Subscribe ke dokumen ────────────────────────────────────────────────────
  useEffect(() => {
    if (!documentId) return;

    const unsubscribe = subscribeToDocument(documentId, (doc) => {
      if (!doc) return;
      setDocument(doc);
      setTitle(doc.title);

      // Hanya update content dari Firestore kalau tidak sedang mengetik
      // (tidak ada save timer aktif) — mencegah konten loncat saat mengetik
      if (!saveTimerRef.current) {
        setContent(doc.content);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [documentId]);

  // ─── Join & leave presence ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !documentId) return;

    const leave = joinDocument(documentId, user.uid, user.name);
    const unsubPresence = subscribeToPresence(
      documentId,
      user.uid,
      setOnlineUsers,
    );
    const unsubTyping = subscribeToTyping(documentId, user.uid, setTypingNames);

    return () => {
      leave();
      leaveDocument(documentId, user.uid);
      unsubPresence();
      unsubTyping();
    };
  }, [documentId, user?.uid]);

  // ─── Handle content change dengan debounced auto-save ────────────────────────
  const handleContentChange = useCallback(
    (newContent: string) => {
      if (!user) return;

      // Update UI langsung
      setContent(newContent);
      setIsSaving(true);

      // Set typing indicator ON
      setTyping(documentId, user.uid, true);

      // Clear timer sebelumnya
      clearTimeout(saveTimerRef.current);
      clearTimeout(typingTimerRef.current);

      // Timer untuk save ke Firestore
      saveTimerRef.current = setTimeout(async () => {
        try {
          await updateDocumentContent(documentId, newContent, user.name);
          setIsSaving(false);
          setLastSaved(new Date());
        } catch {
          setIsSaving(false);
        }
        saveTimerRef.current = undefined;
      }, SAVE_DEBOUNCE_MS);

      // Timer untuk matikan typing indicator
      typingTimerRef.current = setTimeout(() => {
        setTyping(documentId, user.uid, false);
      }, 2000);
    },
    [documentId, user],
  );

  // ─── Handle title change ─────────────────────────────────────────────────────
  async function handleTitleChange(newTitle: string): Promise<void> {
    if (!user) return;
    setTitle(newTitle);
    try {
      await updateDocumentTitle(documentId, newTitle);
    } catch {
      // Revert kalau gagal
      setTitle(document?.title ?? "");
    }
  }

  // ─── Cleanup timer saat unmount ──────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearTimeout(saveTimerRef.current);
      clearTimeout(typingTimerRef.current);
    };
  }, []);

  return {
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
  };
}
