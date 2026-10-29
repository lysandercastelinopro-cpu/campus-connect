import React, { useEffect, useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { formatMessageDateTime } from "../lib/utils";
import { X, ZoomIn } from "lucide-react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { useAuthStore } from "../store/useAuthStore";

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser, subscribeToMessages, unsubscribeFromMessages } =
    useChatStore();

  const { authUser } = useAuthStore();
  const messageEnd = useRef(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (selectedUser?.id) getMessages(selectedUser.id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser?.id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEnd.current && messages)
      messageEnd.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle ESC key press to close lightbox and reset zoom
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setLightboxImage(null);
        setIsZoomed(false);
      }
    };
    if (lightboxImage) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage]);

  // Default opening state: always normal fitted view (zoom ONLY on explicit click)
  const handleOpenLightbox = (image) => {
    setLightboxImage(image);
    setIsZoomed(false);
  };

  const handleCloseLightbox = () => {
    setLightboxImage(null);
    setIsZoomed(false);
  };

  if (isMessagesLoading) {
    return (
      <div className="flex flex-1 items-center justify-center h-full bg-[#131413] text-[#888888]">
        <span className="loading loading-spinner text-[#026439]"></span>
        <span className="ml-2 text-sm font-medium">Loading messages...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col h-full bg-[#131413] border-b border-[#262626] relative">
      <ChatHeader />

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message) => {
          const isSender = message.userId === authUser.id;
          const hasImageOnly = Boolean(message.image && !message.text);
          const hasBoth = Boolean(message.image && message.text);

          return (
            <div
              key={message.id}
              className={`chat ${isSender ? "chat-end" : "chat-start"}`}
              ref={messageEnd}
            >
              <div className="chat-image avatar">
                <div className="size-9 rounded-full border border-[#262626]">
                  <img
                    src={
                      isSender
                        ? authUser.profilePic || "/profile.jpg"
                        : selectedUser.profilePic || "/profile.jpg"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>

              {/* Timestamp Header above bubble displaying Date & Time */}
              <div className="chat-header mb-1 flex items-center gap-1.5">
                <time className="text-[11px] font-medium text-[#888888]">
                  {formatMessageDateTime(message.createdAt)}
                </time>
              </div>

              {/* Chat Bubble: iOS Instagram DM style (18px radius, no tail, flush images) */}
              {hasImageOnly ? (
                /* Flush Image Bubble: clickable to open fitted preview */
                <button
                  type="button"
                  onClick={() => handleOpenLightbox(message.image)}
                  className="group relative block overflow-hidden rounded-[18px] max-w-[260px] sm:max-w-[320px] shadow-sm border border-[#262626] cursor-pointer focus:outline-none transition-transform hover:scale-[1.01]"
                  title="Click to view image"
                >
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="w-full h-auto block object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-[#131413]/80 text-white rounded-full p-2 backdrop-blur-sm">
                      <ZoomIn className="size-4 stroke-[2]" />
                    </span>
                  </div>
                </button>
              ) : hasBoth ? (
                /* Mixed Image + Text: Image fits flush to top, text has balanced padding below */
                <div
                  className={`chat-bubble !p-0 overflow-hidden flex flex-col shadow-sm max-w-[280px] sm:max-w-[340px] rounded-[18px] ${
                    isSender
                      ? "bg-[#026439] text-[#FFFFFF]"
                      : "bg-[#1f221f] text-[#FFFFFF] border border-[#262626]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleOpenLightbox(message.image)}
                    className="group relative block cursor-pointer w-full focus:outline-none"
                    title="Click to view image"
                  >
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="w-full h-auto block object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-[#131413]/80 text-white rounded-full p-2 backdrop-blur-sm">
                        <ZoomIn className="size-4 stroke-[2]" />
                      </span>
                    </div>
                  </button>
                  <div className="px-4 py-2.5 font-normal text-sm leading-relaxed">
                    {message.text}
                  </div>
                </div>
              ) : (
                /* Text Only Bubble: balanced 10px 16px (px-4 py-2.5), 18px rounded */
                <div
                  className={`chat-bubble !px-4 !py-2.5 rounded-[18px] flex flex-col font-normal text-sm leading-relaxed shadow-sm ${
                    isSender
                      ? "bg-[#026439] text-[#FFFFFF]"
                      : "bg-[#1f221f] text-[#FFFFFF] border border-[#262626]"
                  }`}
                >
                  <span>{message.text}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <MessageInput />

      {/* Image Lightbox Modal: Opens cleanly fitted; Zoom toggles ONLY on clicking the image */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 select-none"
          onClick={handleCloseLightbox}
          role="dialog"
          aria-modal="true"
        >
          {/* Prominent Close button with "X" icon */}
          <button
            onClick={handleCloseLightbox}
            className="absolute top-5 right-5 sm:top-7 sm:right-7 p-2.5 rounded-full bg-[#1a1c1a]/90 hover:bg-[#262626] text-[#FFFFFF] border border-[#262626] transition-all hover:scale-110 active:scale-95 shadow-xl cursor-pointer z-50"
            aria-label="Close image preview"
            title="Close (Esc)"
          >
            <X className="w-6 h-6 stroke-[2] stroke-linecap-round stroke-linejoin-round" />
          </button>

          {/* Expanded Image Container: Default is fit cleanly; Click toggles zoom */}
          <div
            className={`transition-transform duration-200 ease-out flex items-center justify-center max-w-full max-h-full ${
              isZoomed ? "cursor-zoom-out scale-[1.75] sm:scale-[2]" : "cursor-zoom-in scale-100"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed((prev) => !prev);
            }}
            title={isZoomed ? "Click to reset" : "Click to zoom"}
          >
            <img
              src={lightboxImage}
              alt="Expanded preview"
              className="max-h-[82vh] max-w-[90vw] sm:max-w-4xl rounded-2xl object-contain shadow-2xl border border-[#262626] pointer-events-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
