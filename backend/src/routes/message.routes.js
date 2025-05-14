import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  getUsersForSidebar, 
  getMessages, 
  sendMessage 
} from "../controllers/message.controller.js"; // ✅ Import all required handlers

const router = express.Router();

// Routes
router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

export default router;
