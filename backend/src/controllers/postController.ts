import { Response } from 'express';
import Post from '../models/Post';
import { AuthRequest } from '../middleware/auth';

export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, tags } = req.body;
    const image = req.file ? req.file.path : (req.body.image || '');
    const post = await Post.create({ title, content, image, author: req.userId, tags: tags ? JSON.parse(tags) : [] });
    await post.populate('author', 'username avatar');
    res.status(201).json(post);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
};

export const getPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const feed = req.query.feed === 'true';
    let query: any = {};
    if (feed && req.userId) {
      const User = (await import('../models/User')).default;
      const user = await User.findById(req.userId);
      if (user) query.author = { $in: [...user.following, req.userId] };
    }
    const posts = await Post.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('author', 'username avatar');
    const total = await Post.countDocuments(query);
    res.json({ posts, total, pages: Math.ceil(total / limit) });
  } catch (err: any) { res.status(500).json({ message: err.message }); }
};

export const getPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username avatar bio followers following');
    if (!post) { res.status(404).json({ message: 'Post not found' }); return; }
    res.json(post);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
};

export const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) { res.status(404).json({ message: 'Post not found' }); return; }
    if (String(post.author) !== req.userId) { res.status(403).json({ message: 'Unauthorized' }); return; }
    const { title, content, tags } = req.body;
    const image = req.file ? req.file.path : (req.body.image || post.image);
    const updated = await Post.findByIdAndUpdate(req.params.id, { title, content, image, tags: tags ? JSON.parse(tags) : post.tags }, { new: true }).populate('author', 'username avatar');
    res.json(updated);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
};

export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) { res.status(404).json({ message: 'Post not found' }); return; }
    if (String(post.author) !== req.userId) { res.status(403).json({ message: 'Unauthorized' }); return; }
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err: any) { res.status(500).json({ message: err.message }); }
};

export const likePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) { res.status(404).json({ message: 'Post not found' }); return; }
    const userId = req.userId as any;
    const liked = post.likes.includes(userId);
    if (liked) post.likes = post.likes.filter(id => String(id) !== req.userId);
    else post.likes.push(userId);
    await post.save();
    res.json({ likes: post.likes, liked: !liked });
  } catch (err: any) { res.status(500).json({ message: err.message }); }
};

export const getUserPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const posts = await Post.find({ author: req.params.userId }).sort({ createdAt: -1 }).populate('author', 'username avatar');
    res.json(posts);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
};
