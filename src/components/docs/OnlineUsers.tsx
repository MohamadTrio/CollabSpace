import type { OnlineUser } from "../../types";
import { getAvatarColor, getInitials } from "../../lib/avatar";

interface Props {
  users: OnlineUser[];
}

export default function OnlineUsers({ users }: Props) {
  if (users.length === 0) return null;

  const visible = users.slice(0, 4);
  const extra   = users.length - visible.length;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visible.map((u) => {
          const { bg, text } = getAvatarColor(u.name); 
          const initials = getInitials(u.name);        
          return (
            <div
              key={u.uid}
              title={`${u.name} sedang online`}
              className={`w-7 h-7 rounded-full border-2 border-white text-xs font-bold flex items-center justify-center shrink-0 ${bg} ${text}`}
            >
              {initials}
            </div>
          );
        })}
        {extra > 0 && (
          <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center">
            +{extra}
          </div>
        )}
      </div>
    </div>
  );
}