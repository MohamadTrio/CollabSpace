import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import EditorToolbar from "./EditorToolbar";

interface Props {
  content: string;
  canEdit: boolean;
  typingNames: string[];
  onChange: (value: string) => void;
}

export default function DocumentEditor({
  content,
  canEdit,
  typingNames,
  onChange,
}: Props) {
  const isSyncingRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: canEdit ? "Mulai menulis di sini..." : "",
      }),
    ],
    content,
    editable: canEdit,

    onUpdate({ editor }) {
      if (isSyncingRef.current) {
        return;
      }
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== content) {
      isSyncingRef.current = true;         
      editor.commands.setContent(content, false);
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 0);
    }
  }, [content, editor]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(canEdit);
  }, [canEdit, editor]);

  function getTypingText(): string {
    if (typingNames.length === 0) return "";
    if (typingNames.length === 1) return `${typingNames[0]} sedang mengetik...`;
    if (typingNames.length === 2) return `${typingNames[0]} dan ${typingNames[1]} sedang mengetik...`;
    return `${typingNames[0]} dan ${typingNames.length - 1} orang lainnya sedang mengetik...`;
  }

  const typingText = getTypingText();

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {!canEdit && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
          <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          <span className="text-xs text-amber-700 font-medium">
            Kamu hanya bisa melihat dokumen ini
          </span>
        </div>
      )}

      {canEdit && (
        <div className="mb-4 pb-3 border-b border-gray-100">
          <EditorToolbar editor={editor} />
        </div>
      )}

      <EditorContent
        editor={editor}
        className="prose prose-sm sm:prose max-w-none focus:outline-none min-h-[70vh]"
      />

      {typingText && (
        <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
          <div className="flex gap-0.5">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]"/>
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"/>
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"/>
          </div>
          <span>{typingText}</span>
        </div>
      )}
    </div>
  );
}