const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    bio: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    experience: {
      type: Number,
      default: 0,
    },

    location: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["homeowner", "tradesperson", "admin"],
      default: "homeowner",
    },

    isVerified: {
      type: Boolean,

      default: false,
    },

    isBlocked: {
      type: Boolean,

      default: false,
    },

    phone: {
      type: String,
    },

    profileImage: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
