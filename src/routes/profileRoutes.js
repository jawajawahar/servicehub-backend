const express = require("express");

const {
  getProfile,
  updateProfile,
} = require("../controllers/profileController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// GET PROFILE
router.get("/:id", getProfile);

// UPDATE PROFILE
router.put("/", protect, updateProfile);

module.exports = router;
