import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { User } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.header("Authorization");
    console.log("Auth header:", authHeader);

    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      console.log("No token provided");
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    console.log("Verifying token...");
    const decoded = verifyToken(token);
    console.log("Token decoded:", decoded);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      console.log("User not found for token");
      return res.status(401).json({ message: "User not found" });
    }

    console.log("Authentication successful for user:", user.fullName);
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
