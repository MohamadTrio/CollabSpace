// src/components/chat/ChatMessage.tsx
import { useState } from "react";
import type { ChatMessage } from "../../types";

import { getAvatarColor, getInitials } from "../../lib/avatar";

interface Props {
  message: ChatMessage;
  isOwn: boolean;
  onDelete: () => Promise<void>;
}

export default function ChatMessageItem({ message, isOwn, onDelete }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const { bg, text } = getAvatarColor(message.senderName);
  const initials = getInitials(message.senderName);

  async function handleDelete() {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
  }

  function formatTime(date: Date): string {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div
      className={`group flex gap-2 px-1 py-0.5 rounded-lg hover:bg-gray-50 ${
        isOwn ? "flex-row-reverse" : "flex-row"
      }`}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      {/* Avatar */}
      {!isOwn && (
        <div
          className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-1 ${bg} ${text}`}
        >
          {initials}
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}
      >
        {/* Nama pengirim — hanya untuk pesan orang lain */}
        {!isOwn && (
          <span className="text-xs text-gray-400 mb-0.5 px-1">
            {message.senderName}
          </span>
        )}

        <div
          className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
            isOwn
              ? "bg-blue-600 text-white rounded-tr-sm"
              : "bg-gray-100 text-gray-800 rounded-tl-sm"
          }`}
        >
          <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {message.text}
          </span>
        </div>

        {/* Waktu */}
        <span className="text-xs text-gray-300 mt-0.5 px-1">
          {formatTime(message.createdAt)}
        </span>
      </div>

      {/* Tombol hapus — hanya pesan sendiri */}
      {isOwn && showDelete && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="self-center p-1 text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
        >
          {isDeleting ? (
            <svg
              className="animate-spin w-3.5 h-3.5"
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
          )}
        </button>
      )}
    </div>
  );
}
