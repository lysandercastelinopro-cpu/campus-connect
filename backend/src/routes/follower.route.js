import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
    getusersFromSearch,
    getUserById,
    toggleFollow,
    updateProfile,
    sendConnectRequest,
    acceptConnectRequest,
    disconnectUser
} from '../controllers/follower.controller.js';

const router = express.Router();

router.get("/", protectRoute, getusersFromSearch);
router.get("/search", protectRoute, getusersFromSearch);
router.put("/profile", protectRoute, updateProfile);

// Specific Connection Management Endpoints
router.post("/:id/connect", protectRoute, sendConnectRequest);
router.put("/:id/accept-connect", protectRoute, acceptConnectRequest);
router.delete("/:id/connect", protectRoute, disconnectUser);

// Legacy toggle endpoint
router.post("/toggle/:id", protectRoute, toggleFollow);

router.get("/:id", protectRoute, getUserById);

export default router;
