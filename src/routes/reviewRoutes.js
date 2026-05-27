const express = require("express");

const {
  createReview,
  getTradespersonReviews,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE REVIEW
router.post("/:jobId", protect, createReview);

// GET REVIEWS
router.get("/tradesperson/:id", getTradespersonReviews);

module.exports = router;
