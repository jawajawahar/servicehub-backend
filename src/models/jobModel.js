const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    contactName: {
      type: String,
      trim: true,
    },

    contactEmail: {
      type: String,
      trim: true,

      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    // HOMEOWNER
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },

    // ACCEPTED TRADESPERSON
    assignedTradesperson: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",
    },

    // APPOINTMENT
    scheduledDate: {
      type: Date,
    },

    scheduledBy: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",
    },

    // STATUS
    status: {
      type: String,

      enum: ["Open", "In Progress", "Completed", "Closed"],

      default: "Open",
    },

    completionRequested: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
    },

    // JOB IMAGES
    images: {
      type: [String],

      default: [],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Job", jobSchema);
