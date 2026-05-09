import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('followers', 'username avatar').populate('following', 'username avatar');
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.json(user);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bio, username } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : req.body.avatar;
    const updates: any = {};
    if (bio !== undefined) updates.bio = bio;
    if (username) updates.username = username;
    if (avatar) updates.avatar = avatar;
    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
};

export const followUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.params.id === req.userId) { res.status(400).json({ message: 'Cannot follow yourself' }); return; }
    const target = await User.findById(req.params.id);
    const me = await User.findById(req.userId);
    if (!target || !me) { res.status(404).json({ message: 'User not found' }); return; }
    const isFollowing = me.following.includes(target._id as any);
    if (isFollowing) {
      me.following = me.following.filter(id => String(id) !== req.params.id);
      target.followers = target.followers.filter(id => String(id) !== req.userId);
    } else {
      me.following.push(target._id as any);
      target.followers.push(me._id as any);
    }
    await me.save(); await target.save();
    res.json({ following: !isFollowing, followersCount: target.followers.length });
  } catch (err: any) { res.status(500).json({ message: err.message }); }
};

export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const q = req.query.q as string;
    if (!q) { res.json([]); return; }
    const users = await User.find({ username: { $regex: q, $options: 'i' } }).select('username avatar bio followers').limit(20);
    res.json(users);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
};
