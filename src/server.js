const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

const http = require("http");

const { Server } = require("socket.io");

require("dotenv").config();

// ==============================
// ROUTES
// ==============================
const authRoutes = require("./routes/authRoutes");

const jobRoutes = require("./routes/jobRoutes");

const healthRoutes = require("./routes/healthRoutes");

const applicationRoutes = require("./routes/applicationRoutes");

const paymentRoutes = require("./routes/paymentRoutes");

const reviewRoutes = require("./routes/reviewRoutes");

const reportRoutes = require("./routes/reportRoutes");

const profileRoutes = require("./routes/profileRoutes");

const adminRoutes = require("./routes/adminRoutes");

const messageRoutes = require("./routes/messageRoutes");

const notificationRoutes = require("./routes/notificationRoutes");

// ==============================
// EXPRESS APP
// ==============================
const app = express();

// ==============================
// HTTP SERVER
// ==============================
const server = http.createServer(app);

// ==============================
// SOCKET SERVER
// ==============================
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",

    methods: ["GET", "POST", "PATCH", "DELETE"],

    credentials: true,
  },
});

// MAKE SOCKET AVAILABLE
app.set("io", io);

// ===================================
// ACTIVE USERS
// ===================================
const activeUsers = new Map();

// MAKE ACTIVE USERS AVAILABLE
app.set("activeUsers", activeUsers);

// ==============================
// SOCKET CONNECTIONS
// ==============================
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // =========================
  // ADMIN ROOM
  // =========================
  socket.on("joinAdminRoom", () => {
    socket.join("admins");

    console.log("Admin joined realtime room");
  });

  // ==========================
  // USER ROOM
  // ==========================
  socket.on("joinUserRoom", (userId) => {
    socket.join(userId);

    // STORE ACTIVE USER
    activeUsers.set(socket.id, {
      userId,

      connectedAt: new Date(),
    });

    console.log("Joined user room:", userId);

    // SEND LIVE COUNT
    io.to("admins").emit("platformHealthUpdate", {
      activeUsers: activeUsers.size,
    });
  });

  // ==========================
  // CHAT ROOM
  // ==========================
  socket.on("joinRoom", (roomId) => {
    if (!roomId) return;

    socket.join(roomId);

    console.log(`Joined chat room: ${roomId}`);
  });

  // ==========================
  // SEND MESSAGE
  // ==========================
  socket.on("sendMessage", (messageData) => {
    if (!messageData?.job) return;

    io.to(messageData.job).emit("receiveMessage", messageData);
  });

  // ==========================
  // SEND NOTIFICATION
  // ==========================
  socket.on("sendNotification", (notificationData) => {
    if (!notificationData?.receiver) return;

    io.to(notificationData.receiver.toString()).emit(
      "receiveNotification",
      notificationData,
    );
  });

  // ==========================
  // DISCONNECT
  // ==========================
  socket.on("disconnect", () => {
    // REMOVE USER
    activeUsers.delete(socket.id);

    console.log("User disconnected:", socket.id);

    // UPDATE ADMINS
    io.to("admins").emit("platformHealthUpdate", {
      activeUsers: activeUsers.size,
    });
  });
});

// ==============================
// MIDDLEWARE
// ==============================
app.use(
  cors({
    origin: "http://localhost:3000",

    credentials: true,
  }),
);

app.use(express.json());

// ==============================
// API ROUTES
// ==============================
app.use("/api/auth", authRoutes);

app.use("/api/jobs", jobRoutes);

app.use("/api/applications", applicationRoutes);

app.use("/api/health", healthRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/reports", reportRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/messages", messageRoutes);

app.use("/api/notifications", notificationRoutes);

// ==============================
// HEALTH CHECK
// ==============================
app.get("/", (req, res) => {
  res.send("API running...");
});

// ==============================
// DATABASE CONNECTION
// ==============================
mongoose
  .connect(process.env.MONGO_URI)

  .then(() => {
    console.log("MongoDB connected");

    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })

  .catch((error) => {
    console.log(error);
  });
