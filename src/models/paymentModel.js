const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Job",

      required: true,
    },

    homeowner: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },

    tradesperson: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },

    amount: {
      type: Number,

      required: true,
    },

    platformFee: {
      type: Number,

      default: 0,
    },

    totalAmount: {
      type: Number,

      required: true,
    },

    paymentStatus: {
      type: String,

      enum: ["Pending", "Paid", "Released", "Refunded"],

      default: "Pending",
    },

    transactionId: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Payment", paymentSchema);
