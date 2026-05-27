const { createNotification } = require("../controllers/notificationController");

module.exports = async (io, data) => {
  // SAVE TO DATABASE
  const notification = await createNotification(data);

  // REALTIME EMIT
  io.to(data.receiver.toString()).emit("receiveNotification", notification);
};
