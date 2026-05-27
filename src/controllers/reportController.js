const Report = require("../models/reportModel");

const sendAdminActivity = require("../utils/sendAdminActivity");
const sendPlatformHealthUpdate = require("../utils/sendPlatformHealthUpdate");

// ===================================
// CREATE REPORT
// ===================================
exports.createReport = async (req, res, next) => {
  try {
    const { reportedUser, job, reason, description, type } = req.body;

    // CREATE REPORT
    const report = await Report.create({
      reportedBy: req.user._id,

      reportedUser,

      job,

      reason,

      description,

      type: type || "User",
    });

    // SOCKET
    const io = req.app.get("io");

    // LIVE ADMIN EVENT
    sendAdminActivity(io, {
      type: "NEW_REPORT",

      message: `${req.user.name} submitted a report`,

      report: {
        reason: report.reason,
      },
    });

    const activeUsers = req.app.get("activeUsers");

    await sendPlatformHealthUpdate(io, activeUsers);
    res.status(201).json({
      message: "Report submitted successfully",

      report,
    });
  } catch (error) {
    console.log("CREATE REPORT ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ===================================
// GET ALL REPORTS
// ===================================
exports.getReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate("reportedBy", "name email")
      .populate("reportedUser", "name email")
      .populate("job", "title")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(reports);
  } catch (error) {
    console.log("GET REPORTS ERROR:", error);

    next(error);
  }
};

// ===================================
// UPDATE REPORT STATUS
// ===================================
exports.updateReportStatus = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    report.status = req.body.status;

    report.adminResponse = req.body.adminResponse;

    await report.save();

    res.status(200).json({
      message: "Report updated successfully",

      report,
    });
  } catch (error) {
    console.log("UPDATE REPORT ERROR:", error);

    next(error);
  }
};

// ===================================
// GET MY REPORTS
// ===================================
exports.getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.find({
      reportedBy: req.user._id,
    })
      .populate("reportedUser", "name email")
      .populate("job", "title")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(reports);
  } catch (error) {
    console.log("GET MY REPORTS ERROR:", error);

    next(error);
  }
};
