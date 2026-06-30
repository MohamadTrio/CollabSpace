import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { type User as FirebaseUser } from "firebase/auth";
import { onAuthChange, getUserData } from "../lib/auth";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null; // data user dari Firestore
  firebaseUser: FirebaseUser | null; // data user dari Firebase Auth
  loading: boolean; // true saat pertama kali cek status login
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {

        let userData = null;
        let attempts = 0;

        while (!userData && attempts < 3) {
          userData = await getUserData(fbUser.uid);
          if (!userData) {
            await new Promise((res) => setTimeout(res, 500));
            attempts++;
          }
        }

        setUser(userData);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// ─── Hook untuk pakai context ─────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
