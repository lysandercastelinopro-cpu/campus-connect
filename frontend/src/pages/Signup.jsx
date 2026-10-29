import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Mail, User, Lock, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.name.trim()) return toast.error("Full name is required");

    if (!formData.email.trim()) {
      return toast.error("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return toast.error("Invalid email format");
    }

    if (!formData.password) {
      return toast.error("Password is required");
    } else if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) signup(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen w-full overflow-y-auto flex items-center justify-center p-4 py-8 bg-[#131413]">
      <div className="max-w-md w-full bg-[#1a1c1a] border border-[#262626] rounded-2xl shadow-xl p-6 sm:p-8 my-auto">
        <div className="flex flex-col items-center justify-center mb-6 gap-1 w-full">
          <h2 className="text-2xl font-bold text-[#FFFFFF]">Create Account</h2>
          <p className="text-sm text-[#888888]">
            Get started with your free account!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-[#FFFFFF]">
          {/* Full Name Field */}
          <div>
            <label className="block text-sm font-medium text-[#888888] mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-[#888888]" />
              </div>
              <input
                type="text"
                name="name"
                className="w-full pl-10 pr-4 py-2.5 bg-[#131413] border border-[#262626] rounded-xl text-[#FFFFFF] placeholder:text-[#888888] focus:ring-1 focus:ring-[#026439] focus:border-[#026439] outline-none transition-all"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Username Field */}
          <div>
            <label className="block text-sm font-medium text-[#888888] mb-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-[#888888]" />
              </div>
              <input
                type="text"
                name="username"
                className="w-full pl-10 pr-4 py-2.5 bg-[#131413] border border-[#262626] rounded-xl text-[#FFFFFF] placeholder:text-[#888888] focus:ring-1 focus:ring-[#026439] focus:border-[#026439] outline-none transition-all"
                placeholder="Enter a username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-[#888888] mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-[#888888]" />
              </div>
              <input
                type="email"
                name="email"
                className="w-full pl-10 pr-4 py-2.5 bg-[#131413] border border-[#262626] rounded-xl text-[#FFFFFF] placeholder:text-[#888888] focus:ring-1 focus:ring-[#026439] focus:border-[#026439] outline-none transition-all"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-[#888888] mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-[#888888]" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="w-full pl-10 pr-12 py-2.5 bg-[#131413] border border-[#262626] rounded-xl text-[#FFFFFF] placeholder:text-[#888888] focus:ring-1 focus:ring-[#026439] focus:border-[#026439] outline-none transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#888888] hover:text-[#FFFFFF]"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSigningUp}
            className="w-full bg-[#026439] hover:bg-[#014d2b] disabled:bg-[#026439]/50 text-[#FFFFFF] font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center"
          >
            {isSigningUp ? (
              <>
                <Loader2 className="size-5 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#888888]">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="text-[#026439] hover:underline font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
