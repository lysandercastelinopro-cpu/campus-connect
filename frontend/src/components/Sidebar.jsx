import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();

  const { authUser, onlineUsers } = useAuthStore();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  if (isUsersLoading) {
    return (
      <div className="w-full lg:w-72 p-6 flex items-center justify-center text-[#888888] bg-[#131413]">
        <span className="loading loading-spinner text-[#026439]"></span>
      </div>
    );
  }

  return (
    <aside className="w-full h-full lg:w-72 border-r border-[#262626] bg-[#131413] flex flex-col transition-all duration-200 sm:w-auto">
      <div className="border-b border-[#262626] w-full p-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-[#FFFFFF] flex items-center gap-2">
            {authUser?.name}
          </span>
        </div>
      </div>

      <div className="overflow-y-auto w-full p-3 space-y-1 pb-20 md:pb-3">
        <div className="mb-3">
          <input
            type="text"
            placeholder="Search chats..."
            className="input w-full bg-[#1a1c1a] border-[#262626] text-[#FFFFFF] placeholder:text-[#888888] py-2 px-4 rounded-xl text-sm focus:outline-none focus:border-[#026439] focus:ring-1 focus:ring-[#026439] transition-all"
          />
        </div>

        {users.map((user) => {
          const isSelected = selectedUser?.id === user.id;
          return (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-3 flex items-center justify-start gap-3 rounded-xl transition-all ${
                isSelected
                  ? "bg-[#026439]/20 border border-[#026439] text-[#FFFFFF]"
                  : "hover:bg-[#1a1c1a] text-[#FFFFFF]"
              }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={user.profilePic || "/profile.jpg"}
                  alt={user.name}
                  className="size-11 object-cover rounded-full border border-[#262626]"
                />
                {onlineUsers.includes(user.id) && (
                  <span className="absolute bottom-0 right-0 size-3 bg-[#026439] rounded-full ring-2 ring-[#131413]" />
                )}
              </div>

              <div className="flex-1 text-left min-w-0">
                <div className="font-medium text-sm truncate text-[#FFFFFF]">{user.name}</div>
                <div className="text-xs text-[#888888]">
                  {onlineUsers.includes(user.id) ? (
                    <span className="text-[#026439]">Online</span>
                  ) : (
                    "Offline"
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
