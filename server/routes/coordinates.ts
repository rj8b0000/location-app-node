import { RequestHandler } from "express";
import { Coordinate } from "../models/Coordinate";

// Helper function to ensure polygon is closed (first and last coordinates are the same)
const ensurePolygonClosed = (coordinates: number[][][]): number[][][] => {
  return coordinates.map((ring) => {
    if (ring.length === 0) return ring;

    const firstPoint = ring[0];
    const lastPoint = ring[ring.length - 1];

    // Check if first and last points are the same
    if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
      // Add the first point to the end to close the polygon
      return [...ring, firstPoint];
    }

    return ring;
  });
};

// Helper function to validate polygon structure
const validatePolygon = (polygon: any): boolean => {
  if (!polygon || polygon.type !== "Polygon") {
    return false;
  }

  if (!Array.isArray(polygon.coordinates) || polygon.coordinates.length === 0) {
    return false;
  }

  // Check each ring has at least 4 points (including the closing point)
  for (const ring of polygon.coordinates) {
    if (!Array.isArray(ring) || ring.length < 3) {
      return false;
    }

    // Check each coordinate is a valid [lng, lat] pair
    for (const coord of ring) {
      if (
        !Array.isArray(coord) ||
        coord.length !== 2 ||
        typeof coord[0] !== "number" ||
        typeof coord[1] !== "number"
      ) {
        return false;
      }
    }
  }

  return true;
};

export const getCoordinates: RequestHandler = async (req, res) => {
  try {
    const coordinates = await Coordinate.find({ isActive: true }).sort({
      createdAt: -1,
    });
    res.json(coordinates);
  } catch (error) {
    console.error("Get coordinates error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createCoordinate: RequestHandler = async (req, res) => {
  try {
    const { name, description, polygon } = req.body;

    if (!name || !polygon) {
      return res.status(400).json({ message: "Name and polygon are required" });
    }

    // Validate polygon structure
    if (!validatePolygon(polygon)) {
      return res.status(400).json({
        message:
          "Invalid polygon format. Must be a valid GeoJSON Polygon with proper coordinate structure.",
      });
    }

    // Ensure polygon is closed (first and last coordinates are the same)
    const closedPolygon = {
      ...polygon,
      coordinates: ensurePolygonClosed(polygon.coordinates),
    };

    // Start a session for transaction
    const session = await Coordinate.startSession();
    session.startTransaction();

    try {
      // Set all existing coordinates to isActive: false
      await Coordinate.updateMany(
        { isActive: true },
        { $set: { isActive: false } },
        { session },
      );

      // Create new active coordinate
      const coordinate = new Coordinate({
        name,
        description,
        polygon: closedPolygon,
        isActive: true,
      });

      await coordinate.save({ session });
      await session.commitTransaction();

      res.status(201).json(coordinate);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.log("Create coordinate error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCoordinate: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If polygon is being updated, validate and ensure it's closed
    if (updates.polygon) {
      if (!validatePolygon(updates.polygon)) {
        return res.status(400).json({
          message:
            "Invalid polygon format. Must be a valid GeoJSON Polygon with proper coordinate structure.",
        });
      }

      // Ensure polygon is closed
      updates.polygon = {
        ...updates.polygon,
        coordinates: ensurePolygonClosed(updates.polygon.coordinates),
      };
    }

    const coordinate = await Coordinate.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!coordinate) {
      return res.status(404).json({ message: "Coordinate not found" });
    }

    res.json(coordinate);
  } catch (error) {
    console.error("Update coordinate error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteCoordinate: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const coordinate = await Coordinate.findByIdAndDelete(id);

    if (!coordinate) {
      return res.status(404).json({ message: "Coordinate not found" });
    }

    res.json({ message: "Coordinate deleted successfully" });
  } catch (error) {
    console.error("Delete coordinate error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkLocationInPolygon: RequestHandler = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude are required" });
    }

    const point = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    const matchingCoordinates = await Coordinate.find({
      polygon: {
        $geoIntersects: {
          $geometry: point,
        },
      },
      isActive: true,
    });

    res.json({
      isInside: matchingCoordinates.length > 0,
      matchingAreas: matchingCoordinates,
    });
  } catch (error) {
    console.error("Check location error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
