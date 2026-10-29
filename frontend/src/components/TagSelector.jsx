import React, { useState } from "react";
import { Check, Plus, X } from "lucide-react";

export const DEFAULT_CAMPUS_TAGS = [
  "Math Tutor",
  "CS Peer",
  "Physics Help",
  "Looking for Help",
  "Study Group Lead",
  "Notes Shared",
  "Project Partner",
];

const TagSelector = ({
  selectedTags = [],
  onChange,
  availableTags = DEFAULT_CAMPUS_TAGS,
  className = "",
  disabled = false,
  allowCustom = true,
}) => {
  const [customTagInput, setCustomTagInput] = useState("");
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  const handleToggle = (tag) => {
    if (disabled || !onChange) return;

    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e) => {
    e.preventDefault();
    const trimmed = customTagInput.trim();
    if (!trimmed) return;

    if (!selectedTags.includes(trimmed)) {
      onChange([...selectedTags, trimmed]);
    }
    setCustomTagInput("");
    setIsAddingCustom(false);
  };

  // Combine standard tags with any custom tags the user selected that aren't in preset
  const allDisplayTags = Array.from(new Set([...availableTags, ...selectedTags]));

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      <div className="flex flex-wrap gap-2 items-center">
        {allDisplayTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          const isCustom = !availableTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => handleToggle(tag)}
              disabled={disabled}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer select-none
                ${
                  isSelected
                    ? "bg-[#026439] text-[#FFFFFF] border border-[#026439] shadow-sm shadow-[#026439]/30"
                    : "bg-[#1a1c1a] hover:bg-[#262626] text-[#888888] hover:text-[#FFFFFF] border border-[#262626]"
                }
                ${disabled ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"}
              `}
            >
              {isSelected ? (
                <Check className="size-3.5 stroke-[2.5]" />
              ) : (
                <Plus className="size-3.5 stroke-[2] opacity-60" />
              )}
              <span>{tag}</span>
              {isCustom && isSelected && (
                <X
                  className="size-3 ml-0.5 opacity-70 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(selectedTags.filter((t) => t !== tag));
                  }}
                />
              )}
            </button>
          );
        })}

        {allowCustom && !disabled && (
          <>
            {!isAddingCustom ? (
              <button
                type="button"
                onClick={() => setIsAddingCustom(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-[#131413] hover:bg-[#1f221f] text-[#026439] hover:text-[#03854d] border border-dashed border-[#026439]/50 transition-all cursor-pointer"
              >
                <Plus className="size-3.5 stroke-[2]" />
                <span>Custom tag</span>
              </button>
            ) : (
              <form onSubmit={handleAddCustomTag} className="inline-flex items-center gap-1.5">
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Bio 101, React..."
                  className="bg-[#131413] border border-[#026439] text-[#FFFFFF] placeholder:text-[#666666] text-xs px-3 py-1 rounded-full focus:outline-none focus:ring-1 focus:ring-[#026439]"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsAddingCustom(false);
                      setCustomTagInput("");
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!customTagInput.trim()}
                  className="px-2.5 py-1 text-xs font-medium rounded-full bg-[#026439] text-white disabled:opacity-40 cursor-pointer"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCustom(false);
                    setCustomTagInput("");
                  }}
                  className="p-1 text-[#888888] hover:text-white rounded-full cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TagSelector;

