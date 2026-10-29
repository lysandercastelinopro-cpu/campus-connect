import React, { useState } from "react";
import { X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useFollowerStore } from "../store/useFollowerStore";
import UserProfileModal from "./UserProfileModal";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { toggleFollow } = useFollowerStore();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  if (!selectedUser) return null;

  return (
    <div className="p-3.5 border-b border-[#262626] bg-[#131413]">
      <div className="flex items-center justify-between">
        {/* Clickable Profile trigger */}
        <div
          onClick={() => setIsProfileModalOpen(true)}
          className="flex items-center gap-3 cursor-pointer group hover:opacity-95 transition-all select-none"
          title="Click to view campus profile"
        >
          <div className="avatar">
            <div className="rounded-full size-10 relative border border-[#262626] group-hover:border-[#026439] transition-colors">
              <img
                src={selectedUser.profilePic || "/profile.jpg"}
                alt={selectedUser.name}
              />
            </div>
          </div>
          <div>
            <h3 className="font-medium text-[#FFFFFF] group-hover:text-[#026439] transition-colors">
              {selectedUser.name}
            </h3>
            <p className="text-xs text-[#888888]">
              {onlineUsers?.includes(selectedUser.id) ? (
                <span className="text-[#026439] font-medium">Online</span>
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => setSelectedUser(null)}
          className="btn btn-square btn-ghost btn-sm text-[#888888] hover:text-[#FFFFFF] hover:bg-[#262626] rounded-xl cursor-pointer"
          aria-label="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        user={selectedUser}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onStartChat={() => setIsProfileModalOpen(false)}
        onToggleFollow={toggleFollow}
      />
    </div>
  );
};

export default ChatHeader;
