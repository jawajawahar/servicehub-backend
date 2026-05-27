const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },

    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Job",
    },

    reason: {
      type: String,

      required: true,

      trim: true,
    },

    description: {
      type: String,

      trim: true,
    },

    status: {
      type: String,

      enum: ["Open", "Under Review", "Resolved", "Rejected"],

      default: "Open",
    },

    adminResponse: {
      type: String,

      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Report", reportSchema);
