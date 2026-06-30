import { useState, useRef, useEffect, type KeyboardEvent } from "react";

interface Props {
  onSend: (text: string) => Promise<void>;
  isSending: boolean;
}

export default function ChatInput({ onSend, isSending }: Props) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [text]);

  async function handleSend() {
    if (!text.trim() || isSending) return;
    await onSend(text);
    setText("");
    // Reset tinggi textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  // Enter kirim, Shift+Enter baris baru
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="px-3 py-3 border-t border-gray-200 shrink-0">
      <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 focus-within:border-blue-400 focus-within:bg-white transition">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tulis pesan... (Enter kirim)"
          rows={1}
          disabled={isSending}
          className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none resize-none leading-relaxed disabled:opacity-50"
          style={{ maxHeight: "120px", overflowY: "auto" }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || isSending}
          className="p-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white rounded-lg transition shrink-0 mb-0.5"
        >
          {isSending ? (
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </div>
      <p className="text-xs text-gray-300 mt-1 text-center">
        Enter kirim · Shift+Enter baris baru
      </p>
    </div>
  );
}
