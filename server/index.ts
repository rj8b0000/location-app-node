import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/database";
import { authenticate, requireAdmin } from "./middleware/auth";

// Route imports
import { register, login, getProfile } from "./routes/auth";
import { getCoordinates, createCoordinate, updateCoordinate, deleteCoordinate, checkLocationInPolygon } from "./routes/coordinates";
import { getSliders, getAllSliders, createSlider, updateSlider, deleteSlider } from "./routes/sliders";
import { getFeedbacks, createFeedback, deleteFeedback } from "./routes/feedback";
import { getSettings, updateSettings, getStatisticsLink } from "./routes/settings";
import { getUsers, createUser, updateUser, deleteUser } from "./routes/users";
import { getDashboardStats } from "./routes/dashboard";

export function createServer() {
  const app = express();

  // Connect to MongoDB
  connectDB();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Server is running!" });
  });

  // Auth routes
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.get("/api/auth/profile", authenticate, getProfile);

  // Dashboard routes
  app.get("/api/dashboard/stats", authenticate, requireAdmin, getDashboardStats);

  // User management routes (admin only)
  app.get("/api/users", authenticate, requireAdmin, getUsers);
  app.post("/api/users", authenticate, requireAdmin, createUser);
  app.put("/api/users/:id", authenticate, requireAdmin, updateUser);
  app.delete("/api/users/:id", authenticate, requireAdmin, deleteUser);

  // Coordinate routes
  app.get("/api/coordinates", authenticate, requireAdmin, getCoordinates);
  app.post("/api/coordinates", authenticate, requireAdmin, createCoordinate);
  app.put("/api/coordinates/:id", authenticate, requireAdmin, updateCoordinate);
  app.delete("/api/coordinates/:id", authenticate, requireAdmin, deleteCoordinate);
  app.post("/api/coordinates/check", authenticate, checkLocationInPolygon);

  // Slider routes
  app.get("/api/sliders", getSliders); // Public endpoint for app
  app.get("/api/admin/sliders", authenticate, requireAdmin, getAllSliders);
  app.post("/api/sliders", authenticate, requireAdmin, createSlider);
  app.put("/api/sliders/:id", authenticate, requireAdmin, updateSlider);
  app.delete("/api/sliders/:id", authenticate, requireAdmin, deleteSlider);

  // Feedback routes
  app.get("/api/feedbacks", authenticate, requireAdmin, getFeedbacks);
  app.post("/api/feedback", authenticate, createFeedback);
  app.delete("/api/feedbacks/:id", authenticate, requireAdmin, deleteFeedback);

  // Settings routes
  app.get("/api/settings", authenticate, requireAdmin, getSettings);
  app.put("/api/settings", authenticate, requireAdmin, updateSettings);
  app.get("/api/statistics-link", getStatisticsLink); // Public endpoint for app

  return app;
}
