import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAuth as useAuthActions } from "../../hooks/useAuth";
import { getAvatarColor, getInitials } from "../../lib/avatar";

export default function Navbar() {
  const { user } = useAuth();
  const { handleLogout, loading } = useAuthActions();

  const initials = getInitials(user?.name ?? "?");
  const { bg, text } = getAvatarColor(user?.name ?? "");

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2 font-bold text-gray-900 hover:text-blue-600 transition"
        >
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          CollabSpace
        </Link>

        {/* User info & logout */}
        <div className="flex items-center gap-3">
          {/* Avatar + nama */}
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center ${bg} ${text}`}
            >
              {initials}
            </div>
            <span className="text-sm text-gray-700 hidden sm:block">
              {user?.name}
            </span>
          </div>

          {/* Tombol logout */}
          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="hidden sm:block">Keluar</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
