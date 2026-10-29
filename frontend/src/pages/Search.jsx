import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFollowerStore } from "../store/useFollowerStore";
import { useChatStore } from "../store/useChatStore";
import {
    Search as SearchIcon,
    UserCheck,
    UserPlus,
    X,
    Users,
    MessageCircle,
    GraduationCap,
    SlidersHorizontal,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { DEFAULT_CAMPUS_TAGS } from "../components/TagSelector";
import UserProfileModal from "../components/UserProfileModal";

const TAG_FILTERS = ["All", ...DEFAULT_CAMPUS_TAGS];

const Search = () => {
    const { users, getUsers, isUsersLoading, toggleFollow } = useFollowerStore();
    const { setSelectedUser } = useChatStore();
    const [query, setQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState("All");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [viewingUser, setViewingUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const hasQuery = Boolean(query.trim());
        const hasTag = selectedTag !== "All";

        // If no query and no tag selected, clear users
        if (!hasQuery && !hasTag) {
            useFollowerStore.setState({ users: [] });
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            getUsers({
                query: query.trim(),
                tag: hasTag ? selectedTag : ""
            });
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query, selectedTag, getUsers]);

    const handleClear = () => {
        setQuery("");
        if (selectedTag === "All") {
            useFollowerStore.setState({ users: [] });
        }
    };

    const handleTagSelect = (tag) => {
        setSelectedTag(tag);
    };

    const handleStartChat = (user) => {
        setSelectedUser(user);
        navigate("/");
    };

    const hasActiveFilters = Boolean(query.trim()) || selectedTag !== "All";

    return (
        <div className="h-full w-full bg-[#131413] text-[#FFFFFF] overflow-y-auto flex flex-col items-center p-4 md:p-8 pb-24 md:pb-8">
            <div className="w-full max-w-2xl flex flex-col h-full">
                {/* Header Section */}
                <div className="mb-4 flex flex-col gap-1">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                            <GraduationCap className="size-6 stroke-[2.2]" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#FFFFFF]">
                            Campus Peer Directory
                        </h1>
                    </div>
                    <p className="text-xs text-[#888888] pl-1">
                        Discover and connect with peer tutors, study group leaders, and project partners. Click any profile to view full details.
                    </p>
                </div>

                {/* Search Bar with Filter Toggle Dropdown Button */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <SearchIcon className="size-5 text-[#888888]" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search peers by name, username, or academic bio..."
                            className="input w-full bg-[#1a1c1a] border-[#262626] text-[#FFFFFF] placeholder:text-[#888888] pl-11 pr-12 py-3.5 rounded-2xl text-sm focus:outline-none focus:border-[#026439] focus:ring-1 focus:ring-[#026439] transition-all"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {query && (
                            <button
                                onClick={handleClear}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#888888] hover:text-[#FFFFFF] transition-colors cursor-pointer"
                            >
                                <X className="size-5" />
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-1.5 px-3.5 py-3 rounded-2xl border text-xs font-medium transition-all cursor-pointer ${
                            selectedTag !== "All" || isFilterOpen
                                ? "bg-[#026439]/20 border-[#026439] text-white"
                                : "bg-[#1a1c1a] border-[#262626] text-[#888888] hover:text-[#FFFFFF]"
                        }`}
                        title="Toggle Role Filter"
                    >
                        <SlidersHorizontal className="size-4" />
                        <span className="hidden sm:inline">
                            {selectedTag !== "All" ? selectedTag : "Filters"}
                        </span>
                        {isFilterOpen ? (
                            <ChevronUp className="size-3.5 opacity-70" />
                        ) : (
                            <ChevronDown className="size-3.5 opacity-70" />
                        )}
                    </button>
                </div>

                {/* Collapsible Filter Dropdown Container */}
                {isFilterOpen && (
                    <div className="mb-4 p-3 bg-[#1a1c1a] border border-[#262626] rounded-2xl animate-fadeIn">
                        <div className="flex items-center justify-between mb-2 px-1">
                            <span className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider">
                                Filter by Campus Role
                            </span>
                            {selectedTag !== "All" && (
                                <button
                                    onClick={() => handleTagSelect("All")}
                                    className="text-[11px] text-[#026439] hover:underline cursor-pointer"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {TAG_FILTERS.map((tag) => {
                                const isSelected = selectedTag === tag;
                                return (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => handleTagSelect(tag)}
                                        className={`
                                            px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer select-none
                                            ${
                                                isSelected
                                                    ? "bg-[#026439] text-[#FFFFFF] border border-[#026439] shadow-sm shadow-[#026439]/30"
                                                    : "bg-[#131413] hover:bg-[#262626] text-[#888888] hover:text-[#FFFFFF] border border-[#262626]"
                                            }
                                        `}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Inline Loader Indicator */}
                    {isUsersLoading && users.length === 0 && (
                        <div className="flex flex-col gap-4 mt-2">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="flex items-center gap-4 p-4 bg-[#1a1c1a] border border-[#262626] rounded-2xl animate-pulse">
                                    <div className="size-12 rounded-full bg-[#262626]" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-[#262626] rounded w-1/3" />
                                        <div className="h-3 bg-[#262626] rounded w-1/4" />
                                    </div>
                                    <div className="h-9 bg-[#262626] rounded-xl w-20" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Search Results */}
                    {!isUsersLoading && hasActiveFilters && users.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-[#888888]">
                            <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3 text-emerald-500">
                                <Users className="size-8 opacity-70" />
                            </div>
                            <h3 className="text-lg font-medium text-[#FFFFFF] mb-1">No peers found</h3>
                            <p className="text-sm max-w-xs text-[#888888]">
                                {query.trim()
                                    ? `No match found for "${query}"${selectedTag !== "All" ? ` with role "${selectedTag}"` : ""}.`
                                    : `No peers registered under "${selectedTag}".`}
                            </p>
                        </div>
                    )}

                    {/* Empty State when no filters selected - Matching Header Badge */}
                    {!hasActiveFilters && (
                        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-[#888888]">
                            <div className="size-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-500">
                                <GraduationCap className="size-9 stroke-[2.2]" />
                            </div>
                            <h3 className="text-xl font-semibold text-[#FFFFFF] mb-2">Connect with Campus Peers</h3>
                            <p className="text-sm max-w-sm text-[#888888]">
                                Select a role pill above or search by subject, name, or course bio to find peer tutors and study partners.
                            </p>
                        </div>
                    )}

                    {/* Results list */}
                    {users.length > 0 && (
                        <div className="space-y-3 overflow-y-auto pr-1 pb-6">
                            {isUsersLoading && (
                                <div className="flex items-center justify-center py-2">
                                    <span className="loading loading-spinner loading-md text-[#026439]"></span>
                                    <span className="text-xs text-[#888888] ml-2">Filtering peers...</span>
                                </div>
                            )}
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={() => setViewingUser(user)}
                                    className="p-4 bg-[#1a1c1a] hover:bg-[#1f221f] border border-[#262626] hover:border-[#026439]/50 rounded-2xl flex flex-col gap-3 transition-all duration-200 cursor-pointer group shadow-sm"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        {/* User Details */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="relative shrink-0">
                                                <img
                                                    src={user.profilePic || "/profile.jpg"}
                                                    alt={user.name}
                                                    className="size-12 object-cover rounded-full border border-[#262626] group-hover:border-[#026439] transition-colors"
                                                />
                                            </div>
                                            <div className="min-w-0 text-left">
                                                <div className="font-semibold text-[#FFFFFF] group-hover:text-[#026439] transition-colors truncate">
                                                    {user.name}
                                                </div>
                                                <div className="text-xs text-[#888888] truncate">
                                                    @{user.username}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div
                                            className="flex items-center gap-2 shrink-0"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {/* Toggle Follow */}
                                            <button
                                                onClick={() => toggleFollow(user.id)}
                                                className={`btn btn-sm rounded-xl px-4 font-medium transition-all cursor-pointer ${
                                                    user.isFollowing
                                                        ? "bg-[#262626] border-[#262626] text-[#FFFFFF] hover:bg-[#333333]"
                                                        : "bg-[#026439] hover:bg-[#014d2b] border-[#026439] text-[#FFFFFF]"
                                                }`}
                                            >
                                                {user.isFollowing ? (
                                                    <>
                                                        <UserCheck className="size-4 mr-1" />
                                                        Connected
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus className="size-4 mr-1" />
                                                        Connect
                                                    </>
                                                )}
                                            </button>

                                            {/* Message Link */}
                                            <button
                                                onClick={() => handleStartChat(user)}
                                                className="btn btn-sm btn-ghost hover:bg-[#026439]/20 hover:text-[#026439] text-[#888888] rounded-xl p-2 transition-all cursor-pointer"
                                                title="Send Message"
                                            >
                                                <MessageCircle className="size-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* User Bio if present */}
                                    {user.bio && (
                                        <p className="text-xs text-[#AAAAAA] line-clamp-2 pl-1 bg-[#131413]/60 p-2 rounded-xl border border-[#262626]/50">
                                            {user.bio}
                                        </p>
                                    )}

                                    {/* User Tags if present */}
                                    {user.tags && user.tags.length > 0 && (
                                        <div
                                            className="flex flex-wrap gap-1.5 pl-1 pt-0.5"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {user.tags.map((t) => (
                                                <span
                                                    key={t}
                                                    onClick={() => handleTagSelect(t)}
                                                    className={`
                                                        px-2.5 py-0.5 rounded-full text-[11px] font-medium border cursor-pointer transition-colors
                                                        ${
                                                            selectedTag === t
                                                                ? "bg-[#026439] text-[#FFFFFF] border-[#026439]"
                                                                : "bg-[#026439]/10 text-[#026439] border-[#026439]/30 hover:bg-[#026439]/20"
                                                        }
                                                    `}
                                                >
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Clickable User Profile Modal */}
            <UserProfileModal
                user={viewingUser}
                isOpen={Boolean(viewingUser)}
                onClose={() => setViewingUser(null)}
                onStartChat={handleStartChat}
                onToggleFollow={toggleFollow}
            />
        </div>
    );
};

export default Search;
