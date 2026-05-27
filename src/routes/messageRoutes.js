const express = require("express");

const router = express.Router();

const {
  createMessage,
  getMessages,
  checkChatAccess,
} = require("../controllers/messageController");

const { protect } = require("../middleware/authMiddleware");

// CREATE MESSAGE
router.post("/", protect, createMessage);

// GET MESSAGES
router.get("/:jobId", protect, getMessages);

// CHECK ACCESS
router.get("/access/:jobId", protect, checkChatAccess);

module.exports = router;
