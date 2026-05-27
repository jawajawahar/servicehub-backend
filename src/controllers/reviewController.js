const Review = require("../models/reviewModel");

const Job = require("../models/jobModel");

const User = require("../models/userModel");

// CREATE REVIEW
exports.createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // ONLY OWNER
    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    // ONLY COMPLETED JOBS
    if (job.status !== "Completed" && job.status !== "Closed") {
      return res.status(400).json({
        message: "Job not completed",
      });
    }

    // PREVENT DUPLICATE REVIEWS
    const existing = await Review.findOne({
      job: job._id,
    });

    if (existing) {
      return res.status(400).json({
        message: "Review already exists",
      });
    }

    // FIND ACCEPTED APPLICATION
    const Application = require("../models/applicationModel");

    const accepted = await Application.findOne({
      job: job._id,

      status: "Accepted",
    });

    if (!accepted) {
      return res.status(400).json({
        message: "No accepted tradesperson",
      });
    }

    // CREATE REVIEW
    const review = await Review.create({
      job: job._id,

      reviewer: req.user._id,

      tradesperson: accepted.tradesperson,

      rating,

      comment,
    });

    // GET ALL REVIEWS
    const reviews = await Review.find({
      tradesperson: accepted.tradesperson,
    });

    // CALCULATE AVERAGE
    const totalRating = reviews.reduce((acc, item) => acc + item.rating, 0);

    const averageRating = totalRating / reviews.length;

    // UPDATE USER
    await User.findByIdAndUpdate(accepted.tradesperson, {
      averageRating: Number(averageRating.toFixed(1)),

      totalReviews: reviews.length,
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

// GET TRADESPERSON REVIEWS
exports.getTradespersonReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      tradesperson: req.params.id,
    })
      .populate("reviewer", "name")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};
