import { MessageCircle } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-8 md:p-16 bg-[#131413]">
      <div className="max-w-md text-center flex flex-col items-center">
        {/* Center icon badge matching Search page design */}
        <div className="size-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-500">
          <MessageCircle className="size-9 stroke-[2.2]" />
        </div>

        <h2 className="text-xl font-bold tracking-wide text-[#FFFFFF] mb-2">Your messages</h2>
        <p className="text-sm max-w-sm text-[#888888]">
          Send private messages to start conversations with friends.
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
