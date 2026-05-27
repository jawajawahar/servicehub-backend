const Job = require("../models/jobModel");

const Report = require("../models/reportModel");

const sendPlatformHealthUpdate = async (io, activeUsers) => {
  try {
    // JOBS
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
    const openReports = await Report.countDocuments({
      status: "Open",
    });

    // EMIT
    io.to("admins").emit("platformHealthUpdate", {
      activeUsers: activeUsers?.size || 0,

      openJobs,

      inProgressJobs,

      completedJobs,

      openReports,
    });
  } catch (error) {
    console.log("PLATFORM HEALTH SOCKET ERROR:", error);
  }
};

module.exports = sendPlatformHealthUpdate;
