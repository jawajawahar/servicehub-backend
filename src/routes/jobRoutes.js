const express = require("express");

const router = express.Router();

const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  updateJobStatus,
  completeJob,
  scheduleJob,
  requestCompletion,
  approveCompletion,
  getWorkspaces,
} = require("../controllers/jobController");

const { protect } = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

// ===================================
// GET ALL JOBS (PUBLIC)
// ===================================
router.get("/", getJobs);

// ===================================
// MY JOBS
// ===================================
router.get("/my-jobs", protect, getMyJobs);

// ===================================
// WORKSPACES
// ===================================
router.get("/workspaces", protect, getWorkspaces);

// ===================================
// GET SINGLE JOB
// ===================================
router.get("/:id", getJobById);

// ===================================
// CREATE JOB
// ===================================
router.post("/", protect, upload.array("images", 5), createJob);

// ===================================
// SCHEDULE JOB  (must be before generic /:id patch)
// ===================================
router.patch("/schedule/:id", protect, scheduleJob);

// ===================================
// COMPLETE JOB  (must be before generic /:id patch)
// ===================================
router.patch("/complete/:id", protect, completeJob);

// ===================================
// REQUEST COMPLETION  (must be before generic /:id patch)
// ===================================
router.patch("/:id/request-completion", protect, requestCompletion);

// ===================================
// APPROVE COMPLETION  (must be before generic /:id patch)
// ===================================
router.patch("/:id/approve-completion", protect, approveCompletion);

// ===================================
// UPDATE STATUS  (generic - keep last among PATCH routes)
// ===================================
router.patch("/:id", protect, updateJobStatus);

// ===================================
// FULL UPDATE
// ===================================
router.put("/:id", protect, updateJob);

// ===================================
// DELETE JOB
// ===================================
router.delete("/:id", protect, deleteJob);

module.exports = router;

