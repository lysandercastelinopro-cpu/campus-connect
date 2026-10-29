import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  UserPlus,
  MessageSquare,
  Clock,
  Trash2,
  GraduationCap
} from "lucide-react";
import { useNotificationStore } from "../store/useNotificationStore";
import { useChatStore } from "../store/useChatStore";
import { useFollowerStore } from "../store/useFollowerStore";
import UserProfileModal from "../components/UserProfileModal";

const NotificationPage = () => {
  const {
    notifications,
    unreadCount,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isLoading
  } = useNotificationStore();

  const { setSelectedUser } = useChatStore();
  const { toggleFollow } = useFollowerStore();
  const [filter, setFilter] = useState("ALL"); // ALL, MESSAGE
  const [viewingUser, setViewingUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "MESSAGE") return notif.type === "MESSAGE";
    return true;
  });

  const handleOpenChat = (sender) => {
    if (sender) {
      setSelectedUser(sender);
      navigate("/");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "MESSAGE":
        return <MessageSquare className="size-3 text-emerald-500" />;
      case "FOLLOW_REQUEST":
      case "FOLLOW_ACCEPT":
        return <GraduationCap className="size-3 text-emerald-500" />;
      default:
        return <Bell className="size-3 text-emerald-500" />;
    }
  };

  return (
    <div className="h-full w-full bg-[#131413] text-[#FFFFFF] overflow-y-auto flex flex-col items-center p-4 md:p-8 pb-24 md:pb-8">
      <div className="w-full max-w-2xl flex flex-col h-full">
        {/* Header Section */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#262626] pb-5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                  <Bell className="size-6 stroke-[2.2]" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#FFFFFF]">
                  Notification Center
                </h1>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#026439] text-[#FFFFFF]">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-xs text-[#888888] pl-1">
                Stay updated on campus peer connection alerts and course messages.
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1a1c1a] hover:bg-[#262626] border border-[#262626] text-xs font-medium text-[#CCCCCC] hover:text-[#FFFFFF] transition-colors cursor-pointer self-start sm:self-auto"
              >
                <CheckCheck className="size-4 text-emerald-500" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* Filter Pills - Streamlined */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer select-none ${filter === "ALL"
                  ? "bg-[#026439] text-[#FFFFFF] border border-[#026439] shadow-sm shadow-[#026439]/30"
                  : "bg-[#1a1c1a] hover:bg-[#262626] text-[#888888] hover:text-[#FFFFFF] border border-[#262626]"
                }`}
            >
              All Alerts ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("MESSAGE")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer select-none ${filter === "MESSAGE"
                  ? "bg-[#026439] text-[#FFFFFF] border border-[#026439] shadow-sm shadow-[#026439]/30"
                  : "bg-[#1a1c1a] hover:bg-[#262626] text-[#888888] hover:text-[#FFFFFF] border border-[#262626]"
                }`}
            >
              Messages ({notifications.filter((n) => n.type === "MESSAGE").length})
            </button>
          </div>

          {/* Notifications Content */}
          <div className="flex-1 min-h-0">
            {isLoading && notifications.length === 0 ? (
              <div className="flex flex-col gap-3 py-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="flex items-center gap-4 p-4 bg-[#1a1c1a] border border-[#262626] rounded-2xl animate-pulse"
                  >
                    <div className="size-12 rounded-full bg-[#262626]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-[#262626] rounded w-1/3" />
                      <div className="h-3 bg-[#262626] rounded w-1/2" />
                    </div>
                    <div className="h-9 bg-[#262626] rounded-xl w-24" />
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-[#888888]">
                {/* Center Empty State Icon matching Top Header Badge */}
                  <div className="size-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-500">
                    <Bell className="size-9 stroke-[2.2]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#FFFFFF] mb-1">
                    You're all caught up!
                  </h3>
                  <p className="text-xs text-[#888888] max-w-sm">
                    {filter === "ALL"
                      ? "No new notifications right now. When students connect with you or send messages, they will appear here in real time."
                  : "No message alerts found."}
                  </p>
                </div>
                ) : (
                <div className="space-y-3 pb-8">
                  {filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (!notif.read) markAsRead(notif.id);
                        if (notif.sender) setViewingUser(notif.sender);
                      }}
                      className={`p-4 bg-[#1a1c1a] hover:bg-[#1f221f] border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 relative group shadow-sm cursor-pointer ${
                        !notif.read
                          ? "border-emerald-500/40 bg-emerald-500/5 shadow-emerald-500/5"
                          : "border-[#262626]"
                      }`}
                    >
                  {/* Left indicator for unread */}
                  {!notif.read && (
                    <div
                      className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-500 rounded-r-full"
                      title="Unread"
                    />
                  )}

                  {/* Sender Details & Content */}
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                      {/* Avatar with Icon Badge */}
                      <div
                        className="relative shrink-0"
                        title="View peer profile"
                      >
                        <img
                          src={notif.sender?.profilePic || "/profile.jpg"}
                          alt={notif.sender?.name || "Peer"}
                          className="size-12 rounded-full object-cover border border-[#262626] group-hover:border-emerald-500/60 transition-colors"
                        />
                          <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-[#131413] flex items-center justify-center border border-emerald-500/30">
                            {getNotificationIcon(notif.type)}
                          </div>
                        </div>

                        {/* Notification Text */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm text-[#FFFFFF] group-hover:text-emerald-400 transition-colors">
                                  {notif.sender?.name || "Campus Peer"}
                                </span>
                                {notif.sender?.username && (
                                  <span className="text-xs text-[#888888]">
                                    @{notif.sender.username}
                                  </span>
                                )}
                            </div>

                            <p className="text-xs text-[#CCCCCC] mt-0.5 leading-snug">
                              {notif.content}
                            </p>

                            <div className="flex items-center gap-2 mt-1 text-[11px] text-[#777777]">
                              <Clock className="size-3" />
                              <span>
                                {new Date(notif.createdAt).toLocaleDateString([], {
                                  month: "short",
                                  day: "numeric"
                                })}{" "}
                                at{" "}
                                {new Date(notif.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right side controls: Dismiss icon */}
                        <div
                          className="flex items-center gap-2 shrink-0 self-end sm:self-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => deleteNotification(notif.id)}
                            className="btn btn-sm btn-ghost hover:bg-[#262626] text-[#888888] hover:text-[#FFFFFF] rounded-xl p-2 cursor-pointer transition-colors"
                            title="Dismiss notification"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
              ))}
                    </div>
          )}
                  </div>
                </div>

                {/* User Profile Modal when clicking peer in alerts */}
                <UserProfileModal
                  user={viewingUser}
                  isOpen={Boolean(viewingUser)}
                  onClose={() => setViewingUser(null)}
                  onStartChat={handleOpenChat}
                  onToggleFollow={toggleFollow}
                />
              </div>
            );
};

            export default NotificationPage;
