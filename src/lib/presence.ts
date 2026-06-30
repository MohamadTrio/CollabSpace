import {
  ref,
  set,
  remove,
  onValue,
  onDisconnect,
  serverTimestamp,
  off,
} from "firebase/database";
import { rtdb } from "./firebase";
import type { OnlineUser } from "../types";

// ─── Join — dipanggil saat user buka dokumen ─────────────────────────────────
export function joinDocument(
  documentId: string,
  uid: string,
  name: string,
): () => void {
  const presenceRef = ref(rtdb, `presence/${documentId}/${uid}`);

  // Tulis data online user
  set(presenceRef, {
    uid,
    name,
    documentId,
    isTyping: false,
    lastSeen: serverTimestamp(),
  });

  // Otomatis hapus saat user tutup tab / disconnect
  onDisconnect(presenceRef).remove();

  return () => remove(presenceRef);
}

// ─── Leave — dipanggil saat user tutup dokumen ───────────────────────────────
export function leaveDocument(documentId: string, uid: string): void {
  const presenceRef = ref(rtdb, `presence/${documentId}/${uid}`);
  remove(presenceRef);
}

export function setTyping(
  documentId: string,
  uid: string,
  isTyping: boolean,
): void {
  const typingRef = ref(rtdb, `presence/${documentId}/${uid}/isTyping`);
  set(typingRef, isTyping);

  if (isTyping) {
    const timestampRef = ref(
      rtdb,
      `presence/${documentId}/${uid}/typingTimestamp`,
    );
    set(timestampRef, Date.now());
  }
}

// siapa saja yang online di dokumen
export function subscribeToPresence(
  documentId: string,
  currentUid: string,
  callback: (users: OnlineUser[]) => void,
): () => void {
  const presenceRef = ref(rtdb, `presence/${documentId}`);

  onValue(presenceRef, (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }

    const data = snap.val() as Record<string, OnlineUser>;

    // Filter diri sendiri, ambil semua user lain yang online
    const users = Object.values(data).filter((u) => u.uid !== currentUid);
    callback(users);
  });

  // Return unsubscribe
  return () => off(presenceRef);
}

//  Subscribe typing indicator — siapa yang sedang mengetik

export function subscribeToTyping(
  documentId: string,
  currentUid: string,
  callback: (names: string[]) => void,
): () => void {
  const presenceRef = ref(rtdb, `presence/${documentId}`);

  onValue(presenceRef, (snap) => {
    if (!snap.exists()) return callback([]);

    const data = snap.val() as Record<
      string,
      OnlineUser & { typingTimestamp?: number }
    >;
    const now = Date.now();

    const active = Object.values(data)
      .filter((u) => {
        if (u.uid === currentUid) return false;
        if (!u.isTyping) return false; 
        if (!u.typingTimestamp) return false; 
        return now - u.typingTimestamp < 3000; 
      })
      .map((u) => u.name);

    callback(active);
  });

  return () => off(presenceRef);
}
