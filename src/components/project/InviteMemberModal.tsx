// src/components/project/InviteMemberModal.tsx
import { useState } from "react";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../../lib/firebase"; // Sesuaikan path jika berbeda (misal: "../lib/firebase")

interface Props {
  onClose: () => void;
  onInvite: (email: string, role: "editor" | "viewer") => Promise<{ success: boolean; message: string }>;
}

export default function InviteMemberModal({ onClose, onInvite }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // State baru untuk fitur autocomplete
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Fungsi untuk menangani perubahan input dan mencari email di Firebase
  async function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value.toLowerCase();
    setEmail(text);
    setResult(null);

    // Kosongkan saran jika teks kurang dari 2 karakter
    if (text.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const q = query(
        collection(db, "users"),
        where("email", ">=", text),
        where("email", "<=", text + "\uf8ff"),
        limit(5) // Batasi 5 hasil saja agar tidak kepanjangan
      );

      const snap = await getDocs(q);
      const matchedEmails = snap.docs.map((doc) => doc.data().email);
      setSuggestions(matchedEmails);
    } catch (error) {
      console.error("Gagal mengambil saran email:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setResult(null);
    const res = await onInvite(email.trim(), role);
    setResult(res);
    setLoading(false);
    if (res.success) {
      setEmail("");
      setSuggestions([]); // Kosongkan saran jika berhasil
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Invite Anggota</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Result message */}
        {result && (
          <div className={`mb-4 p-3 rounded-lg text-sm border ${
            result.success
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-600"
          }`}>
            {result.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email dengan Autocomplete */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Anggota
            </label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange} // <-- Gunakan fungsi baru ini
              placeholder="nama@email.com"
              required
              autoComplete="off" // Matikan bawaan browser agar tidak bertumpuk
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            
            {/* Indikator Loading Kecil (Opsional) */}
            {loadingSuggestions && (
              <div className="absolute right-3 top-[38px]">
                <svg className="animate-spin w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              </div>
            )}

            {/* Dropdown Suggestions */}
            {suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((suggestionEmail) => (
                  <li
                    key={suggestionEmail}
                    onClick={() => {
                      setEmail(suggestionEmail);
                      setSuggestions([]); // Tutup dropdown saat diklik
                    }}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 transition-colors border-b last:border-b-0 border-gray-100"
                  >
                    {suggestionEmail}
                  </li>
                ))}
              </ul>
            )}

            <p className="text-xs text-gray-400 mt-1">
              User harus sudah terdaftar di CollabSpace
            </p>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["editor", "viewer"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`p-3 rounded-lg border text-left transition ${
                    role === r
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`text-sm font-medium mb-0.5 capitalize ${
                    role === r ? "text-blue-700" : "text-gray-700"
                  }`}>
                    {r}
                  </div>
                  <div className="text-xs text-gray-400">
                    {r === "editor" ? "Bisa edit & tambah task" : "Hanya bisa lihat"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tombol */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Tutup
            </button>
            <button
              type="submit"
              disabled={loading || !email} // Disable jika loading atau email kosong
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Mengundang...
                </>
              ) : (
                "Kirim Undangan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}