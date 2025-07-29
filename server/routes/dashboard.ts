import { RequestHandler } from 'express';
import { User } from '../models/User';
import { Coordinate } from '../models/Coordinate';
import { Slider } from '../models/Slider';
import { Feedback } from '../models/Feedback';

export const getDashboardStats: RequestHandler = async (req, res) => {
  try {
    const [userCount, coordinateCount, sliderCount, feedbackCount] = await Promise.all([
      User.countDocuments(),
      Coordinate.countDocuments(),
      Slider.countDocuments(),
      Feedback.countDocuments()
    ]);

    res.json({
      totalUsers: userCount,
      totalCoordinates: coordinateCount,
      totalSliders: sliderCount,
      totalFeedbacks: feedbackCount
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
