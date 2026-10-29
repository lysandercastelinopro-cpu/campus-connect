import React from "react";
import { useChatStore } from "../store/useChatStore";

import ChatContainer from "../components/ChatContainer";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";

const Home = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#131413]">
      {/* Desktop layout */}
      <div className="hidden sm:flex w-full h-full overflow-hidden bg-[#131413]">
        <Sidebar />
        {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
      </div>

      {/* Mobile layout */}
      <div className="flex sm:hidden w-full h-full overflow-hidden bg-[#131413]">
        {!selectedUser ? (
          <Sidebar />
        ) : (
          <ChatContainer />
        )}
      </div>
    </div>
  );
};

export default Home;
