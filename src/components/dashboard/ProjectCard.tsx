// src/components/dashboard/ProjectCard.tsx
import type { Project } from "../../types";
import { Users } from "lucide-react";

interface Props {
  project: Project;
  currentUid: string;
  onClick: () => void;
}

export default function ProjectCard({ project, currentUid, onClick }: Props) {
  const myRole = project.members[currentUid]?.role;
  const memberCount = Object.keys(project.members).length;

  // Format tanggal
  const createdAt = project.createdAt instanceof Date
    ? project.createdAt.toLocaleDateString("id-ID", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "";

  const roleColor: Record<string, string> = {
    owner  : "bg-blue-100 text-blue-700",
    editor : "bg-green-100 text-green-700",
    viewer : "bg-gray-100 text-gray-600",
  };

  const roleLabel: Record<string, string> = {
    owner  : "Owner",
    editor : "Editor",
    viewer : "Viewer",
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md cursor-pointer transition group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        {myRole && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${roleColor[myRole]}`}>
            {roleLabel[myRole]}
          </span>
        )}
      </div>

      {/* Nama & deskripsi */}
      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition">
        {project.name}
      </h3>
      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
        {project.description || "Tidak ada deskripsi"}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {memberCount} anggota
        </div>
        <span>{createdAt}</span>
      </div>
    </div>
  );
}