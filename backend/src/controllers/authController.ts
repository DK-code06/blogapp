import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const signToken = (userId: string) =>
  jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) { res.status(400).json({ message: 'User already exists' }); return; }
    const user = await User.create({ username, email, password });
    const token = signToken(String(user._id));
    res.status(201).json({ token, user: { _id: user._id, username: user.username, email: user.email, avatar: user.avatar, bio: user.bio } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Invalid credentials' }); return;
    }
    const token = signToken(String(user._id));
    res.json({ token, user: { _id: user._id, username: user.username, email: user.email, avatar: user.avatar, bio: user.bio, followers: user.followers, following: user.following } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-password').populate('followers', 'username avatar').populate('following', 'username avatar');
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
