import { Response } from 'express';
import Comment from '../models/Comment';
import { AuthRequest } from '../middleware/auth';

export const getComments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const comments = await Comment.find({ post: req.params.postId, parentComment: null })
      .populate('author', 'username avatar')
      .populate({ path: 'replies', populate: { path: 'author', select: 'username avatar' } })
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
};

export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, parentComment } = req.body;
    const comment = await Comment.create({ post: req.params.postId, author: req.userId, content, parentComment: parentComment || null });
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, { $push: { replies: comment._id } });
    }
    await comment.populate('author', 'username avatar');
    res.status(201).json(comment);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
};

export const likeComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) { res.status(404).json({ message: 'Comment not found' }); return; }
    const userId = req.userId as any;
    const liked = comment.likes.includes(userId);
    if (liked) comment.likes = comment.likes.filter(id => String(id) !== req.userId);
    else comment.likes.push(userId);
    await comment.save();
    res.json({ likes: comment.likes, liked: !liked });
  } catch (err: any) { res.status(500).json({ message: err.message }); }
};

export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) { res.status(404).json({ message: 'Comment not found' }); return; }
    if (String(comment.author) !== req.userId) { res.status(403).json({ message: 'Unauthorized' }); return; }
    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (err: any) { res.status(500).json({ message: err.message }); }
};
