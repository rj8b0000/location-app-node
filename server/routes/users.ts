import { RequestHandler } from 'express';
import { User } from '../models/User';

export const getUsers: RequestHandler = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createUser: RequestHandler = async (req, res) => {
  try {
    const { fullName, mobileNumber, password, role } = req.body;

    if (!fullName || !mobileNumber || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ mobileNumber });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this mobile number' });
    }

    const user = new User({ 
      fullName, 
      mobileNumber, 
      password, 
      role: role || 'user' 
    });
    
    await user.save();

    const userResponse = await User.findById(user._id).select('-password');
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.password) {
      const user = await User.findById(id);
      if (user) {
        user.password = updates.password;
        await user.save();
        const updatedUser = await User.findById(id).select('-password');
        return res.json(updatedUser);
      }
    }

    const user = await User.findByIdAndUpdate(
      id, 
      { $set: updates }, 
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
