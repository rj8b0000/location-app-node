import { RequestHandler } from "express";
import { User } from "../models/User";
import { generateToken } from "../utils/jwt";

export const register: RequestHandler = async (req, res) => {
  try {
    const { fullName, mobileNumber, password } = req.body;

    if (!fullName || !mobileNumber || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const existingUser = await User.findOne({ mobileNumber });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this mobile number" });
    }

    const user = new User({ fullName, mobileNumber, password });
    await user.save();

    const token = generateToken(user._id as string);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    if (!mobileNumber || !password) {
      return res
        .status(400)
        .json({ message: "Please provide mobile number and password" });
    }

    const user = await User.findOne({ mobileNumber });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id as string);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const createAdmin: RequestHandler = async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ mobileNumber: "123456789" });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ message: "Admin user already exists" });
    }

    // Create admin user with specified credentials
    const adminUser = new User({
      fullName: "Admin User",
      mobileNumber: "123456789",
      password: "admin@123",
      role: "admin"
    });

    await adminUser.save();

    const token = generateToken(adminUser._id as string);

    res.status(201).json({
      message: "Admin user created successfully",
      token,
      user: {
        id: adminUser._id,
        fullName: adminUser.fullName,
        mobileNumber: adminUser.mobileNumber,
        role: adminUser.role,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ message: "Server error during admin creation" });
  }
};

export const getProfile: RequestHandler = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
