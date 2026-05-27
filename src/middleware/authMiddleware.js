const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

exports.protect = async (req, res, next) => {
  try {
    let token;

    // CHECK TOKEN
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    // VERIFY TOKEN
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // GET USER
    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (error) {
    res.status(401).json({
      message: "Invalid token",
    });
  }
};
