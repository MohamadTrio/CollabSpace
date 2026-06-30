import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { User } from "../types";

//  Register 
export async function register(
  name: string,
  email: string,
  password: string
): Promise<void> {
  const result = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(result.user, { displayName: name });

  await setDoc(doc(db, "users", result.user.uid), {
    uid: result.user.uid,
    name,
    email,
    createdAt: serverTimestamp(),
  });

  await result.user.reload();
}

//  Login 
export async function login(
  email: string,
  password: string
): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

//  Logout 
export async function logout(): Promise<void> {
  await signOut(auth);
}

//  Get user data dari Firestore 
export async function getUserData(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;

  const data = snap.data();
  return {
    uid: data.uid,
    name: data.name,
    email: data.email,
    createdAt: data.createdAt?.toDate() ?? new Date(),
  };
}

//  Listen auth state change 
export function onAuthChange(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}