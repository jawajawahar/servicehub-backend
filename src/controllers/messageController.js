const Message = require("../models/messageModel");

const Application = require("../models/applicationModel");

// CREATE MESSAGE
exports.createMessage = async (req, res, next) => {
  try {
    const { sender, job, text } = req.body;

    const message = await Message.create({
      sender,
      job,
      text,
    });

    const populated = await Message.findById(message._id).populate(
      "sender",
      "name email",
    );

    res.status(201).json(populated);
  } catch (error) {
    console.error(error);

    next(error);
  }
};

// GET MESSAGES
exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({
      job: req.params.jobId,
    })
      .populate("sender", "name email")
      .sort({
        createdAt: 1,
      });

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);

    next(error);
  }
};

// CHECK CHAT ACCESS
exports.checkChatAccess = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      job: req.params.jobId,

      status: "Accepted",
    });

    if (!application) {
      return res.status(403).json({
        message: "Chat not allowed",
      });
    }

    res.status(200).json({
      allowed: true,
    });
  } catch (error) {
    console.error(error);

    next(error);
  }
};
