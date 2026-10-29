import { ArrowRight } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-8 md:p-16 bg-[#131413]">
      <div className="max-w-md text-center flex flex-col items-center space-y-3">
        <div className="w-20 h-20 rounded-full border-2 border-[#026439] bg-[#026439]/10 flex items-center justify-center mb-2">
          <ArrowRight className="w-8 h-8 text-[#026439]" />
        </div>

        <h2 className="text-xl font-bold tracking-wide text-[#FFFFFF]">Your messages</h2>
        <p className="text-sm text-[#888888]">
          Send private messages to start conversations with friends.
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
