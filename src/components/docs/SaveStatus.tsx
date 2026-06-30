// src/components/docs/SaveStatus.tsx
interface Props {
  isSaving: boolean;
  lastSaved: Date | null;
}

export default function SaveStatus({ isSaving, lastSaved }: Props) {
  if (isSaving) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <span className="hidden sm:block">Menyimpan...</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="hidden sm:block">Tersimpan</span>
      </div>
    );
  }

  return null;
}