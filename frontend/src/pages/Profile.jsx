import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { User, Mail, Camera, BookOpen, Tag, Save, Loader2 } from "lucide-react";
import TagSelector from "../components/TagSelector";

const Profile = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImage, setSelectedImage] = useState(null);
  const [bio, setBio] = useState(authUser?.bio || "");
  const [tags, setTags] = useState(authUser?.tags || []);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (authUser) {
      setBio(authUser.bio || "");
      setTags(authUser.tags || []);
    }
  }, [authUser]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImage(base64Image);
      await updateProfile({ profilePic: base64Image, bio, tags });
    };
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ bio, tags });
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.05rem)] flex items-center justify-center p-4 bg-[#131413]">
      <div className="bg-[#1a1c1a] border border-[#262626] rounded-2xl shadow-xl max-w-4xl w-full my-6">
        <div className="block md:flex rounded-2xl overflow-hidden">
          {/* Avatar & Summary side */}
          <div className="w-full md:w-2/5 p-6 lg:p-8 relative flex flex-col items-center justify-start border-b md:border-b-0 md:border-r border-[#262626]">
            <div className="flex flex-col justify-center items-center mb-2 text-center">
              <span className="text-2xl font-bold text-[#FFFFFF]">Campus Profile</span>
              <span className="text-sm text-[#888888] mb-4">
                Your academic identity & skills
              </span>
            </div>

            {/* Image container */}
            <div className="p-4 mx-auto flex justify-center relative">
              <img
                id="showImage"
                className="size-32 object-cover rounded-full border-4 border-[#262626]"
                src={selectedImage || authUser?.profilePic || "/profile.jpg"}
                alt="Profile"
              />

              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-4 right-4 bg-[#026439] hover:bg-[#014d2b] hover:scale-105 p-2.5 rounded-full cursor-pointer transition-all duration-200 text-[#FFFFFF] shadow-md ${
                    isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                  }
                `}
                title="Change Photo"
              >
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>

            <p className="text-xs text-[#888888] flex items-center justify-center mt-1 text-center">
              {isUpdatingProfile
                ? "Uploading photo..."
                : "Click on camera icon to update photo"}
            </p>

            {/* Active Tags Overview */}
            {tags.length > 0 && (
              <div className="mt-6 w-full pt-4 border-t border-[#262626]">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#888888] mb-2 text-center">
                  Active Roles
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#026439]/20 text-[#026439] border border-[#026439]/40"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right section with user info, bio and tag selector */}
          <div className="w-full md:w-3/5 p-6 lg:p-8">
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-xs text-[#888888] block uppercase tracking-wider mb-1.5">
                    <User className="h-4 w-4 text-[#026439] inline mr-1" /> Full Name
                  </label>
                  <input
                    disabled
                    className="bg-[#131413] border border-[#262626] text-[#FFFFFF] rounded-xl px-4 py-2.5 w-full cursor-not-allowed text-sm"
                    type="text"
                    value={authUser?.name || ""}
                  />
                </div>

                <div>
                  <label className="font-medium text-xs text-[#888888] block uppercase tracking-wider mb-1.5">
                    <User className="h-4 w-4 text-[#026439] inline mr-1" /> Username
                  </label>
                  <input
                    disabled
                    className="bg-[#131413] border border-[#262626] text-[#FFFFFF] rounded-xl px-4 py-2.5 w-full cursor-not-allowed text-sm"
                    type="text"
                    value={authUser?.username || ""}
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-xs text-[#888888] block uppercase tracking-wider mb-1.5">
                  <Mail className="h-4 w-4 text-[#026439] inline mr-1" /> Email
                </label>
                <input
                  disabled
                  className="bg-[#131413] border border-[#262626] text-[#FFFFFF] rounded-xl px-4 py-2.5 w-full cursor-not-allowed text-sm"
                  type="email"
                  value={authUser?.email || ""}
                />
              </div>

              {/* Bio Field */}
              <div>
                <label className="font-medium text-xs text-[#888888] block uppercase tracking-wider mb-1.5">
                  <BookOpen className="h-4 w-4 text-[#026439] inline mr-1" /> Academic Bio & Interests
                </label>
                <textarea
                  rows={3}
                  placeholder="Share your major, current courses, tutoring strengths, or what you're looking for..."
                  className="bg-[#131413] border border-[#262626] text-[#FFFFFF] placeholder:text-[#555555] rounded-xl px-4 py-2.5 w-full text-sm focus:outline-none focus:border-[#026439] focus:ring-1 focus:ring-[#026439] transition-all resize-none"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              {/* Campus Roles & Skills Tag Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium text-xs text-[#888888] block uppercase tracking-wider">
                    <Tag className="h-4 w-4 text-[#026439] inline mr-1" /> Campus Roles & Skills
                  </label>
                  <span className="text-[11px] text-[#888888]">
                    {tags.length} selected
                  </span>
                </div>
                <TagSelector
                  selectedTags={tags}
                  onChange={setTags}
                  className="pt-1"
                />
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving || isUpdatingProfile}
                  className="w-full flex items-center justify-center gap-2 bg-[#026439] hover:bg-[#014d2b] disabled:bg-[#026439]/50 text-[#FFFFFF] font-medium py-2.5 px-4 rounded-xl transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#262626] text-xs text-[#888888]">
              <span>CampusConnect Member since</span>
              <span className="text-[#FFFFFF]">{authUser?.createdAt?.split("T")[0] || "2026"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
