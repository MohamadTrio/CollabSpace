import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  Timestamp,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  Project,
  Task,
  TaskColumn,
  Document,
  ChatMessage,
  Member,
} from "../types";

// ─── Helper ───────────────────────────────────────────────────────────────────
const toDate = (v: Timestamp | Date | undefined): Date =>
  v instanceof Timestamp ? v.toDate() : (v ?? new Date());

// Buat proyek baru
export async function createProject(
  ownerId: string,
  ownerName: string,
  ownerEmail: string,
  name: string,
  description: string,
): Promise<string> {
  const ownerMember: Member = {
    uid: ownerId,
    name: ownerName,
    email: ownerEmail,
    role: "owner",
  };

  const ref = await addDoc(collection(db, "projects"), {
    name,
    description,
    ownerId,
    memberUids: [ownerId],
    members: { [ownerId]: ownerMember },
    createdAt: serverTimestamp(),
  });

  return ref.id;
}

// Ambil semua proyek milik user
export function subscribeToProjects(
  uid: string,
  callback: (projects: Project[]) => void,
): () => void {
  const q = query(
    collection(db, "projects"),
    where("memberUids", "array-contains", uid),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(q, (snap) => {
    const projects = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: toDate(d.data().createdAt),
    })) as Project[];
    callback(projects);
  });
}

// Ambil satu proyek
export function subscribeToProject(
  projectId: string,
  callback: (project: Project | null) => void,
): () => void {
  return onSnapshot(doc(db, "projects", projectId), (snap) => {
    if (!snap.exists()) return callback(null);
    const data = snap.data();
    callback({
      id: snap.id,
      ...data,
      createdAt: toDate(data.createdAt),
    } as Project);
  });
}

// Edit nama & deskripsi proyek
export async function updateProject(
  projectId: string,
  name: string,
  description: string,
): Promise<void> {
  await updateDoc(doc(db, "projects", projectId), { name, description });
}

// Hapus proyek beserta semua tasks & documents-nya
export async function deleteProject(projectId: string): Promise<void> {
  const batch = writeBatch(db);

  // Hapus semua tasks
  const tasksSnap = await getDocs(
    collection(db, "projects", projectId, "tasks"),
  );
  tasksSnap.forEach((d) => batch.delete(d.ref));

  // Hapus semua documents & chat di dalamnya
  const docsSnap = await getDocs(
    query(collection(db, "documents"), where("projectId", "==", projectId)),
  );
  for (const docSnap of docsSnap.docs) {
    const chatSnap = await getDocs(
      collection(db, "documents", docSnap.id, "chat"),
    );
    chatSnap.forEach((c) => batch.delete(c.ref));
    batch.delete(docSnap.ref);
  }

  // Hapus proyek itu sendiri
  batch.delete(doc(db, "projects", projectId));

  await batch.commit();
}

// Members 

// Invite anggota — cari user by email dulu
export async function inviteMember(
  projectId: string,
  email: string,
  role: "editor" | "viewer",
): Promise<{ success: boolean; message: string }> {
  // Cari user berdasarkan email di collection users
  const q = query(collection(db, "users"), where("email", "==", email));
  const snap = await getDocs(q);

  if (snap.empty) {
    return {
      success: false,
      message: "User dengan email ini tidak ditemukan.",
    };
  }

  const userData = snap.docs[0].data();

  // Cek apakah sudah jadi anggota
  const projectSnap = await getDoc(doc(db, "projects", projectId));
  const projectData = projectSnap.data();
  if (projectData?.members?.[userData.uid]) {
    return { success: false, message: "User ini sudah menjadi anggota." };
  }

  const newMember: Member = {
    uid: userData.uid,
    name: userData.name,
    email: userData.email,
    role,
  };

  await updateDoc(doc(db, "projects", projectId), {
    memberUids: arrayUnion(userData.uid),
    [`members.${userData.uid}`]: newMember,
  });

  return { success: true, message: `${userData.name} berhasil diundang.` };
}

// Ubah role anggota
export async function updateMemberRole(
  projectId: string,
  uid: string,
  role: "editor" | "viewer",
): Promise<void> {
  await updateDoc(doc(db, "projects", projectId), {
    [`members.${uid}.role`]: role,
  });
}

// Keluarkan anggota / keluar sendiri
export async function removeMember(
  projectId: string,
  uid: string,
): Promise<void> {
  const batch = writeBatch(db);
  const projectRef = doc(db, "projects", projectId);
  const snap = await getDoc(projectRef);
  if (!snap.exists()) return;

  const members = { ...snap.data().members };
  delete members[uid];

  batch.update(projectRef, {
    members,
    memberUids: arrayRemove(uid),
  });
  await batch.commit();
}

