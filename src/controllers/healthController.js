const Job = require("../models/jobModel");

const User = require("../models/userModel");

const Report = require("../models/reportModel");

// ===================================
// GET PLATFORM HEALTH
// ===================================
const getPlatformHealth = async (req, res) => {
  try {
    // ACTIVE USERS
    const activeUsers = req.app.get("activeUsers");

    // USERS
    const totalUsers = await User.countDocuments();

    const homeowners = await User.countDocuments({
      role: "homeowner",
    });

    const tradespersons = await User.countDocuments({
      role: "tradesperson",
    });

    // JOBS
    const totalJobs = await Job.countDocuments();

    const openJobs = await Job.countDocuments({
      status: "Open",
    });

    const inProgressJobs = await Job.countDocuments({
      status: "In Progress",
    });

    const completedJobs = await Job.countDocuments({
      status: "Completed",
    });

    // REPORTS
    const totalReports = await Report.countDocuments();

    const openReports = await Report.countDocuments({
      status: "Open",
    });

    // COMPLETION RATE
    const completionRate =
      totalJobs > 0 ? ((completedJobs / totalJobs) * 100).toFixed(1) : 0;

    res.status(200).json({
      platformStatus: "Healthy",

      users: {
        total: totalUsers,

        active: activeUsers?.size || 0,

        homeowners,

        tradespersons,
      },

      jobs: {
        total: totalJobs,

        open: openJobs,

        inProgress: inProgressJobs,

        completed: completedJobs,

        completionRate,
      },

      reports: {
        total: totalReports,

        open: openReports,
      },

      timestamp: new Date(),
    });
  } catch (error) {
    console.log("HEALTH ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch platform health",
    });
  }
};

// ===================================
// EXPORTS
// ===================================
module.exports = {
  getPlatformHealth,
};
