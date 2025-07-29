import { RequestHandler } from 'express';
import { Coordinate } from '../models/Coordinate';

export const getCoordinates: RequestHandler = async (req, res) => {
  try {
    const coordinates = await Coordinate.find().sort({ createdAt: -1 });
    res.json(coordinates);
  } catch (error) {
    console.error('Get coordinates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createCoordinate: RequestHandler = async (req, res) => {
  try {
    const { name, description, polygon } = req.body;

    if (!name || !polygon) {
      return res.status(400).json({ message: 'Name and polygon are required' });
    }

    const coordinate = new Coordinate({
      name,
      description,
      polygon
    });

    await coordinate.save();
    res.status(201).json(coordinate);
  } catch (error) {
    console.error('Create coordinate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCoordinate: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const coordinate = await Coordinate.findByIdAndUpdate(id, updates, { new: true });
    
    if (!coordinate) {
      return res.status(404).json({ message: 'Coordinate not found' });
    }

    res.json(coordinate);
  } catch (error) {
    console.error('Update coordinate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteCoordinate: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const coordinate = await Coordinate.findByIdAndDelete(id);
    
    if (!coordinate) {
      return res.status(404).json({ message: 'Coordinate not found' });
    }

    res.json({ message: 'Coordinate deleted successfully' });
  } catch (error) {
    console.error('Delete coordinate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const checkLocationInPolygon: RequestHandler = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const point = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };

    const matchingCoordinates = await Coordinate.find({
      polygon: {
        $geoIntersects: {
          $geometry: point
        }
      },
      isActive: true
    });

    res.json({
      isInside: matchingCoordinates.length > 0,
      matchingAreas: matchingCoordinates
    });
  } catch (error) {
    console.error('Check location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
