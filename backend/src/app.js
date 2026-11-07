
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
const tripRoutes = require("./routes/tripRoutes");
const itineraryRoutes = require("./routes/itineraryRoutes");
const collaborationRoutes = require("./routes/collaborationRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const activityRoutes = require("./routes/activityRoutes");
app.use(express.json());
app.use(cookieParser());



app.get("/", (req, res) => {
  res.json({
    message: "TripNest API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/itinerary", itineraryRoutes);
app.use("/api/collaboration", collaborationRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/activity", activityRoutes);
module.exports = app;
