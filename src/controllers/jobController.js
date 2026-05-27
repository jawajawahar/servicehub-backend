const Job = require("../models/jobModel");

const Review = require("../models/reviewModel");

const Application = require("../models/applicationModel");
const sendPlatformHealthUpdate = require("../utils/sendPlatformHealthUpdate");
const sendNotification = require("../utils/sendNotification");

const sendAdminActivity = require("../utils/sendAdminActivity");

// ===================================
// ATTACH RATINGS
// ===================================
const attachRatings = async (jobs) => {
  return await Promise.all(
    jobs.map(async (job) => {
      try {
        const reviews = await Review.find({
          job: job._id,
        });

        const totalReviews = reviews.length;

        const averageRating =
          totalReviews > 0
            ? (
                reviews.reduce((acc, item) => acc + item.rating, 0) /
                totalReviews
              ).toFixed(1)
            : 0;

        return {
          ...job.toObject(),

          averageRating,

          totalReviews,

          reviewSubmitted: totalReviews > 0,
        };
      } catch (error) {
        console.error("Rating error:", error);

        return {
          ...job.toObject(),

          averageRating: 0,

          totalReviews: 0,

          reviewSubmitted: false,
        };
      }
    }),
  );
};

// ===================================
// GET ALL JOBS
// ===================================
exports.getJobs = async (req, res, next) => {
  try {
    const { category, status, search, sort } = req.query;

    let filter = {};

    // CATEGORY
    if (category && category !== "All") {
      filter.category = category;
    }

    // STATUS
    if (status && status !== "All") {
      filter.status = status;
    }

    // SEARCH
    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },

        {
          description: {
            $regex: search,
            $options: "i",
          },
        },

        {
          location: {
            $regex: search,
            $options: "i",
          },
        },

        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // SORT
    let sortOption = {
      createdAt: -1,
    };

    if (sort === "oldest") {
      sortOption = {
        createdAt: 1,
      };
    }

    // FETCH JOBS
    const jobs = await Job.find(filter)

      .populate("createdBy", "name email")

      .populate("assignedTradesperson", "name averageRating totalReviews")

      .sort(sortOption);

    // REMOVE INVALID JOBS
    res.status(200).json(jobs);
  } catch (error) {
    console.log("GET JOBS ERROR:", error);

    next(error);
  }
};

// ===================================
// GET SINGLE JOB
// ===================================
exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "createdBy",
      "name email role",
    );

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    const jobsWithRatings = await attachRatings([job]);

    res.status(200).json(jobsWithRatings[0]);
  } catch (error) {
    next(error);
  }
};

// ===================================
// CREATE JOB
// ===================================
exports.createJob = async (req, res, next) => {
  try {
    const imageUrls = req.files?.map((file) => file.path) || [];

    const job = await Job.create({
      ...req.body,

      images: imageUrls,

      createdBy: req.user._id,
    });

    // SOCKET
    const io = req.app.get("io");

    // LIVE ADMIN EVENT
    sendAdminActivity(io, {
      type: "NEW_JOB",

      message: `${req.user.name} posted a new job`,

      job: {
        title: job.title,
      },
    });

    const activeUsers = req.app.get("activeUsers");

    await sendPlatformHealthUpdate(io, activeUsers);

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

// ===================================
// UPDATE JOB STATUS
// ===================================
exports.updateJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    if (
      !job.createdBy ||
      job.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized to update this job",
      });
    }

    job.status = status;

    await job.save();

    res.status(200).json(job);
  } catch (error) {
    next(error);
  }
};

// ===================================
// UPDATE JOB
// ===================================
exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    if (
      !job.createdBy ||
      job.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedJob);
  } catch (error) {
    next(error);
  }
};

// ===================================
// DELETE JOB
// ===================================
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    if (
      !job.createdBy ||
      job.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    await job.deleteOne();

    res.status(200).json({
      message: "Job deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ===================================
// GET MY JOBS
// ===================================
exports.getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({
      createdBy: req.user._id,
    }).sort({
      createdAt: -1,
    });

    const jobsWithApplications = await Promise.all(
      jobs.map(async (job) => {
        const applications = await Application.find({
          job: job._id,
        }).populate(
          "tradesperson",
          `
                  name
                  email
                  role
                  profileImage
                  skills
                  experience
                  bio
                  location
                  isVerified
                  averageRating
                  totalReviews
                  completedJobs
                  `,
        );

        return {
          ...job.toObject(),

          applications,
        };
      }),
    );

    res.status(200).json(jobsWithApplications);
  } catch (error) {
    next(error);
  }
};

// ===================================
// COMPLETE JOB
// ===================================
exports.completeJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    job.status = "Completed";

    await job.save();

    res.status(200).json({
      message: "Job completed successfully",

      job,
    });
  } catch (error) {
    next(error);
  }
};

// ===================================
// SCHEDULE JOB
// ===================================
exports.scheduleJob = async (req, res, next) => {
  try {
    const { scheduledDate } = req.body;

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    if (req.user.role !== "tradesperson") {
      return res.status(403).json({
        message: "Only tradesperson can schedule",
      });
    }

    job.scheduledDate = scheduledDate;

    job.scheduledBy = req.user._id;

    await job.save();

    res.status(200).json({
      message: "Appointment scheduled",

      job,
    });
  } catch (error) {
    next(error);
  }
};

// ===================================
// REQUEST COMPLETION
// ===================================
exports.requestCompletion = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    if (job.assignedTradesperson?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only assigned tradesperson can request completion",
      });
    }

    job.completionRequested = true;

    await job.save();

    const io = req.app.get("io");

    await sendNotification(io, {
      receiver: job.createdBy,

      sender: req.user._id,

      job: job._id,

      type: "COMPLETION_REQUEST",

      message: "Tradesperson marked this project as completed",
    });

    res.status(200).json({
      message: "Completion request submitted",

      job,
    });
  } catch (error) {
    next(error);
  }
};

// ===================================
// APPROVE COMPLETION
// ===================================
exports.approveCompletion = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only homeowner can approve completion",
      });
    }

    job.status = "Completed";

    job.completedAt = new Date();

    await job.save();

    const activeUsers = req.app.get("activeUsers");

    await sendPlatformHealthUpdate(io, activeUsers);

    const io = req.app.get("io");

    await sendNotification(io, {
      receiver: job.assignedTradesperson,

      sender: req.user._id,

      job: job._id,

      type: "JOB_COMPLETED",

      message: "Homeowner approved job completion",
    });

    res.status(200).json({
      message: "Job marked as completed",

      job,
    });
  } catch (error) {
    next(error);
  }
};

// ===================================
// GET ACTIVE WORKSPACES
// ===================================
exports.getWorkspaces = async (req, res, next) => {
  try {
    const jobs = await Job.find({
      status: "In Progress",

      $or: [
        {
          createdBy: req.user._id,
        },

        {
          assignedTradesperson: req.user._id,
        },
      ],
    }).sort({
      updatedAt: -1,
    });

    res.status(200).json(jobs);
  } catch (error) {
    next(error);
  }
};
