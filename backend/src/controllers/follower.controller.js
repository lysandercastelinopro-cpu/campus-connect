import { prisma } from "../lib/prisma.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getusersFromSearch = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        const { query, tag } = req.query;

        const trimmedQuery = query?.trim();
        const trimmedTag = tag?.trim();

        if (!trimmedQuery && !trimmedTag) {
            return res.status(200).json([]);
        }

        const whereClause = {
            NOT: {
                id: loggedInUserId
            }
        };

        if (trimmedQuery) {
            whereClause.OR = [
                {
                    username: {
                        contains: trimmedQuery,
                        mode: "insensitive"
                    }
                },
                {
                    name: {
                        contains: trimmedQuery,
                        mode: "insensitive"
                    }
                },
                {
                    bio: {
                        contains: trimmedQuery,
                        mode: "insensitive"
                    }
                }
            ];
        }

        if (trimmedTag && trimmedTag !== "All") {
            whereClause.tags = {
                has: trimmedTag
            };
        }

        // Find all matched users
        const searchUsers = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                username: true,
                name: true,
                profilePic: true,
                bio: true,
                tags: true
            }
        });

        // Find all active follower connections for the logged-in user
        const activeConnections = await prisma.follower.findMany({
            where: {
                OR: [
                    { userId: loggedInUserId },
                    { followerId: loggedInUserId }
                ]
            }
        });

        // Map connection statuses
        const connectionMap = new Map();
        activeConnections.forEach(conn => {
            const partnerId = conn.userId === loggedInUserId ? conn.followerId : conn.userId;
            connectionMap.set(partnerId, {
                status: conn.status,
                isSender: conn.userId === loggedInUserId
            });
        });

        const usersWithFollowStatus = searchUsers.map(user => {
            const conn = connectionMap.get(user.id);
            const isFollowing = conn ? conn.status === "ACCEPTED" : false;
            const connectionStatus = conn ? conn.status : "NONE";
            return {
                id: user.id,
                username: user.username,
                name: user.name,
                profilePic: user.profilePic,
                bio: user.bio || "",
                tags: user.tags || [],
                isFollowing,
                connectionStatus
            };
        });

        return res.status(200).json(usersWithFollowStatus);
    } catch (error) {
        console.log("Error in getusersFromSearch:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const loggedInUserId = req.user?.id;
        const targetUserId = parseInt(id, 10);

        if (isNaN(targetUserId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const user = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                profilePic: true,
                bio: true,
                tags: true,
                createdAt: true,
                _count: {
                    select: {
                        receivedFollowers: { where: { status: "ACCEPTED" } },
                        sentFollowers: { where: { status: "ACCEPTED" } }
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let isFollowing = false;
        let connectionStatus = "NONE";

        if (loggedInUserId) {
            const conn = await prisma.follower.findFirst({
                where: {
                    OR: [
                        { userId: loggedInUserId, followerId: targetUserId },
                        { userId: targetUserId, followerId: loggedInUserId }
                    ]
                }
            });
            if (conn) {
                connectionStatus = conn.status;
                isFollowing = conn.status === "ACCEPTED";
            }
        }

        return res.status(200).json({
            ...user,
            isFollowing,
            connectionStatus
        });
    } catch (error) {
        console.log("Error in getUserById:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, tags } = req.body;
        const userId = req.user.id;

        const updateData = {};

        if (profilePic) {
            if (typeof profilePic === "string" && profilePic.startsWith("data:image")) {
                const uploadResponse = await cloudinary.uploader.upload(profilePic);
                updateData.profilePic = uploadResponse.secure_url;
            } else {
                updateData.profilePic = profilePic;
            }
        }

        if (bio !== undefined) {
            updateData.bio = typeof bio === "string" ? bio : "";
        }

        if (tags !== undefined) {
            updateData.tags = Array.isArray(tags) ? tags : [];
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "At least one field (profilePic, bio, tags) is required" });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in updateProfile:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// POST /api/users/:id/connect
// Checks existing connection. If none exists, creates a PENDING connection record and generates a FOLLOW_REQUEST notification.
export const sendConnectRequest = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        const { id: targetUserId } = req.params;

        const targetUserIntId = parseInt(targetUserId, 10);
        if (isNaN(targetUserIntId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        if (loggedInUserId === targetUserIntId) {
            return res.status(400).json({ message: "You cannot connect with yourself" });
        }

        const existingConn = await prisma.follower.findFirst({
            where: {
                OR: [
                    { userId: loggedInUserId, followerId: targetUserIntId },
                    { userId: targetUserIntId, followerId: loggedInUserId }
                ]
            }
        });

        if (existingConn) {
            if (existingConn.status === "ACCEPTED") {
                return res.status(200).json({
                    message: "Already connected",
                    isFollowing: true,
                    connectionStatus: "ACCEPTED",
                    connection: existingConn
                });
            } else if (existingConn.status === "PENDING") {
                return res.status(200).json({
                    message: "Connection request already pending",
                    isFollowing: false,
                    connectionStatus: "PENDING",
                    connection: existingConn
                });
            }
        }

        // Create PENDING connection record
        const newConnection = await prisma.follower.create({
            data: {
                userId: loggedInUserId,
                followerId: targetUserIntId,
                status: "PENDING"
            }
        });

        // Generate FOLLOW_REQUEST notification for recipient
        try {
            const senderName = req.user.name || req.user.username;
            const receiverSocketId = getReceiverSocketId(targetUserIntId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("connectionUpdated", {
                    partnerId: loggedInUserId,
                    isFollowing: false,
                    connectionStatus: "PENDING"
                });
            }

            const notification = await prisma.notification.create({
                data: {
                    userId: targetUserIntId,
                    senderId: loggedInUserId,
                    type: "FOLLOW_REQUEST",
                    content: `${senderName} sent you a connection request on CampusConnect.`,
                    read: false
                },
                include: {
                    sender: {
                        select: { id: true, name: true, username: true, profilePic: true }
                    }
                }
            });

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newNotification", notification);
            }
        } catch (notifErr) {
            console.log("Failed to create connect notification:", notifErr.message);
        }

        return res.status(201).json({
            message: "Connection request sent successfully",
            isFollowing: false,
            connectionStatus: "PENDING",
            connection: newConnection
        });
    } catch (error) {
        console.log("Error in sendConnectRequest:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// PUT /api/users/:id/accept-connect
// Explicitly updates existing PENDING connection status to ACCEPTED (does NOT toggle/delete).
export const acceptConnectRequest = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        const { id: targetUserId } = req.params;

        const targetUserIntId = parseInt(targetUserId, 10);
        if (isNaN(targetUserIntId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        let existingConn = await prisma.follower.findFirst({
            where: {
                OR: [
                    { userId: loggedInUserId, followerId: targetUserIntId },
                    { userId: targetUserIntId, followerId: loggedInUserId }
                ]
            }
        });

        if (!existingConn) {
            // If none existed, create as ACCEPTED directly
            existingConn = await prisma.follower.create({
                data: {
                    userId: targetUserIntId,
                    followerId: loggedInUserId,
                    status: "ACCEPTED"
                }
            });
        } else {
            // Explicitly update to ACCEPTED
            existingConn = await prisma.follower.update({
                where: { id: existingConn.id },
                data: { status: "ACCEPTED" }
            });
        }

        // Notify the requester that their connection request was accepted
        try {
            const senderName = req.user.name || req.user.username;
            const receiverSocketId = getReceiverSocketId(targetUserIntId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("connectionUpdated", {
                    partnerId: loggedInUserId,
                    isFollowing: true,
                    connectionStatus: "ACCEPTED"
                });
            }

            const notification = await prisma.notification.create({
                data: {
                    userId: targetUserIntId,
                    senderId: loggedInUserId,
                    type: "FOLLOW_ACCEPT",
                    content: `${senderName} accepted your connection request.`,
                    read: false
                },
                include: {
                    sender: {
                        select: { id: true, name: true, username: true, profilePic: true }
                    }
                }
            });

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newNotification", notification);
            }
        } catch (notifErr) {
            console.log("Failed to create accept notification:", notifErr.message);
        }

        return res.status(200).json({
            message: "Connection accepted successfully",
            isFollowing: true,
            connectionStatus: "ACCEPTED",
            connection: existingConn
        });
    } catch (error) {
        console.log("Error in acceptConnectRequest:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// DELETE /api/users/:id/connect
// Removes/deletes the connection record only when explicitly requested (Decline or Unfollow).
export const disconnectUser = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        const { id: targetUserId } = req.params;

        const targetUserIntId = parseInt(targetUserId, 10);
        if (isNaN(targetUserIntId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const existingConn = await prisma.follower.findFirst({
            where: {
                OR: [
                    { userId: loggedInUserId, followerId: targetUserIntId },
                    { userId: targetUserIntId, followerId: loggedInUserId }
                ]
            }
        });

        if (existingConn) {
            await prisma.follower.delete({
                where: { id: existingConn.id }
            });

            // Emit socket event to the other user
            const receiverSocketId = getReceiverSocketId(targetUserIntId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("connectionUpdated", {
                    partnerId: loggedInUserId,
                    isFollowing: false,
                    connectionStatus: "NONE"
                });
            }
        }

        return res.status(200).json({
            message: "Disconnected successfully",
            isFollowing: false,
            connectionStatus: "NONE"
        });
    } catch (error) {
        console.log("Error in disconnectUser:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Legacy toggle endpoint kept for backward compatibility if needed
export const toggleFollow = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        const { id: targetUserId } = req.params;

        const targetUserIntId = parseInt(targetUserId, 10);
        if (isNaN(targetUserIntId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        if (loggedInUserId === targetUserIntId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const existingFollow = await prisma.follower.findFirst({
            where: {
                OR: [
                    { userId: loggedInUserId, followerId: targetUserIntId },
                    { userId: targetUserIntId, followerId: loggedInUserId }
                ]
            }
        });

        if (existingFollow && existingFollow.status === "ACCEPTED") {
            await prisma.follower.delete({
                where: { id: existingFollow.id }
            });

            // Emit real-time disconnect update to the recipient
            const receiverSocketId = getReceiverSocketId(targetUserIntId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("connectionUpdated", {
                    partnerId: loggedInUserId,
                    isFollowing: false,
                    connectionStatus: "NONE"
                });
            }

            return res.status(200).json({ message: "Disconnected successfully", isFollowing: false, connectionStatus: "NONE" });
        } else if (existingFollow && existingFollow.status === "PENDING") {
            // Cancel pending request
            await prisma.follower.delete({
                where: { id: existingFollow.id }
            });

            const receiverSocketId = getReceiverSocketId(targetUserIntId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("connectionUpdated", {
                    partnerId: loggedInUserId,
                    isFollowing: false,
                    connectionStatus: "NONE"
                });
            }

            return res.status(200).json({ message: "Connection request cancelled", isFollowing: false, connectionStatus: "NONE" });
        } else {
            const newConn = await prisma.follower.create({
                data: {
                    userId: loggedInUserId,
                    followerId: targetUserIntId,
                    status: "ACCEPTED"
                }
            });

            // Emit real-time connection status update to the recipient
            const receiverSocketId = getReceiverSocketId(targetUserIntId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("connectionUpdated", {
                    partnerId: loggedInUserId,
                    isFollowing: true,
                    connectionStatus: "ACCEPTED"
                });
            }

            try {
                const notification = await prisma.notification.create({
                    data: {
                        userId: targetUserIntId,
                        senderId: loggedInUserId,
                        type: "FOLLOW_REQUEST",
                        content: `${req.user.name || req.user.username} connected with you on CampusConnect.`,
                        read: false
                    },
                    include: {
                        sender: {
                            select: { id: true, name: true, username: true, profilePic: true }
                        }
                    }
                });

                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("newNotification", notification);
                }
            } catch (notifErr) {
                console.log("Failed to create follow notification:", notifErr.message);
            }

            return res.status(201).json({ message: "Connected successfully", isFollowing: true, connectionStatus: "ACCEPTED" });
        }
    } catch (error) {
        console.log("Error in toggleFollow:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
