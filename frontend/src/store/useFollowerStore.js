import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useFollowerStore = create((set, get) => ({
    users: [],
    selectedUser: null,
    isUsersLoading: false,

    getUsers: async (searchParams = "") => {
        set({ isUsersLoading: true });
        try {
            let query = "";
            let tag = "";

            if (typeof searchParams === "string") {
                query = searchParams;
            } else if (searchParams && typeof searchParams === "object") {
                query = searchParams.query || "";
                tag = searchParams.tag || "";
            }

            const params = new URLSearchParams();
            if (query.trim()) params.append("query", query.trim());
            if (tag.trim() && tag !== "All") params.append("tag", tag.trim());

            const queryString = params.toString();
            const res = await axiosInstance.get(`/users${queryString ? `?${queryString}` : ""}`);
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Error searching users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    connectUser: async (userId) => {
        try {
            const res = await axiosInstance.post(`/users/${userId}/connect`);
            const updatedUsers = get().users.map(u => {
                if (u.id === userId) {
                    return {
                        ...u,
                        isFollowing: res.data.isFollowing,
                        connectionStatus: res.data.connectionStatus
                    };
                }
                return u;
            });
            set({ users: updatedUsers });
            toast.success(res.data.message);
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Error sending connection request");
            throw error;
        }
    },

    acceptConnect: async (userId) => {
        try {
            const res = await axiosInstance.put(`/users/${userId}/accept-connect`);
            const updatedUsers = get().users.map(u => {
                if (u.id === userId) {
                    return {
                        ...u,
                        isFollowing: true,
                        connectionStatus: "ACCEPTED"
                    };
                }
                return u;
            });
            set({ users: updatedUsers });
            toast.success(res.data.message);

            const chatStoreModule = await import("./useChatStore");
            if (chatStoreModule && chatStoreModule.useChatStore) {
                chatStoreModule.useChatStore.getState().getUsers();
            }
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Error accepting connection");
            throw error;
        }
    },

    disconnectUser: async (userId) => {
        try {
            const res = await axiosInstance.delete(`/users/${userId}/connect`);
            const updatedUsers = get().users.map(u => {
                if (u.id === userId) {
                    return {
                        ...u,
                        isFollowing: false,
                        connectionStatus: "NONE"
                    };
                }
                return u;
            });
            set({ users: updatedUsers });
            toast.success(res.data.message);

            const chatStoreModule = await import("./useChatStore");
            if (chatStoreModule && chatStoreModule.useChatStore) {
                chatStoreModule.useChatStore.getState().getUsers();
            }
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Error removing connection");
            throw error;
        }
    },

    updateUserConnectionState: (partnerId, isFollowing, connectionStatus) => {
        const updatedUsers = get().users.map((u) => {
            if (u.id === partnerId) {
                return {
                    ...u,
                    isFollowing,
                    connectionStatus
                };
            }
            return u;
        });
        set({ users: updatedUsers });
    },

    toggleFollow: async (userId) => {
        try {
            const res = await axiosInstance.post(`/users/toggle/${userId}`);

            const updatedUsers = get().users.map(u => {
                if (u.id === userId) {
                    return {
                        ...u,
                        isFollowing: res.data.isFollowing,
                        connectionStatus: res.data.connectionStatus || (res.data.isFollowing ? "ACCEPTED" : "NONE")
                    };
                }
                return u;
            });
            set({ users: updatedUsers });
            toast.success(res.data.message);

            const chatStoreModule = await import("./useChatStore");
            if (chatStoreModule && chatStoreModule.useChatStore) {
                chatStoreModule.useChatStore.getState().getUsers();
            }
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Error updating connection status");
        }
    },
}));
