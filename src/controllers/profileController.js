const User = require("../models/userModel");

const Review = require("../models/reviewModel");

const Job = require("../models/jobModel");

// GET PROFILE
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // REVIEWS
    const reviews = await Review.find({
      tradesperson: user._id,
    })
      .populate("reviewer", "name")
      .sort({
        createdAt: -1,
      });

    // RATING
    const totalReviews = reviews.length;

    const averageRating =
      totalReviews > 0
        ? (
            reviews.reduce((acc, item) => acc + item.rating, 0) / totalReviews
          ).toFixed(1)
        : 0;

    // COMPLETED JOBS
    const completedJobs = await Job.countDocuments({
      status: "Completed",
    });

    res.status(200).json({
      user,

      reviews,

      averageRating,

      totalReviews,

      completedJobs,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
    }).select("-password");

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
