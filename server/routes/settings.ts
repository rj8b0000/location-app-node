import { RequestHandler } from 'express';
import { Settings } from '../models/Settings';

export const getSettings: RequestHandler = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings({});
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateSettings: RequestHandler = async (req, res) => {
  try {
    const updates = req.body;

    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings(updates);
    } else {
      Object.assign(settings, updates);
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStatisticsLink: RequestHandler = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json({ 
      statisticsLink: settings?.statisticsLink || null 
    });
  } catch (error) {
    console.error('Get statistics link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
