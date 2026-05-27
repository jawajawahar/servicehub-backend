const User = require("../models/userModel");

const Job = require("../models/jobModel");

const Payment = require("../models/paymentModel");
const mongoose = require("mongoose");
const Report = require("../models/reportModel");

// DASHBOARD STATS
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalJobs = await Job.countDocuments();

    const totalReports = await Report.countDocuments();

    const completedJobs = await Job.countDocuments({
      status: "Completed",
    });

    const totalPayments = await Payment.countDocuments();

    const payments = await Payment.find();

    const totalRevenue = payments.reduce(
      (acc, payment) => acc + payment.platformFee,
      0,
    );

    res.status(200).json({
      totalUsers,

      totalJobs,

      completedJobs,

      totalPayments,

      totalRevenue,
      totalReports,
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// GET ALL USERS
// ==============================
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({
      createdAt: -1,
    });

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// ==============================
// VERIFY USER
// ==============================
// ===================================
// VERIFY USER
// ===================================
exports.verifyUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isVerified: true,
      },
      {
        new: true,
      },
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User verified successfully",

      user,
    });
  } catch (error) {
    next(error);
  }
};

// ===================================
// BLOCK / UNBLOCK USER
// ===================================
exports.blockUser = async (req, res, next) => {
  try {
    const { isBlocked } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isBlocked,
      },
      {
        new: true,
      },
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: isBlocked ? "User blocked" : "User unblocked",

      user,
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// UNBLOCK USER
// ==============================
exports.unblockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.isBlocked = false;

    await user.save();

    res.status(200).json({
      message: "User unblocked successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// DELETE USER
// ==============================
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ===================================
// GET ALL JOBS
// ===================================
exports.getAllJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find().populate("createdBy", "name email").sort({
      createdAt: -1,
    });

    res.status(200).json(jobs);
  } catch (error) {
    next(error);
  }
};

// ===================================
// DELETE JOB
// ===================================
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    res.status(200).json({
      message: "Job deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ===================================
// GET ALL REPORTS
// ===================================
exports.getAllReports = async (req, res) => {
  try {
    // SAFE QUERY
    const reports = await Report.find({})
      .populate("reportedBy", "name email")
      .populate("reportedUser", "name email")
      .populate("job", "title")
      .lean();

    // SAFE FORMAT
    const safeReports = reports.map((report) => ({
      _id: report._id,

      reportedBy: report.reportedBy || {
        name: "Unknown",

        email: "Unknown",
      },

      reportedUser: report.reportedUser || null,

      job: report.job || null,

      type: report.type || "User",

      reason: report.reason || "No reason provided",

      status: report.status || "Pending",

      createdAt: report.createdAt,
    }));

    res.status(200).json(safeReports);
  } catch (error) {
    console.log("ADMIN REPORT ERROR:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ===================================
// RESOLVE REPORT
// ===================================
exports.resolveReport = async (req, res, next) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status: "Resolved",
      },
      {
        new: true,
      },
    );

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    res.status(200).json({
      message: "Report resolved successfully",

      report,
    });
  } catch (error) {
    next(error);
  }
};

// ===================================
// GET ANALYTICS
// ===================================
exports.getAnalytics = async (req, res, next) => {
  try {
    // =========================
    // MONTHLY JOBS
    // =========================
    const jobsAnalytics = await Job.aggregate([
      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt",
            },
          },

          jobs: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          "_id.month": 1,
        },
      },
    ]);

    // =========================
    // MONTHLY USERS
    // =========================
    const usersAnalytics = await User.aggregate([
      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt",
            },
          },

          users: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          "_id.month": 1,
        },
      },
    ]);

    // =========================
    // MONTHLY REVENUE
    // =========================
    const revenueAnalytics = await Payment.aggregate([
      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt",
            },
          },

          revenue: {
            $sum: "$platformFee",
          },
        },
      },

      {
        $sort: {
          "_id.month": 1,
        },
      },
    ]);

    // =========================
    // MONTHLY REPORTS
    // =========================
    const reportsAnalytics = await Report.aggregate([
      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt",
            },
          },

          reports: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          "_id.month": 1,
        },
      },
    ]);

    // =========================
    // EXTRA INSIGHTS
    // =========================
    const activeWorkspaces = await Job.countDocuments({
      status: "In Progress",
    });

    const completedJobs = await Job.countDocuments({
      status: "Completed",
    });

    const pendingReports = await Report.countDocuments({
      status: "Pending",
    });

    const totalJobs = await Job.countDocuments();

    const completionRate =
      totalJobs === 0 ? 0 : ((completedJobs / totalJobs) * 100).toFixed(1);

    // RESPONSE
    res.status(200).json({
      jobsAnalytics,

      usersAnalytics,

      revenueAnalytics,

      reportsAnalytics,

      insights: {
        activeWorkspaces,

        completedJobs,

        pendingReports,

        completionRate,
      },
    });
  } catch (error) {
    console.log("ANALYTICS ERROR:", error);

    next(error);
  }
};
