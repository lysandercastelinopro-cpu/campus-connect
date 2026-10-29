import React, { useEffect, useState } from "react";
import {
  X,
  MessageCircle,
  UserPlus,
  UserCheck,
  Calendar,
  BookOpen,
  GraduationCap,
  Users,
  Loader2
} from "lucide-react";
import { axiosInstance } from "../lib/axios";

const UserProfileModal = ({
  user: initialUser,
  isOpen,
  onClose,
  onStartChat,
  onToggleFollow
}) => {
  const [userDetails, setUserDetails] = useState(initialUser || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !initialUser?.id) return;

    setUserDetails(initialUser);

    // Fetch full public profile details from GET /api/users/:id
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/users/${initialUser.id}`);
        setUserDetails((prev) => ({ ...prev, ...res.data }));
      } catch (error) {
        console.log("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isOpen, initialUser]);

  if (!isOpen || !userDetails) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-[#1a1c1a] border border-[#262626] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner with header accents */}
        <div className="h-24 bg-gradient-to-r from-[#026439]/30 via-[#131413] to-[#026439]/10 relative border-b border-[#262626]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#131413]/80 hover:bg-[#262626] text-[#888888] hover:text-[#FFFFFF] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6 pt-0 flex flex-col -mt-12">
          {/* Avatar & Main Info Row */}
          <div className="flex items-end justify-between gap-4 mb-4">
            <div className="relative">
              <img
                src={userDetails.profilePic || "/profile.jpg"}
                alt={userDetails.name}
                className="size-24 rounded-full object-cover border-4 border-[#1a1c1a] shadow-lg bg-[#131413]"
              />
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => {
                  onToggleFollow(userDetails.id);
                  setUserDetails((prev) => ({
                    ...prev,
                    isFollowing: !prev.isFollowing
                  }));
                }}
                className={`btn btn-sm rounded-xl px-4 font-medium transition-all cursor-pointer ${
                  userDetails.isFollowing
                    ? "bg-[#262626] border-[#262626] text-[#FFFFFF] hover:bg-[#333333]"
                    : "bg-[#026439] hover:bg-[#014d2b] border-[#026439] text-[#FFFFFF]"
                }`}
              >
                {userDetails.isFollowing ? (
                  <>
                    <UserCheck className="size-4 mr-1.5" />
                    Connected
                  </>
                ) : (
                  <>
                    <UserPlus className="size-4 mr-1.5" />
                    Connect
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  onStartChat(userDetails);
                  onClose();
                }}
                className="btn btn-sm bg-[#026439] hover:bg-[#014d2b] border-[#026439] text-[#FFFFFF] rounded-xl px-3.5 cursor-pointer shadow-sm"
                title="Send Message"
              >
                <MessageCircle className="size-4 mr-1.5" />
                Message
              </button>
            </div>
          </div>

          {/* Names */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#FFFFFF]">{userDetails.name}</h2>
              <GraduationCap className="size-4 text-[#026439]" />
            </div>
            <p className="text-xs text-[#888888]">@{userDetails.username}</p>
          </div>

          {/* Stats Bar if available */}
          <div className="flex items-center gap-6 py-2.5 px-4 mb-4 bg-[#131413] border border-[#262626] rounded-xl text-xs text-[#888888]">
            <div className="flex items-center gap-1.5">
              <Users className="size-4 text-[#026439]" />
              <span className="font-semibold text-[#FFFFFF]">
                {userDetails._count?.receivedFollowers ?? 0}
              </span>
              <span>Connections</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-[#888888]" />
              <span>Joined {userDetails.createdAt?.split("T")[0] || "2026"}</span>
            </div>
          </div>

          {/* Academic Bio */}
          <div className="mb-4">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#888888] mb-1.5 flex items-center gap-1.5">
              <BookOpen className="size-3.5 text-[#026439]" />
              Academic Bio & Study Interests
            </h4>
            <div className="p-3 bg-[#131413] border border-[#262626] rounded-xl text-xs text-[#CCCCCC] leading-relaxed">
              {userDetails.bio?.trim() ? (
                userDetails.bio
              ) : (
                <span className="text-[#666666] italic">
                  No academic bio provided yet.
                </span>
              )}
            </div>
          </div>

          {/* Campus Skills & Role Tags */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#888888] mb-2">
              Campus Peer Roles & Skills
            </h4>
            {userDetails.tags && userDetails.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {userDetails.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-[#026439]/20 text-[#026439] border border-[#026439]/40"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#666666] italic">
                No peer roles selected.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;

