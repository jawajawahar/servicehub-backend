const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // RECEIVER
    receiver: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },

    // SENDER
    sender: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",
    },

    // RELATED JOB
    job: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Job",
    },

    // NOTIFICATION TYPE
    type: {
      type: String,

      enum: [
        "APPLICATION",

        "APPLICATION_ACCEPTED",

        "APPLICATION_REJECTED",

        "MESSAGE",

        "PAYMENT",

        "JOB_COMPLETED",

        "REVIEW",

        "REPORT",

        "VERIFICATION",

        "SYSTEM",
      ],

      required: true,
    },

    // MESSAGE
    message: {
      type: String,

      required: true,

      trim: true,
    },

    // READ STATUS
    isRead: {
      type: Boolean,

      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Notification", notificationSchema);
