const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const { adminOnly } = require("../middleware/adminMiddleware");

const {
  getDashboardStats,
  getAllUsers,
  verifyUser,
  blockUser,
  unblockUser,
  deleteUser,
  getAllJobs,

  deleteJob,
  getAllReports,
  getAnalytics,
  resolveReport,
} = require("../controllers/adminController");

// DASHBOARD
router.get("/dashboard", protect, adminOnly, getDashboardStats);

// USERS
router.get("/users", protect, adminOnly, getAllUsers);

// GET ALL JOBS
router.get("/jobs", protect, adminOnly, getAllJobs);

// DELETE JOB
router.delete("/jobs/:id", protect, adminOnly, deleteJob);

// GET ALL REPORTS
router.get("/reports", protect, adminOnly, getAllReports);

router.get("/analytics", protect, adminOnly, getAnalytics);

// RESOLVE REPORT
router.patch("/reports/:id/resolve", protect, adminOnly, resolveReport);

// VERIFY USER
router.patch("/users/:id/verify", protect, adminOnly, verifyUser);

// BLOCK / UNBLOCK USER
router.patch("/users/:id/block", protect, adminOnly, blockUser);

// UNBLOCK USER
router.patch("/unblock/:id", protect, adminOnly, unblockUser);

// DELETE USER
router.delete("/user/:id", protect, adminOnly, deleteUser);

module.exports = router;
