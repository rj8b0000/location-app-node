import { RequestHandler } from "express";
import { Feedback } from "../models/Feedback";

export const getFeedbacks: RequestHandler = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("userId", "fullName mobileNumber")
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    console.error("Get feedbacks error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createFeedback: RequestHandler = async (req, res) => {
  try {
    const { userName, message } = req.body;

    if (!userName?.trim() || !message?.trim()) {
      return res
        .status(400)
        .json({ message: "User name and message are required" });
    }

    const feedback = await Feedback.create({
      userName: userName.trim(),
      message: message.trim(),
      userId: req.user?.id,
    });
    console.log("Feedback Object: ", feedback);
    // Populate user data
    await feedback.populate("userId");

    res.status(201).json(feedback);
  } catch (error) {
    console.error("Create feedback error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const deleteFeedback: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByIdAndDelete(id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Delete feedback error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
