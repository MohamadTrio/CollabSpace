// src/components/shared/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Spinner from "./Spinner";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth();

  // Masih cek status auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Belum login — redirect ke login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Sudah login — tampilkan halaman
  return <>{children}</>;
}