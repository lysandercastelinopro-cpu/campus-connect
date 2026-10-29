import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
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
    <div className="min-h-[calc(100vh-4.05rem)] flex items-center justify-center p-4 bg-[#131413]">
      <div className="max-w-md w-full bg-[#1a1c1a] border border-[#262626] rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center justify-center mb-6 gap-1 w-full">
          <h2 className="text-2xl font-bold text-[#FFFFFF]">Welcome Back</h2>
          <p className="text-sm text-[#888888]">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-[#FFFFFF]">
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
            disabled={isLoggingIn}
            className="w-full bg-[#026439] hover:bg-[#014d2b] disabled:bg-[#026439]/50 text-[#FFFFFF] font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center"
          >
            {isLoggingIn ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              "Log in"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#888888]">
          Don't have an account?{" "}
          <Link
            to="/auth/signup"
            className="text-[#026439] hover:underline font-medium"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
