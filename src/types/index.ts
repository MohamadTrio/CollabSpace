// src/types/index.ts

// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  uid: string;
  name: string;
  email: string;
  createdAt: Date;
}

// ─── Member & Role ───────────────────────────────────────────────────────────
export type Role = "owner" | "editor" | "viewer";

export interface Member {
  uid: string;
  name: string;
  email: string;
  role: Role;
}

// ─── Project ─────────────────────────────────────────────────────────────────
export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  memberUids: string[];
  members: Record<string, Member>; // { uid: Member }
  createdAt: Date;
}

// ─── Task ────────────────────────────────────────────────────────────────────
export type TaskColumn = "todo" | "doing" | "done";

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  column: TaskColumn;
  assigneeId: string;
  assigneeName: string;
  order: number;
  createdAt: Date;
}

// ─── Document ────────────────────────────────────────────────────────────────
export interface Document {
  id: string;
  projectId: string;
  title: string;
  content: string;
  createdBy: string;
  lastEditedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Chat ────────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  documentId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: Date;
}

// ─── Presence (Realtime DB) ──────────────────────────────────────────────────
export interface OnlineUser {
  uid: string;
  name: string;
  documentId: string;
  isTyping: boolean;
  typingTimestamp?: number;
  lastSeen: number;
}
