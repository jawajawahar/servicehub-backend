const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const { adminOnly } = require("../middleware/adminMiddleware");

const {
  createReport,
  getReports,
  updateReportStatus,
} = require("../controllers/reportController");

// CREATE REPORT
router.post("/", protect, createReport);

// ADMIN GET REPORTS
router.get("/", protect, adminOnly, getReports);

// UPDATE REPORT STATUS
router.patch("/:id", protect, adminOnly, updateReportStatus);

module.exports = router;
