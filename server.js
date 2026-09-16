const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const path = require("path");

require("dotenv").config();

// =====================================================
// DATABASE
// =====================================================

const connectDB = require("./config/db");

// =====================================================
// SOCKET
// =====================================================

const setupVideoSocket = require("./socket/videoSocket");

// =====================================================
// ROUTES
// =====================================================

const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");

// =====================================================
// DNS
// =====================================================

dns.setServers([
  "8.8.8.8",
  "8.8.4.4",
]);

// =====================================================
// EXPRESS APP
// =====================================================

const app = express();

// =====================================================
// HTTP SERVER
// =====================================================

const server = http.createServer(app);

// =====================================================
// ALLOWED FRONTENDS
// =====================================================

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",

  // 🔴 CHANGE THIS TO YOUR ACTUAL VERCEL FRONTEND URL
  "https://YOUR-FRONTEND.vercel.app",
];

// =====================================================
// SOCKET.IO
// =====================================================

const io = new Server(server, {
  path: "/socket.io",

  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },

  transports: ["websocket", "polling"],
});

// =====================================================
// VIDEO SOCKET
// =====================================================

setupVideoSocket(io);

// =====================================================
// CORS
// =====================================================

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
  })
);

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// =====================================================
// UPLOADS
// =====================================================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

// =====================================================
// API ROUTES
// =====================================================

app.use(
  "/api/doctors",
  doctorRoutes
);

app.use(
  "/api/patients",
  patientRoutes
);

app.use(
  "/api/appointments",
  appointmentRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/prescriptions",
  prescriptionRoutes
);

// =====================================================
// PHARMACY ROUTES
// =====================================================

app.use(
  "/api/stores",
  require("./routes/storeRoutes")
);

app.use(
  "/api/medicines",
  require("./routes/medicineRoutes")
);

app.use(
  "/api/categories",
  require("./routes/categoryRoutes")
);

app.use(
  "/api/suppliers",
  require("./routes/supplierRoutes")
);

app.use(
  "/api/sales",
  require("./routes/saleRoutes")
);

app.use(
  "/api/pharmacists",
  require("./routes/pharmacistRoutes")
);

app.use(
  "/api/medicine-orders",
  require("./routes/medicineOrderRoutes")
);

// =====================================================
// HOME / HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
  res.status(200).send(
    "Hospital Backend + Socket.IO is Running"
  );
});

// =====================================================
// SOCKET.IO HEALTH CHECK
// =====================================================

app.get("/socket-health", (req, res) => {
  res.status(200).json({
    success: true,
    socketIO: true,
    message:
      "Socket.IO server is running",
  });
});

// =====================================================
// 404 API HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use(
  (err, req, res, next) => {
    console.error(
      "Express Error:",
      err
    );

    res.status(
      err.status || 500
    ).json({
      success: false,
      message:
        err.message ||
        "Internal Server Error",
    });
  }
);

// =====================================================
// PORT
// =====================================================

const PORT =
  process.env.PORT || 5000;

// =====================================================
// START SERVER
// =====================================================

const startServer = async () => {
  try {
    // -----------------------------------------------
    // MongoDB
    // -----------------------------------------------

    await connectDB();

    console.log(
      "MongoDB connected successfully"
    );

    // -----------------------------------------------
    // HTTP + SOCKET.IO
    // -----------------------------------------------

    server.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          "======================================"
        );

        console.log(
          `Hospital Backend running on port ${PORT}`
        );

        console.log(
          "Socket.IO server is running"
        );

        console.log(
          `Socket path: /socket.io`
        );

        console.log(
          "======================================"
        );
      }
    );

  } catch (error) {

    console.error(
      "======================================"
    );

    console.error(
      "Server Startup Error:",
      error.message
    );

    console.error(
      "======================================"
    );

    process.exit(1);
  }
};

startServer();