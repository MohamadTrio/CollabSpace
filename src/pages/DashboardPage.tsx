// src/pages/DashboardPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProjects } from "../hooks/useProject";

// Components
import Navbar from "../components/shared/Navbar";
import Spinner from "../components/shared/Spinner";
import ProjectCard from "../components/dashboard/ProjectCard";
import CreateProjectModal from "../components/dashboard/CreateProjectModal";

export default function DashboardPage() {
  const { user } = useAuth();
  const { projects, loading, error, handleCreateProject } = useProjects();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  const hasProjects = projects.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Selamat datang, {user?.name} 
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Kelola semua proyek kolaborasi kamu di sini
            </p>
          </div>

          {/* Tombol "Proyek Baru" — hanya tampil kalau sudah ada proyek */}
          {hasProjects && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Proyek Baru
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>

        /* Empty state — belum ada proyek */
        ) : !hasProjects ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-medium mb-1">Belum ada proyek</h3>
            <p className="text-gray-500 text-sm mb-4">
              Buat proyek pertamamu dan mulai berkolaborasi
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
              Buat Proyek Pertama
            </button>
          </div>

        /* Daftar proyek */
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                currentUid={user?.uid ?? ""}
                onClick={() => navigate(`/project/${project.id}`)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Modal buat proyek */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateProject}
        />
      )}
    </div>
  );
}