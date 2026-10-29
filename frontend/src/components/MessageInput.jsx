import React, { useRef, useState } from "react";
import { Image, ArrowRight, X } from "lucide-react";
import toast from "react-hot-toast";

import { useChatStore } from "../store/useChatStore";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef();
  const { sendMessages } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessages({
        text: text.trim(),
        image: imagePreview,
      });

      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  return (
    <div className="p-4 w-full border-t border-[#262626] bg-[#131413]">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="preview"
              className="w-20 h-20 object-cover rounded-xl border border-[#262626]"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#262626] text-white flex items-center justify-center hover:bg-neutral transition-colors"
              type="button"
            >
              <X className="w-3 h-3 stroke-[2] stroke-linecap-round stroke-linejoin-round" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2 w-full">
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <input
            type="text"
            className="flex-1 min-w-0 input bg-[#1a1c1a] border-[#262626] text-[#FFFFFF] placeholder:text-[#888888] rounded-2xl py-3 px-4 focus:outline-none focus:border-[#026439] focus:ring-1 focus:ring-[#026439] transition-all font-normal text-[16px] sm:text-sm"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <button
            type="button"
            className={`btn btn-circle btn-sm sm:btn-md shrink-0 border-[#262626] bg-[#1a1c1a] hover:bg-[#262626] transition-colors ${imagePreview ? "text-[#026439]" : "text-[#888888] hover:text-[#FFFFFF]"
              }`}
            onClick={() => fileInputRef.current?.click()}
            title="Attach image"
          >
            <Image className="size-5 stroke-[2] stroke-linecap-round stroke-linejoin-round" />
          </button>
          {/* Send icon button in #026439 green accent */}
          <button
            type="submit"
            className="btn btn-circle btn-sm sm:btn-md shrink-0 bg-[#026439] hover:bg-[#014d2b] border-[#026439] text-[#FFFFFF] disabled:bg-[#1a1c1a] disabled:text-[#555555] disabled:border-[#262626] transition-all shadow-sm"
            disabled={!text.trim() && !imagePreview}
            title="Send message"
          >
            <ArrowRight className="size-5 stroke-[2] stroke-linecap-round stroke-linejoin-round" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
