import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useNotificationStore } from "./useNotificationStore";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api/"
    : "/";

const SOCKET_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningIn: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
      useNotificationStore.getState().getNotifications();
    } catch (error) {
      console.log("Error checking auth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningIn: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully!");
      get().connectSocket();
      useNotificationStore.getState().getNotifications();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error signing up");
      console.log("Error during signup:", error);
    } finally {
      set({ isSigningIn: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Welcome back to CampusConnect!");

      get().connectSocket();
      useNotificationStore.getState().getNotifications();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error logging in");
      console.log("Error during login:", error);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");

      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error logging out");
      console.log("Error during logout:", error);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });

    try {
      const res = await axiosInstance.put("/users/profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating profile");
      console.log("Error during updating profile:", error);
      throw error;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(SOCKET_URL, {
      query: { userId: authUser.id },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds.map(Number) });
    });

    socket.on("newNotification", (notification) => {
      useNotificationStore.getState().addNotification(notification);
    });

    socket.on("connectionUpdated", async ({ partnerId, isFollowing, connectionStatus }) => {
      const followerStoreModule = await import("./useFollowerStore");
      if (followerStoreModule && followerStoreModule.useFollowerStore) {
        followerStoreModule.useFollowerStore.getState().updateUserConnectionState(partnerId, isFollowing, connectionStatus);
      }
      const chatStoreModule = await import("./useChatStore");
      if (chatStoreModule && chatStoreModule.useChatStore) {
        chatStoreModule.useChatStore.getState().getUsers();
      }
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
