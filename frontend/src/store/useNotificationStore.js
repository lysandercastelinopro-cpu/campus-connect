import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  getNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/notifications");
      set({
        notifications: res.data.notifications || [],
        unreadCount: res.data.unreadCount || 0
      });
    } catch (error) {
      console.log("Error fetching notifications:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const res = await axiosInstance.put(`/notifications/${notificationId}/read`);
      const updated = res.data.notification;
      set({
        notifications: get().notifications.map((n) => (n.id === notificationId ? updated : n)),
        unreadCount: Math.max(0, res.data.unreadCount ?? get().unreadCount - 1)
      });
    } catch (error) {
      console.log("Error marking notification as read:", error);
    }
  },

  markAllAsRead: async () => {
    try {
      await axiosInstance.put("/notifications/read-all");
      set({
        notifications: get().notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0
      });
      toast.success("All alerts marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const res = await axiosInstance.delete(`/notifications/${notificationId}`);
      set({
        notifications: get().notifications.filter((n) => n.id !== notificationId),
        unreadCount: Math.max(0, res.data.unreadCount ?? get().unreadCount - 1)
      });
    } catch (error) {
      console.log("Error deleting notification:", error);
    }
  },

  acceptFollowRequest: async (senderId, notificationId) => {
    try {
      // Connect / follow back
      const followRes = await axiosInstance.post(`/users/toggle/${senderId}`);
      
      // Mark notification as read
      await get().markAsRead(notificationId);

      // Refresh chat list in useChatStore
      const chatStoreModule = await import("./useChatStore");
      if (chatStoreModule && chatStoreModule.useChatStore) {
        chatStoreModule.useChatStore.getState().getUsers();
      }

      toast.success(followRes.data?.message || "Connected successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error accepting request");
    }
  },

  rejectFollowRequest: async (notificationId) => {
    try {
      await get().deleteNotification(notificationId);
      toast.success("Request dismissed");
    } catch (error) {
      toast.error("Error dismissing request");
    }
  },

  addNotification: (notification) => {
    set({
      notifications: [notification, ...get().notifications],
      unreadCount: get().unreadCount + 1
    });

    if (notification.type === "FOLLOW_REQUEST" || notification.type === "FOLLOW_ACCEPT") {
      toast(notification.content, {
        duration: 4000,
        position: "top-right"
      });
    } else if (notification.type === "MESSAGE") {
      toast(`${notification.sender?.name || "Peer"}: ${notification.content}`, {
        duration: 4000,
        position: "top-right"
      });
    }
  }
}));
