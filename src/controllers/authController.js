const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

const sendAdminActivity = require("../utils/sendAdminActivity");

// GENERATE JWT TOKEN
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// =============================
// REGISTER USER
// =============================
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // CHECK EXISTING USER
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // HASH PASSWORD
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    // TRADESPERSON NEEDS VERIFICATION
    const isVerified = role === "homeowner";

    // CREATE USER
    const user = await User.create({
      name,

      email,

      password: hashedPassword,

      role,

      isVerified,

      isBlocked: false,
    });

    const io = req.app.get("io");

    sendAdminActivity(io, {
      type: "NEW_USER",

      message: `${user.name} registered as ${user.role}`,

      user: {
        name: user.name,

        role: user.role,
      },
    });

    // RESPONSE
    res.status(201).json({
      token: generateToken(user._id),

      user: {
        id: user._id,

        name: user.name,

        email: user.email,

        role: user.role,

        isVerified: user.isVerified,

        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =============================
// LOGIN USER
// =============================
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // FIND USER
    const user = await User.findOne({
      email,
    });

    // USER NOT FOUND
    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // BLOCKED USER CHECK
    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked by admin",
      });
    }

    // TRADESPERSON VERIFICATION CHECK
    if (user.role === "tradesperson" && !user.isVerified) {
      return res.status(403).json({
        message: "Your tradesperson account is waiting for admin verification",
      });
    }

    // PASSWORD CHECK
    const isMatch = await bcrypt.compare(password, user.password);

    // INVALID PASSWORD
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // SUCCESS LOGIN
    res.status(200).json({
      token: generateToken(user._id),

      user: {
        id: user._id,

        name: user.name,

        email: user.email,

        role: user.role,

        isVerified: user.isVerified,

        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    next(error);
  }
};
