import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function RegisterPage() {
  const { handleRegister, loading, error } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [localError, setLocalError] = useState<string | null>(null);

  const isFormValid =
    name.trim() !== "" &&
    email.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "" &&
    password === confirmPassword &&
    password.length >= 6;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);

    if (!name.trim()) {
      setLocalError("Nama wajib diisi");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Password dan konfirmasi password tidak sama");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password minimal 6 karakter");
      return;
    }

    await handleRegister(name, email, password);
  }

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#eff6ff_50%,#e0e7ff_100%)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#0a66c2] rounded-xl shadow-md mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">CollabSpace</h1>

          <p className="text-gray-500 mt-2">
            Buat akun untuk mulai berkolaborasi
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama */}
            <input
              type="text"
              placeholder="Nama Lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border-2 border-[#e3e6eb] focus:border-[#0a66c2] focus:outline-none transition-colors"
            />

            {/* Email */}
            <input
              type="email"
              placeholder="Alamat Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border-2 border-[#e3e6eb] focus:border-[#0a66c2] focus:outline-none transition-colors"
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 pr-12 rounded-xl border-2 border-[#e3e6eb] focus:border-[#0a66c2] focus:outline-none transition-colors"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Konfirmasi Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Konfirmasi Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-12 px-4 pr-12 rounded-xl border-2 border-[#e3e6eb] focus:border-[#0a66c2] focus:outline-none transition-colors"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Error */}
            {displayError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-600">{displayError}</p>
              </div>
            )}

            {/* Button Register */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className={`w-full h-12 rounded-xl font-semibold transition-all duration-300 ${
                isFormValid && !loading
                  ? "text-white bg-[linear-gradient(90deg,#0a66c2_0%,#004182_100%)] hover:opacity-90"
                  : "bg-gray-300 text-gray-500"
              } ${loading ? "cursor-wait" : isFormValid ? "cursor-pointer" : "cursor-not-allowed"}`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Mendaftarkan...
                </div>
              ) : (
                "Daftar"
              )}
            </button>
          </form>

          {/* Login */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">Sudah memiliki akun?</p>

            <Link
              to="/login"
              className="mt-3 inline-flex items-center justify-center w-full h-12 rounded-xl bg-[#eaf2ff] text-[#0a66c2] font-medium hover:bg-[#dbeafe] transition"
            >
              Masuk Sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
