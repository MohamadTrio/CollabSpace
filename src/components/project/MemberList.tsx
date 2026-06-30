// src/components/project/MemberList.tsx
import { useState } from "react";
import type { Member } from "../../types";
import ConfirmDialog from "../shared/ConfirmDialog";
import { getAvatarColor, getInitials } from "../../lib/avatar";

interface Props {
  members: Record<string, Member>;
  currentUid: string;
  isOwner: boolean;
  onUpdateRole: (uid: string, role: "editor" | "viewer") => Promise<void>;
  onRemoveMember: (uid: string) => Promise<void>;
}

export default function MemberList({
  members,
  currentUid,
  isOwner,
  onUpdateRole,
  onRemoveMember,
}: Props) {
  const [removingUid, setRemovingUid] = useState<string | null>(null);
  const [confirmUid, setConfirmUid] = useState<string | null>(null);
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

  // 👇 INI BAGIAN YANG KITA UBAH (Logika Sorting) 👇
  const memberList = Object.values(members).sort((a, b) => {
    // 1. Prioritas 1: User yang sedang login (Kamu) selalu paling atas
    if (a.uid === currentUid) return -1;
    if (b.uid === currentUid) return 1;

    // 2. Prioritas 2: Owner ditaruh setelah "Kamu"
    if (a.role === "owner" && b.role !== "owner") return -1;
    if (b.role === "owner" && a.role !== "owner") return 1;

    // 3. Prioritas 3: Sisanya diurutkan berdasarkan abjad A-Z
    return a.name.localeCompare(b.name);
  });
  // 👆 ------------------------------------------ 👆

  const roleColor: Record<string, string> = {
    owner: "bg-blue-100 text-blue-700",
    editor: "bg-green-100 text-green-700",
    viewer: "bg-gray-100 text-gray-600",
  };

  async function handleRemove(uid: string) {
    setRemovingUid(uid);
    await onRemoveMember(uid);
    setRemovingUid(null);
    setConfirmUid(null);
  }

  async function handleRoleChange(uid: string, role: "editor" | "viewer") {
    setUpdatingUid(uid);
    await onUpdateRole(uid, role);
    setUpdatingUid(null);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">
          Anggota ({memberList.length})
        </h3>
      </div>

      <div className="divide-y divide-gray-100">
        {memberList.map((member) => {
          const isMe = member.uid === currentUid;
          const isOwnerMember = member.role === "owner";
          const { bg, text } = getAvatarColor(member.name); // ← di sini
          const initials = getInitials(member.name);

          return (
            <div key={member.uid} className="px-5 py-4 flex items-center gap-3">
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-full text-sm font-bold flex items-center justify-center shrink-0 ${bg} ${text}`}
              >
                {initials}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {member.name}
                  </span>
                  {isMe && (
                    <span className="text-xs text-gray-400">(kamu)</span>
                  )}
                </div>
                <span className="text-xs text-gray-400 truncate">
                  {member.email}
                </span>
              </div>

              {/* Role selector — owner bisa ubah role non-owner */}
              {isOwner && !isOwnerMember ? (
                <select
                  value={member.role}
                  onChange={(e) =>
                    handleRoleChange(
                      member.uid,
                      e.target.value as "editor" | "viewer",
                    )
                  }
                  disabled={updatingUid === member.uid}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              ) : (
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${roleColor[member.role]}`}
                >
                  {member.role}
                </span>
              )}

              {/* Tombol keluarkan / keluar */}
              {!isOwnerMember && (isOwner || isMe) && (
                <button
                  onClick={() => setConfirmUid(member.uid)}
                  disabled={removingUid === member.uid}
                  className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1.5 rounded-lg transition disabled:opacity-50"
                >
                  {isMe ? "Keluar" : "Keluarkan"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirm dialog keluarkan anggota */}
      {confirmUid && (
        <ConfirmDialog
          title={
            confirmUid === currentUid
              ? "Keluar dari Proyek?"
              : "Keluarkan Anggota?"
          }
          message={
            confirmUid === currentUid
              ? "Kamu akan keluar dari proyek ini dan tidak bisa mengaksesnya lagi."
              : `${members[confirmUid]?.name} akan dikeluarkan dari proyek ini.`
          }
          confirmLabel={
            confirmUid === currentUid ? "Ya, Keluar" : "Ya, Keluarkan"
          }
          onConfirm={() => handleRemove(confirmUid)}
          onCancel={() => setConfirmUid(null)}
          isLoading={removingUid === confirmUid}
          isDanger
        />
      )}
    </div>
  );
}
