import { RequestHandler } from 'express';
import { Content } from '../models/Content';

export const getContents: RequestHandler = async (req, res) => {
  try {
    const contents = await Content.find().sort({ order: 1, createdAt: -1 });
    res.json(contents);
  } catch (error) {
    console.error('Get contents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getActiveContents: RequestHandler = async (req, res) => {
  try {
    const contents = await Content.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json(contents);
  } catch (error) {
    console.error('Get active contents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createContent: RequestHandler = async (req, res) => {
  try {
    const { title, content, order } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Validate word count
    const wordCount = content.trim().split(/\s+/).filter((word: string) => word.length > 0).length;
    if (wordCount > 30) {
      return res.status(400).json({ message: 'Content cannot exceed 30 words' });
    }

    const newContent = new Content({
      title,
      content,
      order: order || 0
    });

    await newContent.save();
    res.status(201).json(newContent);
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateContent: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate word count if content is being updated
    if (updates.content) {
      const wordCount = updates.content.trim().split(/\s+/).filter((word: string) => word.length > 0).length;
      if (wordCount > 30) {
        return res.status(400).json({ message: 'Content cannot exceed 30 words' });
      }
    }

    const content = await Content.findByIdAndUpdate(id, updates, { new: true });
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json(content);
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteContent: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const content = await Content.findByIdAndDelete(id);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