// TASKS
export async function createTask(
  projectId: string,
  title: string,
  description: string,
  assigneeId: string,
  assigneeName: string,
): Promise<void> {
  const snap = await getDocs(
    query(
      collection(db, "projects", projectId, "tasks"),
      where("column", "==", "todo"),
    ),
  );

  await addDoc(collection(db, "projects", projectId, "tasks"), {
    projectId,
    title,
    description,
    column: "todo",
    assigneeId,
    assigneeName,
    order: snap.size,
    createdAt: serverTimestamp(),
  });
}

// Ambil semua tasks
export function subscribeToTasks(
  projectId: string,
  callback: (tasks: Task[]) => void,
): () => void {
  const q = query(
    collection(db, "projects", projectId, "tasks"),
    orderBy("order", "asc"),
  );

  return onSnapshot(q, (snap) => {
    const tasks = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: toDate(d.data().createdAt),
    })) as Task[];
    callback(tasks);
  });
}

// Edit task
export async function updateTask(
  projectId: string,
  taskId: string,
  title: string,
  description: string,
  assigneeId: string,
  assigneeName: string,
): Promise<void> {
  await updateDoc(doc(db, "projects", projectId, "tasks", taskId), {
    title,
    description,
    assigneeId,
    assigneeName,
  });
}

// Pindah kolom (drag & drop)
export async function moveTask(
  projectId: string,
  taskId: string,
  newColumn: TaskColumn,
  newOrder: number,
): Promise<void> {
  await updateDoc(doc(db, "projects", projectId, "tasks", taskId), {
    column: newColumn,
    order: newOrder,
  });
}

// Hapus task
export async function deleteTask(
  projectId: string,
  taskId: string,
): Promise<void> {
  await deleteDoc(doc(db, "projects", projectId, "tasks", taskId));
}

// Buat dokumen baru
export async function createDocument(
  projectId: string,
  title: string,
  createdBy: string,
  createdByName: string,
): Promise<string> {
  const ref = await addDoc(collection(db, "documents"), {
    projectId,
    title,
    content: "",
    createdBy,
    lastEditedBy: createdByName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// Ambil semua dokumen dalam proyek
export function subscribeToDocuments(
  projectId: string,
  callback: (documents: Document[]) => void,
): () => void {
  const q = query(
    collection(db, "documents"),
    where("projectId", "==", projectId),
    orderBy("updatedAt", "desc"),
  );

  return onSnapshot(q, (snap) => {
    const documents = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: toDate(d.data().createdAt),
      updatedAt: toDate(d.data().updatedAt),
    })) as Document[];
    callback(documents);
  });
}

// Ambil satu dokumen 
export function subscribeToDocument(
  documentId: string,
  callback: (document: Document | null) => void,
): () => void {
  return onSnapshot(doc(db, "documents", documentId), (snap) => {
    if (!snap.exists()) return callback(null);
    const data = snap.data();
    callback({
      id: snap.id,
      ...data,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    } as Document);
  });
}

// Update isi dokumen
export async function updateDocumentContent(
  documentId: string,
  content: string,
  editorName: string,
): Promise<void> {
  await updateDoc(doc(db, "documents", documentId), {
    content,
    lastEditedBy: editorName,
    updatedAt: serverTimestamp(),
  });
}

// Update judul dokumen
export async function updateDocumentTitle(
  documentId: string,
  title: string,
): Promise<void> {
  await updateDoc(doc(db, "documents", documentId), {
    title,
    updatedAt: serverTimestamp(),
  });
}

// Hapus dokumen beserta chat-nya
export async function deleteDocument(documentId: string): Promise<void> {
  const batch = writeBatch(db);

  // Hapus semua chat
  const chatSnap = await getDocs(
    collection(db, "documents", documentId, "chat"),
  );
  chatSnap.forEach((c) => batch.delete(c.ref));

  // Hapus dokumen
  batch.delete(doc(db, "documents", documentId));

  await batch.commit();
}

// CHAT
// Kirim pesan
export async function sendMessage(
  documentId: string,
  senderId: string,
  senderName: string,
  text: string,
): Promise<void> {
  await addDoc(collection(db, "documents", documentId, "chat"), {
    documentId,
    senderId,
    senderName,
    text,
    createdAt: serverTimestamp(),
  });
}

// Ambil pesan chat
export function subscribeToChat(
  documentId: string,
  callback: (messages: ChatMessage[]) => void,
): () => void {
  const q = query(
    collection(db, "documents", documentId, "chat"),
    orderBy("createdAt", "asc"),
  );

  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: toDate(d.data().createdAt),
    })) as ChatMessage[];
    callback(messages);
  });
}

// Hapus pesan
export async function deleteMessage(
  documentId: string,
  messageId: string,
): Promise<void> {
  await deleteDoc(doc(db, "documents", documentId, "chat", messageId));
}
