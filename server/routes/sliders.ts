import { RequestHandler } from 'express';
import { Slider } from '../models/Slider';

export const getSliders: RequestHandler = async (req, res) => {
  try {
    const sliders = await Slider.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json(sliders);
  } catch (error) {
    console.error('Get sliders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllSliders: RequestHandler = async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ order: 1, createdAt: -1 });
    res.json(sliders);
  } catch (error) {
    console.error('Get all sliders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createSlider: RequestHandler = async (req, res) => {
  try {
    const { title, imageUrl, order } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    const slider = new Slider({
      title,
      imageUrl,
      order: order || 0
    });

    await slider.save();
    res.status(201).json(slider);
  } catch (error) {
    console.error('Create slider error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateSlider: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const slider = await Slider.findByIdAndUpdate(id, updates, { new: true });
    
    if (!slider) {
      return res.status(404).json({ message: 'Slider not found' });
    }

    res.json(slider);
  } catch (error) {
    console.error('Update slider error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteSlider: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const slider = await Slider.findByIdAndDelete(id);
    
    if (!slider) {
      return res.status(404).json({ message: 'Slider not found' });
    }

    res.json({ message: 'Slider deleted successfully' });
  } catch (error) {
    console.error('Delete slider error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
