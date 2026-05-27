const express = require("express");

const router = express.Router();

const healthController = require("../controllers/healthController");

const { protect } = require("../middleware/authMiddleware");

// ===================================
// PLATFORM HEALTH ROUTE
// ===================================
router.get("/", protect, healthController.getPlatformHealth);

module.exports = router;
