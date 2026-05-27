const express = require("express");

const router = express.Router();

const {
  getMyNotifications,

  markAsRead,

  markAllAsRead,

  deleteNotification,

  getUnreadCount,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

// ===================================
// GET MY NOTIFICATIONS
// ===================================
router.get("/", protect, getMyNotifications);

// ===================================
// GET UNREAD COUNT
// ===================================
router.get("/unread-count", protect, getUnreadCount);

// ===================================
// MARK ALL AS READ
// ===================================
router.patch("/mark-all-read", protect, markAllAsRead);

// ===================================
// MARK SINGLE AS READ
// ===================================
router.patch("/:id/read", protect, markAsRead);

// ===================================
// DELETE NOTIFICATION
// ===================================
router.delete("/:id", protect, deleteNotification);

module.exports = router;
