import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectPage from "./pages/ProjectPage";
import DocumentPage from "./pages/DocumentPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import Spinner from "./components/shared/Spinner";

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/project/:projectId" element={<ProtectedRoute><ProjectPage /></ProtectedRoute>} />
      <Route path="/document/:documentId" element={<ProtectedRoute><DocumentPage /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

// Public Route — redirect ke dashboard kalau sudah login
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}