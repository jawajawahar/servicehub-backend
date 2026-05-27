const Notification = require("../models/notificationModel");

// ===================================
// CREATE NOTIFICATION
// ===================================
exports.createNotification = async (data) => {
  try {
    const notification = await Notification.create({
      receiver: data.receiver,

      sender: data.sender,

      job: data.job,

      type: data.type,

      message: data.message,
    });

    return notification;
  } catch (error) {
    console.error("Notification Error:", error);
  }
};

// ===================================
// GET MY NOTIFICATIONS
// ===================================
exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      receiver: req.user._id,
    })
      .populate("sender", "name role")
      .populate("job", "title")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

// ===================================
// MARK AS READ
// ===================================
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    // SECURITY CHECK
    if (notification.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    notification.isRead = true;

    await notification.save();

    res.status(200).json({
      message: "Notification marked as read",
    });
  } catch (error) {
    next(error);
  }
};

// ===================================
// MARK ALL AS READ
// ===================================
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        receiver: req.user._id,

        isRead: false,
      },
      {
        isRead: true,
      },
    );

    res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

// ===================================
// DELETE NOTIFICATION
// ===================================
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    // SECURITY CHECK
    if (notification.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    await notification.deleteOne();

    res.status(200).json({
      message: "Notification deleted",
    });
  } catch (error) {
    next(error);
  }
};

// ===================================
// GET UNREAD COUNT
// ===================================
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      receiver: req.user._id,

      isRead: false,
    });

    res.status(200).json({
      unread: count,
    });
  } catch (error) {
    next(error);
  }
};
