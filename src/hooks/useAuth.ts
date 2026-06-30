// src/hooks/useAuth.ts
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register, login, logout } from "../lib/auth";

// ─── Shape return value hook ──────────────────────────────────────────────────
interface UseAuthReturn {
  loading: boolean;
  error: string | null;
  handleRegister: (name: string, email: string, password: string) => Promise<void>;
  handleLogin: (email: string, password: string) => Promise<void>;
  handleLogout: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // ─── Register ───────────────────────────────────────────────────────────────
  async function handleRegister(
    name: string,
    email: string,
    password: string
  ): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  // ─── Login ──────────────────────────────────────────────────────────────────
  async function handleLogin(
    email: string,
    password: string
  ): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  // ─── Logout ─────────────────────────────────────────────────────────────────
  async function handleLogout(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      await logout();
      navigate("/login");
    } catch (err: any) {
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  // ─── Clear error ─────────────────────────────────────────────────────────────
  function clearError(): void {
    setError(null);
  }

  return {
    loading,
    error,
    handleRegister,
    handleLogin,
    handleLogout,
    clearError,
  };
}

// ─── Firebase error code → pesan Indonesia ───────────────────────────────────
function getFriendlyError(code: string): string {
  const map: Record<string, string> = {
    "auth/email-already-in-use"  : "Email ini sudah terdaftar.",
    "auth/invalid-email"         : "Format email tidak valid.",
    "auth/weak-password"         : "Password minimal 6 karakter.",
    "auth/user-not-found"        : "Email tidak ditemukan.",
    "auth/wrong-password"        : "Password salah.",
    "auth/invalid-credential"    : "Email atau password salah.",
    "auth/too-many-requests"     : "Terlalu banyak percobaan. Coba lagi nanti.",
    "auth/network-request-failed": "Koneksi bermasalah. Periksa internet kamu.",
  };
  return map[code] ?? "Terjadi kesalahan. Silakan coba lagi.";
}