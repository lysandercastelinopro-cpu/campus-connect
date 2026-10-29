import { prisma } from "../lib/prisma.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 50,
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        profilePic: true,
                        bio: true,
                        tags: true
                    }
                }
            }
        });

        const unreadCount = await prisma.notification.count({
            where: {
                userId,
                read: false
            }
        });

        res.status(200).json({
            notifications,
            unreadCount
        });
    } catch (error) {
        console.log("Error in getNotifications:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notifId = parseInt(id, 10);
        if (isNaN(notifId)) {
            return res.status(400).json({ message: "Invalid notification ID" });
        }

        const existing = await prisma.notification.findUnique({
            where: { id: notifId }
        });

        if (!existing || existing.userId !== userId) {
            return res.status(404).json({ message: "Notification not found" });
        }

        const updated = await prisma.notification.update({
            where: { id: notifId },
            data: { read: true },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        profilePic: true
                    }
                }
            }
        });

        const unreadCount = await prisma.notification.count({
            where: { userId, read: false }
        });

        res.status(200).json({ notification: updated, unreadCount });
    } catch (error) {
        console.log("Error in markNotificationAsRead:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true }
        });

        res.status(200).json({ message: "All notifications marked as read", unreadCount: 0 });
    } catch (error) {
        console.log("Error in markAllNotificationsAsRead:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notifId = parseInt(id, 10);
        if (isNaN(notifId)) {
            return res.status(400).json({ message: "Invalid notification ID" });
        }

        const existing = await prisma.notification.findUnique({
            where: { id: notifId }
        });

        if (!existing || existing.userId !== userId) {
            return res.status(404).json({ message: "Notification not found" });
        }

        await prisma.notification.delete({
            where: { id: notifId }
        });

        const unreadCount = await prisma.notification.count({
            where: { userId, read: false }
        });

        res.status(200).json({ message: "Notification deleted", unreadCount });
    } catch (error) {
        console.log("Error in deleteNotification:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
