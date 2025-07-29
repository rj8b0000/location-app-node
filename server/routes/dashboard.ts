import { RequestHandler } from 'express';
import { User } from '../models/User';
import { Coordinate } from '../models/Coordinate';
import { Slider } from '../models/Slider';
import { Feedback } from '../models/Feedback';
import { Content } from '../models/Content';

export const getDashboardStats: RequestHandler = async (req, res) => {
  try {
    const [userCount, coordinateCount, sliderCount, feedbackCount, contentCount] = await Promise.all([
      User.countDocuments(),
      Coordinate.countDocuments(),
      Slider.countDocuments(),
      Feedback.countDocuments(),
      Content.countDocuments()
    ]);

    res.json({
      totalUsers: userCount,
      totalCoordinates: coordinateCount,
      totalSliders: sliderCount,
      totalFeedbacks: feedbackCount,
      totalContent: contentCount
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
