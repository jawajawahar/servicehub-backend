const onlineUsers = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // USER ONLINE
    socket.on("userOnline", (userId) => {
      onlineUsers.set(userId, socket.id);

      console.log("ONLINE USERS:", Array.from(onlineUsers.keys()));

      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

    // JOIN ROOM
    socket.on("joinRoom", (jobId) => {
      socket.join(jobId);

      console.log(`Joined room: ${jobId}`);
    });

    // SEND MESSAGE
    socket.on("sendMessage", (message) => {
      io.to(message.job).emit("receiveMessage", message);
    });

    // TYPING
    socket.on("typing", (data) => {
      console.log("Typing:", data);

      socket.to(data.jobId).emit("typing", {
        user: data.user,
      });
    });

    // STOP TYPING
    socket.on("stopTyping", (data) => {
      socket.to(data.jobId).emit("stopTyping");
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id);

      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);

          break;
        }
      }

      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });
  });
};
