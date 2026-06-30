import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">

      {/* angka 404 */}
      <div className="relative mb-8">
        <p className="text-[120px] font-black text-gray-100 leading-none select-none">
          4O4
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-22 h-22 bg-blue-100 rounded-full flex items-center justify-center mt-4">
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Teks */}
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Halaman tidak ditemukan
      </h1>
      <p className="text-gray-500 text-sm mb-8 max-w-sm">
        Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        Pastikan URL yang kamu masukkan sudah benar.
      </p>

      {/* Tombol aksi */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>

        <button
          onClick={() => navigate(user ? "/dashboard" : "/login")}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {user ? "Ke Dashboard" : "Ke Login"}
        </button>
      </div>

    </div>
  );
}