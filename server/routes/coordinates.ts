import { RequestHandler } from "express";
import { Coordinate } from "../models/Coordinate";

// Helper function to ensure polygon is properly closed
const ensurePolygonClosed = (coordinates: number[][][]): number[][][] => {
  return coordinates.map((ring) => {
    if (ring.length < 3) {
      throw new Error("A polygon ring must have at least 3 coordinates");
    }

    const first = ring[0];
    const last = ring[ring.length - 1];

    // If not the same, add the first coordinate to the end to close the polygon
    if (first[0] !== last[0] || first[1] !== last[1]) {
      return [...ring, [first[0], first[1]]];
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

  for (const ring of polygon.coordinates) {
    if (!Array.isArray(ring) || ring.length < 3) {
      return false;
    }

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

export const getCoordinates: RequestHandler = async (_req, res) => {
  try {
    const coordinates = await Coordinate.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
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

    // Ensure polygon is closed
    const closedPolygon = {
      ...polygon,
      coordinates: ensurePolygonClosed(polygon.coordinates),
    };

    // Validate polygon structure
    if (!validatePolygon(closedPolygon)) {
      return res.status(400).json({
        message:
          "Invalid polygon format. Must be a valid GeoJSON Polygon with proper coordinate structure.",
      });
    }

    // Make all existing coordinates inactive
    await Coordinate.updateMany(
      { isActive: true },
      { $set: { isActive: false } },
    );

    // Create new active coordinate
    const coordinate = await Coordinate.create({
      name,
      description,
      polygon: closedPolygon,
      isActive: true,
    });

    res.status(201).json(coordinate);
  } catch (error) {
    console.error("Create coordinate error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({
      message: "Failed to create coordinate",
      error: errorMessage,
    });
  }
};

export const updateCoordinate: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.polygon) {
      try {
        updates.polygon = {
          ...updates.polygon,
          coordinates: ensurePolygonClosed(updates.polygon.coordinates),
        };

        if (!validatePolygon(updates.polygon)) {
          return res.status(400).json({
            message:
              "Invalid polygon format. Must be a valid GeoJSON Polygon with proper coordinate structure.",
          });
        }
      } catch (error) {
        return res.status(400).json({
          message:
            error instanceof Error ? error.message : "Invalid polygon format",
        });
      }
    }

    const coordinate = await Coordinate.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true },
    ).exec();

    if (!coordinate) {
      return res.status(404).json({ message: "Coordinate not found" });
    }

    res.json(coordinate);
  } catch (error) {
    console.error("Update coordinate error:", error);
    res.status(500).json({
      message: "Failed to update coordinate",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteCoordinate: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const coordinate = await Coordinate.findById(id);

    if (!coordinate) {
      return res.status(404).json({ message: "Coordinate not found" });
    }

    const wasActive = coordinate.isActive;

    await Coordinate.deleteOne({ _id: id });

    if (wasActive) {
      const mostRecent = await Coordinate.findOne().sort({ createdAt: -1 });

      if (mostRecent) {
        mostRecent.isActive = true;
        await mostRecent.save();
      }
    }

    res.json({ message: "Coordinate deleted successfully" });
  } catch (error) {
    console.error("Delete coordinate error:", error);
    res.status(500).json({
      message: "Failed to delete coordinate",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const checkLocationInPolygon: RequestHandler = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res
        .status(400)
        .json({ message: "Latitude and longitude are required as numbers" });
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

// import { RequestHandler } from "express";
// import { Coordinate } from "../models/Coordinate";
// import { Types } from "mongoose";

// // Helper function to ensure polygon is properly closed
// const ensurePolygonClosed = (coordinates: number[][][]): number[][][] => {
//   return coordinates.map((ring) => {
//     if (ring.length < 3) {
//       throw new Error("A polygon ring must have at least 3 coordinates");
//     }

//     // Check if first and last coordinates are the same
//     const first = ring[0];
//     const last = ring[ring.length - 1];

//     // If not the same, add the first coordinate to the end to close the polygon
//     if (first[0] !== last[0] || first[1] !== last[1]) {
//       return [...ring, [first[0], first[1]]];
//     }

//     return ring;
//   });
// };

// // Helper function to validate polygon structure
// const validatePolygon = (polygon: any): boolean => {
//   if (!polygon || polygon.type !== "Polygon") {
//     return false;
//   }

//   if (!Array.isArray(polygon.coordinates) || polygon.coordinates.length === 0) {
//     return false;
//   }

//   // Check each ring has at least 4 points (including the closing point)
//   for (const ring of polygon.coordinates) {
//     if (!Array.isArray(ring) || ring.length < 3) {
//       return false;
//     }

//     // Check each coordinate is a valid [lng, lat] pair
//     for (const coord of ring) {
//       if (
//         !Array.isArray(coord) ||
//         coord.length !== 2 ||
//         typeof coord[0] !== "number" ||
//         typeof coord[1] !== "number"
//       ) {
//         return false;
//       }
//     }
//   }

//   return true;
// };

// export const getCoordinates: RequestHandler = async (req, res) => {
//   try {
//     const coordinates = await Coordinate.find({ isActive: true })
//       .sort({ createdAt: -1 })
//       .lean()
//       .exec();
//     res.json(coordinates);
//   } catch (error) {
//     console.error("Get coordinates error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const createCoordinate: RequestHandler = async (req, res) => {
//   const session = await Coordinate.startSession();
//   session.startTransaction();

//   try {
//     const { name, description, polygon } = req.body;

//     if (!name || !polygon) {
//       await session.abortTransaction();
//       return res.status(400).json({ message: "Name and polygon are required" });
//     }

//     try {
//       // Ensure polygon is closed (first and last coordinates are the same)
//       const closedPolygon = {
//         ...polygon,
//         coordinates: ensurePolygonClosed(polygon.coordinates),
//       };

//       // Validate polygon structure
//       if (!validatePolygon(closedPolygon)) {
//         await session.abortTransaction();
//         return res.status(400).json({
//           message:
//             "Invalid polygon format. Must be a valid GeoJSON Polygon with proper coordinate structure.",
//         });
//       }

//       // Set all existing coordinates to isActive: false
//       await Coordinate.updateMany(
//         { isActive: true },
//         { $set: { isActive: false } },
//         { session },
//       );

//       // Create new active coordinate
//       const coordinate = new Coordinate({
//         name,
//         description,
//         polygon: closedPolygon,
//         isActive: true,
//       });

//       await coordinate.save({ session });
//       await session.commitTransaction();

//       res.status(201).json(coordinate);
//     } catch (error) {
//       await session.abortTransaction();
//       throw error;
//     }
//   } catch (error) {
//     console.error("Create coordinate error:", error);
//     const errorMessage =
//       error instanceof Error ? error.message : "Unknown error occurred";
//     res.status(500).json({
//       message: "Failed to create coordinate",
//       error: errorMessage,
//     });
//   } finally {
//     await session.endSession();
//   }
// };

// export const updateCoordinate: RequestHandler = async (req, res) => {
//   const session = await Coordinate.startSession();
//   session.startTransaction();

//   try {
//     const { id } = req.params;
//     const updates = req.body;

//     // If polygon is being updated, validate and ensure it's closed
//     if (updates.polygon) {
//       try {
//         updates.polygon = {
//           ...updates.polygon,
//           coordinates: ensurePolygonClosed(updates.polygon.coordinates),
//         };

//         if (!validatePolygon(updates.polygon)) {
//           await session.abortTransaction();
//           return res.status(400).json({
//             message:
//               "Invalid polygon format. Must be a valid GeoJSON Polygon with proper coordinate structure.",
//           });
//         }
//       } catch (error) {
//         await session.abortTransaction();
//         return res.status(400).json({
//           message:
//             error instanceof Error ? error.message : "Invalid polygon format",
//         });
//       }
//     }

//     const coordinate = await Coordinate.findByIdAndUpdate(
//       id,
//       { ...updates, updatedAt: new Date() },
//       { new: true, session },
//     ).exec();

//     if (!coordinate) {
//       await session.abortTransaction();
//       return res.status(404).json({ message: "Coordinate not found" });
//     }

//     await session.commitTransaction();
//     res.json(coordinate);
//   } catch (error) {
//     await session.abortTransaction();
//     console.error("Update coordinate error:", error);
//     res.status(500).json({
//       message: "Failed to update coordinate",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   } finally {
//     await session.endSession();
//   }
// };

// export const deleteCoordinate: RequestHandler = async (req, res) => {
//   const session = await Coordinate.startSession();
//   session.startTransaction();

//   try {
//     const { id } = req.params;

//     // First find the coordinate to check if it's active
//     const coordinate = await Coordinate.findById(id).session(session);

//     if (!coordinate) {
//       await session.abortTransaction();
//       return res.status(404).json({ message: "Coordinate not found" });
//     }

//     const wasActive = coordinate.isActive;

//     // Delete the coordinate
//     await Coordinate.deleteOne({ _id: id }).session(session);

//     // If the deleted coordinate was active, make the most recent one active
//     if (wasActive) {
//       const mostRecent = await Coordinate.findOne()
//         .sort({ createdAt: -1 })
//         .session(session);

//       if (mostRecent) {
//         mostRecent.isActive = true;
//         await mostRecent.save({ session });
//       }
//     }

//     await session.commitTransaction();
//     res.json({ message: "Coordinate deleted successfully" });
//   } catch (error) {
//     await session.abortTransaction();
//     console.error("Delete coordinate error:", error);
//     res.status(500).json({
//       message: "Failed to delete coordinate",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   } finally {
//     await session.endSession();
//   }
// };

// export const checkLocationInPolygon: RequestHandler = async (req, res) => {
//   try {
//     const { latitude, longitude } = req.body;

//     if (!latitude || !longitude) {
//       return res
//         .status(400)
//         .json({ message: "Latitude and longitude are required" });
//     }

//     const point = {
//       type: "Point",
//       coordinates: [longitude, latitude],
//     };

//     const matchingCoordinates = await Coordinate.find({
//       polygon: {
//         $geoIntersects: {
//           $geometry: point,
//         },
//       },
//       isActive: true,
//     });

//     res.json({
//       isInside: matchingCoordinates.length > 0,
//       matchingAreas: matchingCoordinates,
//     });
//   } catch (error) {
//     console.error("Check location error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
