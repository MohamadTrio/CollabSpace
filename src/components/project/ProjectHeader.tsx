// src/components/project/ProjectHeader.tsx
import { useNavigate } from "react-router-dom";
import type { Project } from "../../types";

interface Props {
  project: Project;
  isOwner: boolean;
  onInvite: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ProjectHeader({ project, isOwner, onInvite, onEdit, onDelete }: Props) {
  const navigate = useNavigate();
  const memberCount = Object.keys(project.members).length;

  return (
    <div className="mb-6">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition mb-3"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Dashboard
      </button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="text-gray-500 text-sm mt-1">{project.description}</p>
          )}
          <p className="text-gray-400 text-xs mt-1">{memberCount} anggota</p>
        </div>

        {/* Action buttons — hanya owner */}
        {isOwner && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Invite */}
            <button
              onClick={onInvite}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Invite
            </button>

            {/* Edit */}
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>

            {/* Hapus */}
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Hapus
            </button>
          </div>
        )}
      </div>
    </div>
  );
}