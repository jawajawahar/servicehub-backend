const Application = require("../models/applicationModel");

const Job = require("../models/jobModel");

const sendNotification = require("../utils/sendNotification");

// ===================================
// CREATE APPLICATION
// ===================================
exports.createApplication = async (req, res, next) => {
  try {
    const { message, estimatedPrice } = req.body;

    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // PREVENT OWNER APPLYING
    if (job.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot apply to your own job",
      });
    }

    // CHECK EXISTING
    const existing = await Application.findOne({
      job: req.params.jobId,

      tradesperson: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        message: "Already applied to this job",
      });
    }

    // CREATE APPLICATION
    const application = await Application.create({
      job: req.params.jobId,

      tradesperson: req.user._id,

      message,

      estimatedPrice,
    });

    // SOCKET IO
    const io = req.app.get("io");

    // SEND NOTIFICATION
    await sendNotification(io, {
      receiver: job.createdBy,

      sender: req.user._id,

      job: job._id,

      type: "APPLICATION",

      message: `${req.user.name} applied for your job "${job.title}"`,
    });

    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

// ===================================
// GET JOB APPLICATIONS
// ===================================
exports.getApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({
      job: req.params.jobId,
    })
      .populate("tradesperson", "name email role phone")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};

// ===================================
// ACCEPT APPLICATION
// ===================================
// ===================================
// ACCEPT APPLICATION
// ===================================
exports.acceptApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate("tradesperson", "name")
      .populate("job", "title createdBy");

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    // CHECK IF JOB ALREADY ASSIGNED
    const existingJob = await Job.findById(application.job._id);

    if (existingJob.assignedTradesperson) {
      return res.status(400).json({
        message: "A tradesperson is already assigned",
      });
    }

    // ACCEPT SELECTED
    application.status = "Accepted";

    await application.save();

    // AUTO REJECT OTHERS
    await Application.updateMany(
      {
        job: application.job._id,

        _id: {
          $ne: application._id,
        },
      },
      {
        status: "Rejected",
      },
    );

    // UPDATE JOB
    await Job.findByIdAndUpdate(application.job._id, {
      status: "In Progress",

      assignedTradesperson: application.tradesperson._id,
    });

    // SOCKET
    const io = req.app.get("io");

    // ACCEPTED NOTIFICATION
    await sendNotification(io, {
      receiver: application.tradesperson._id,

      sender: req.user._id,

      job: application.job._id,

      type: "APPLICATION_ACCEPTED",

      message: `Your application was accepted for "${application.job.title}"`,
    });

    // REJECT OTHER APPLICANTS
    const rejectedApps = await Application.find({
      job: application.job._id,

      _id: {
        $ne: application._id,
      },
    });

    for (const rejected of rejectedApps) {
      await sendNotification(io, {
        receiver: rejected.tradesperson,

        sender: req.user._id,

        job: application.job._id,

        type: "APPLICATION_REJECTED",

        message: `Another tradesperson was selected for "${application.job.title}"`,
      });
    }

    res.status(200).json({
      message: "Application accepted successfully",

      application,
    });
  } catch (error) {
    next(error);
  }
};

// ===================================
// REJECT APPLICATION
// ===================================
exports.rejectApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate("tradesperson", "name")
      .populate("job", "title");

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    // REJECT
    application.status = "Rejected";

    await application.save();

    // SOCKET
    const io = req.app.get("io");

    // NOTIFICATION
    await sendNotification(io, {
      receiver: application.tradesperson._id,

      sender: req.user._id,

      job: application.job._id,

      type: "APPLICATION_REJECTED",

      message: `Your application was rejected for "${application.job.title}"`,
    });

    res.status(200).json({
      message: "Application rejected",

      application,
    });
  } catch (error) {
    next(error);
  }
};

// ===================================
// GET MY APPLICATIONS
// ===================================
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({
      tradesperson: req.user._id,
    })
      .populate("job", "title status")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};
