import { RequestHandler } from "express";
import { Settings } from "../models/Settings";
import multer from "multer";
import path from "path";
import fs from "fs";

export const getSettings: RequestHandler = async (req, res) => {
  try {
    let settings = await Settings.findOne({}).exec();

    if (!settings) {
      settings = new Settings({});
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateSettings: RequestHandler = async (req, res) => {
  try {
    const updates = req.body;

    let settings = await Settings.findOne({}).exec();

    if (!settings) {
      settings = new Settings(updates);
    } else {
      Object.assign(settings, updates);
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getStatisticsLink: RequestHandler = async (req, res) => {
  try {
    const settings = await Settings.findOne().exec();
    res.json({
      statisticsLink: settings?.statisticsLink || null,
    });
  } catch (error) {
    console.error("Get statistics link error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getYtVideoLink: RequestHandler = async (req, res) => {
  try {
    const settings = await Settings.findOne().exec();
    res.json({
      ytvideoLink: settings?.ytvideoLink || null,
    });
  } catch (error) {
    console.error("Get ytvideo link error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const uploadSplashImage: RequestHandler = async (req, res) => {
  try {
    const { splashImageUrl } = req.body;

    if (!splashImageUrl) {
      return res.status(400).json({ message: "Splash image URL is required" });
    }

    let settings = await Settings.findOne({}).exec();

    if (!settings) {
      settings = new Settings({ splashImageUrl });
    } else {
      settings.splashImageUrl = splashImageUrl;
    }

    await settings.save();
    res.status(201).json({
      message: "Splash image uploaded successfully",
      splashImageUrl: settings.splashImageUrl,
    });
  } catch (error) {
    console.error("Upload splash image error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getSplashImage: RequestHandler = async (req, res) => {
  try {
    const settings = await Settings.findOne().exec();
    res.json({
      splashImageUrl: settings?.splashImageUrl || null,
    });
  } catch (error) {
    console.error("Get splash image error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLocalSplashImage: RequestHandler = async (req, res) => {
  try {
    const settings = await Settings.findOne().exec();
    
    if (!settings?.splashImageUrl) {
      return res.status(404).json({
        message: "No splash image found",
        splashImageUrl: null,
        isLocal: false,
        fileExists: false,
      });
    }

    // Check if the splash image is a local file
    const isLocalFile = settings.splashImageUrl.startsWith("/uploads/");
    
    if (!isLocalFile) {
      return res.json({
        message: "Splash image is not stored locally",
        splashImageUrl: settings.splashImageUrl,
        isLocal: false,
        fileExists: false,
      });
    }

    // Check if the local file actually exists
    const filePath = path.join(process.cwd(), "public", settings.splashImageUrl);
    const fileExists = fs.existsSync(filePath);
    
    let fileStats = null;
    if (fileExists) {
      try {
        const stats = fs.statSync(filePath);
        fileStats = {
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
        };
      } catch (statsError) {
        console.error("Error getting file stats:", statsError);
      }
    }

    res.json({
      message: fileExists ? "Local splash image found" : "Local splash image file not found on disk",
      splashImageUrl: settings.splashImageUrl,
      isLocal: true,
      fileExists,
      fileStats,
    });
  } catch (error) {
    console.error("Get local splash image error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateSplashImage: RequestHandler = async (req, res) => {
  try {
    const { splashImageUrl } = req.body;

    if (!splashImageUrl) {
      return res.status(400).json({ message: "Splash image URL is required" });
    }

    let settings = await Settings.findOne({}).exec();

    if (!settings) {
      return res
        .status(404)
        .json({
          message: "Settings not found. Please upload a splash image first.",
        });
    }

    settings.splashImageUrl = splashImageUrl;
    await settings.save();

    res.json({
      message: "Splash image updated successfully",
      splashImageUrl: settings.splashImageUrl,
    });
  } catch (error) {
    console.error("Update splash image error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Multer configuration for splash image uploads
const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const splashImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `splash-${uniqueSuffix}${ext}`);
  },
});

const splashImageFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const splashUpload = multer({
  storage: splashImageStorage,
  fileFilter: splashImageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const uploadSplashImageFromLocal: RequestHandler = async (req, res) => {
  try {
    splashUpload.single("splashImageUrl")(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res
              .status(400)
              .json({ message: "File too large. Maximum size is 5MB." });
          }
        }
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      try {
        const imageUrl = `/uploads/${req.file.filename}`;

        let settings = await Settings.findOne({}).exec();

        // Delete old splash image if it exists and is a local file
        if (
          settings?.splashImageUrl &&
          settings.splashImageUrl.startsWith("/uploads/")
        ) {
          const oldImagePath = path.join(
            process.cwd(),
            "public",
            settings.splashImageUrl,
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        if (!settings) {
          settings = new Settings({ splashImageUrl: imageUrl });
        } else {
          settings.splashImageUrl = imageUrl;
        }

        await settings.save();

        res.status(201).json({
          message: "Splash image uploaded successfully",
          splashImageUrl: settings.splashImageUrl,
          filename: req.file.filename,
        });
      } catch (dbError) {
        // If database operation fails, clean up the uploaded file
        if (req.file) {
          const filePath = path.join(uploadsDir, req.file.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
        console.error("Database error during splash image upload:", dbError);
        res.status(500).json({ message: "Server error" });
      }
    });
  } catch (error) {
    console.error("Upload splash image from local error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateSplashImageFromLocal: RequestHandler = async (req, res) => {
  try {
    splashUpload.single("splashImage")(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res
              .status(400)
              .json({ message: "File too large. Maximum size is 5MB." });
          }
        }
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      try {
        let settings = await Settings.findOne({}).exec();

        if (!settings) {
          return res.status(404).json({
            message: "Settings not found. Please upload a splash image first.",
          });
        }

        const newImageUrl = `/uploads/${req.file.filename}`;

        // Delete old splash image if it exists and is a local file
        if (
          settings.splashImageUrl &&
          settings.splashImageUrl.startsWith("/uploads/")
        ) {
          const oldImagePath = path.join(
            process.cwd(),
            "public",
            settings.splashImageUrl,
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        settings.splashImageUrl = newImageUrl;
        await settings.save();

        res.json({
          message: "Splash image updated successfully",
          splashImageUrl: settings.splashImageUrl,
          filename: req.file.filename,
        });
      } catch (dbError) {
        // If database operation fails, clean up the uploaded file
        if (req.file) {
          const filePath = path.join(uploadsDir, req.file.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
        console.error("Database error during splash image update:", dbError);
        res.status(500).json({ message: "Server error" });
      }
    });
  } catch (error) {
    console.error("Update splash image from local error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteSplashImage: RequestHandler = async (req, res) => {
  try {
    let settings = await Settings.findOne({}).exec();

    if (!settings || !settings.splashImageUrl) {
      return res
        .status(404)
        .json({ message: "No splash image found to delete" });
    }

    // Delete the physical file if it's a local upload
    if (settings.splashImageUrl.startsWith("/uploads/")) {
      const imagePath = path.join(
        process.cwd(),
        "public",
        settings.splashImageUrl,
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Remove the splash image URL from settings
    settings.splashImageUrl = undefined;
    await settings.save();

    res.json({
      message: "Splash image deleted successfully",
    });
  } catch (error) {
    console.error("Delete splash image error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
