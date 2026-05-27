const sendAdminActivity = (io, activity) => {
  io.to("admins").emit("adminActivity", {
    ...activity,

    createdAt: new Date(),
  });
};

module.exports = sendAdminActivity;
