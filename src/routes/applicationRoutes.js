const express = require("express");

const router = express.Router();

const {
  createApplication,

  getApplications,

  acceptApplication,

  rejectApplication,

  getMyApplications,
} = require("../controllers/applicationController");

const { protect } = require("../middleware/authMiddleware");

// ===================================
// CREATE APPLICATION
// ===================================
router.post("/:jobId", protect, createApplication);

// ===================================
// GET JOB APPLICATIONS
// ===================================
router.get("/job/:jobId", protect, getApplications);

// ===================================
// ACCEPT APPLICATION
// ===================================
router.patch("/:id/accept", protect, acceptApplication);

// ===================================
// REJECT APPLICATION
// ===================================
router.patch("/:id/reject", protect, rejectApplication);

// ===================================
// GET MY APPLICATIONS
// ===================================
router.get("/my-applications", protect, getMyApplications);

module.exports = router;
