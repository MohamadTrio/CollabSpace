// src/hooks/useChat.ts
import { useState, useEffect, useRef } from "react";
import {
  sendMessage,
  subscribeToChat,
  deleteMessage,
} from "../lib/firestore";
import { useAuth } from "../context/AuthContext";
import type { ChatMessage } from "../types";

// ─── Shape return value ───────────────────────────────────────────────────────
interface UseChatReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  isSending: boolean;
  handleSendMessage: (text: string) => Promise<void>;
  handleDeleteMessage: (messageId: string) => Promise<void>;
  clearError: () => void;
}

export function useChat(documentId: string): UseChatReturn {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading]   = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // ─── Subscribe realtime ke chat ──────────────────────────────────────────────
  useEffect(() => {
    if (!documentId) return;

    const unsubscribe = subscribeToChat(documentId, (data) => {
      setMessages(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [documentId]);

  // ─── Kirim pesan ─────────────────────────────────────────────────────────────
  async function handleSendMessage(text: string): Promise<void> {
    // Validasi — jangan kirim pesan kosong
    if (!user || !text.trim()) return;

    setIsSending(true);
    setError(null);
    try {
      await sendMessage(documentId, user.uid, user.name, text.trim());
    } catch {
      setError("Gagal mengirim pesan. Silakan coba lagi.");
    } finally {
      setIsSending(false);
    }
  }

  // ─── Hapus pesan ─────────────────────────────────────────────────────────────
  async function handleDeleteMessage(messageId: string): Promise<void> {
    if (!user) return;
    setError(null);
    try {
      await deleteMessage(documentId, messageId);
    } catch {
      setError("Gagal menghapus pesan. Silakan coba lagi.");
    }
  }

  function clearError(): void {
    setError(null);
  }

  return {
    messages,
    loading,
    error,
    isSending,
    handleSendMessage,
    handleDeleteMessage,
    clearError,
  };
}