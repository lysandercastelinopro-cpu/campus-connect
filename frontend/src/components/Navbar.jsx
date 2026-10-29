import { Link, useLocation } from "react-router-dom";
import {
  MessageCircle,
  House,
  Search,
  LogIn,
  Bell
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useNotificationStore } from "../store/useNotificationStore";

const Navbar = () => {
  const { authUser } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const pathName = useLocation().pathname;

  return (
    <>
      {/* Mobile dock */}
      <div className="dock bg-[#131413] border-t border-[#262626] text-[#888888] md:hidden z-40">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-2 transition-colors ${pathName === "/" ? "text-[#026439]" : "text-[#888888] hover:text-[#FFFFFF]"
            }`}
        >
          <House className="size-5 stroke-[2] stroke-linecap-round stroke-linejoin-round" />
          <span className="dock-label text-xs mt-1 font-medium">Home</span>
        </Link>

        <Link
          to="/search"
          className={`flex flex-col items-center justify-center py-2 transition-colors ${pathName === "/search" ? "text-[#026439]" : "text-[#888888] hover:text-[#FFFFFF]"
            }`}
        >
          <Search className="size-5 stroke-[2] stroke-linecap-round stroke-linejoin-round" />
          <span className="dock-label text-xs mt-1 font-medium">Search</span>
        </Link>

        {/* Mobile Notification Page Link with Badge */}
        {authUser && (
          <Link
            to="/notifications"
            className={`relative flex flex-col items-center justify-center py-2 transition-colors cursor-pointer ${pathName === "/notifications" ? "text-[#026439]" : "text-[#888888] hover:text-[#FFFFFF]"
              }`}
          >
            <div className="relative">
              <Bell className="size-5 stroke-[2]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-2 size-4 rounded-full bg-[#026439] text-[#FFFFFF] text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span className="dock-label text-xs mt-1 font-medium">Alerts</span>
          </Link>
        )}

        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center py-2 transition-colors ${pathName === "/profile" ? "text-[#026439]" : "text-[#888888] hover:text-[#FFFFFF]"
            }`}
        >
          <div className="w-8 h-8 rounded-full border border-[#262626] bg-[#1a1c1a] text-[#FFFFFF] flex items-center justify-center font-semibold text-xs overflow-hidden">
            {authUser?.profilePic ? (
              <img
                id="showImage"
                className="size-8 object-cover rounded-full"
                src={authUser?.profilePic}
                alt="Profile"
              />
            ) : (
              authUser?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <span className="dock-label text-xs mt-1 text-[#888888] font-medium">Profile</span>
        </Link>
      </div>

      {/* Desktop navigation */}
      {!authUser ? (
        <div className="p-4">
          <Link
            to="/login"
            className="flex items-center gap-2 text-[#888888] hover:text-white"
          >
            <LogIn className="w-5 h-5 stroke-[2]" />
            <span className="hidden xl:inline font-semibold">Login</span>
          </Link>
        </div>
      ) : (
        <div className="fixed left-0 top-0 h-screen w-20 bg-[#131413] border-r border-[#262626] hidden md:flex flex-col items-center justify-between py-8 px-2 z-40">
          <div className="flex flex-col gap-4 w-full items-center">
            <Link
              to="/"
              className={`p-3 rounded-xl transition-all group ${pathName === "/"
                ? "bg-[#026439] text-[#FFFFFF]"
                : "text-[#888888] hover:bg-[#1a1c1a] hover:text-[#FFFFFF]"
                }`}
              title="Home"
            >
              <House className="size-5 stroke-[2] stroke-linecap-round stroke-linejoin-round" />
            </Link>

            <Link
              to="/search"
              className={`p-3 rounded-xl transition-all group ${pathName === "/search"
                ? "bg-[#026439] text-[#FFFFFF]"
                : "text-[#888888] hover:bg-[#1a1c1a] hover:text-[#FFFFFF]"
                }`}
              title="Search"
            >
              <Search className="size-5 stroke-[2] stroke-linecap-round stroke-linejoin-round" />
            </Link>

            {/* Notification Center Link with Real-time Unread Badge */}
            <div className="relative">
              <Link
                to="/notifications"
                className={`relative p-3 rounded-xl transition-all flex items-center justify-center group ${pathName === "/notifications"
                  ? "bg-[#026439] text-[#FFFFFF]"
                  : "text-[#888888] hover:bg-[#1a1c1a] hover:text-[#FFFFFF]"
                  }`}
                title="Notifications"
              >
                <Bell className="size-5 stroke-[2]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 size-5 rounded-full bg-[#026439] text-[#FFFFFF] border-2 border-[#131413] text-[10px] font-bold flex items-center justify-center shadow-md animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          <Link
            to="/profile"
            className="avatar placeholder hover:scale-105 transition-transform group"
            title="Profile"
          >
            <div className={`w-10 h-10 rounded-full border bg-[#1a1c1a] text-[#FFFFFF] flex items-center justify-center font-semibold text-sm overflow-hidden transition-colors ${pathName === "/profile" ? "border-[#026439]" : "border-[#262626]"
              }`}>
              {authUser?.profilePic ? (
                <img
                  id="showImage"
                  className="size-10 object-cover rounded-full"
                  src={authUser?.profilePic}
                  alt="Profile"
                />
              ) : (
                authUser?.name?.charAt(0).toUpperCase()
              )}
            </div>
          </Link>
        </div>
      )}
    </>
  );
};

export default Navbar;
