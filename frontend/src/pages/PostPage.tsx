import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postAPI, commentAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Post, Comment } from '../types';
import { Avatar, timeAgo } from '../components/PostCard';

const CommentItem: React.FC<{ comment: Comment; postId: string; onRefresh: () => void; depth?: number }> = ({ comment, postId, onRefresh, depth = 0 }) => {
  const { user } = useAuth();
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [likeCount, setLikeCount] = useState(comment.likes?.length || 0);
  const [liked, setLiked] = useState(comment.likes?.includes(user?._id || '') || false);
  const [sending, setSending] = useState(false);

  const handleLike = async () => {
    try {
      const { data } = await commentAPI.like(comment._id);
      setLikeCount(data.likes.length);
      setLiked(data.liked);
    } catch {}
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await commentAPI.create(postId, { content: replyText.trim(), parentComment: comment._id });
      setReplyText(''); setReplyOpen(false); onRefresh();
    } catch {} finally { setSending(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    try { await commentAPI.delete(comment._id); onRefresh(); } catch {}
  };

  return (
    <div style={{ paddingLeft: depth > 0 ? 32 : 0 }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 4, animation: 'fadeIn 0.3s ease' }}>
        <Avatar user={comment.author} size={30} />
        <div style={{ flex: 1 }}>
          <div style={{ background: 'var(--surface2)', borderRadius: '4px 14px 14px 14px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{comment.author?.username}</span>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{timeAgo(comment.createdAt)}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{comment.content}</p>
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 4, paddingLeft: 4 }}>
            <button onClick={handleLike} style={{ fontSize: 12, color: liked ? 'var(--pink)' : 'var(--text3)', background: 'none', padding: '2px 8px', borderRadius: 6 }}>
              {liked ? '❤️' : '🤍'} {likeCount > 0 && likeCount}
            </button>
            {depth === 0 && (
              <button onClick={() => setReplyOpen(!replyOpen)} style={{ fontSize: 12, color: 'var(--text3)', background: 'none', padding: '2px 8px', borderRadius: 6 }}>
                💬 Reply
              </button>
            )}
            {comment.author?._id === user?._id && (
              <button onClick={handleDelete} style={{ fontSize: 12, color: 'var(--red)', background: 'none', padding: '2px 8px', borderRadius: 6 }}>
                🗑
              </button>
            )}
          </div>
          {replyOpen && (
            <form onSubmit={handleReply} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply..."
                style={{ flex: 1, padding: '8px 12px', borderRadius: 10, fontSize: 13, background: 'var(--bg)', border: '1px solid var(--border2)', color: 'var(--text)' }} />
              <button type="submit" disabled={sending} style={{ padding: '8px 14px', borderRadius: 10, background: 'var(--accent3)', color: 'white', fontSize: 12, fontWeight: 500 }}>
                {sending ? '...' : 'Reply'}
              </button>
            </form>
          )}
        </div>
      </div>
      {comment.replies?.length > 0 && (
        <div style={{ marginTop: 4 }}>
          {comment.replies.map((reply: any) => (
            <CommentItem key={reply._id} comment={reply} postId={postId} onRefresh={onRefresh} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [likes, setLikes] = useState<string[]>([]);
  const [liked, setLiked] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPost = async () => {
    try { const { data } = await postAPI.getOne(id!); setPost(data); setLikes(data.likes); setLiked(data.likes?.includes(user?._id)); }
    catch { navigate('/'); } finally { setLoading(false); }
  };

  const fetchComments = async () => {
    try { const { data } = await commentAPI.getAll(id!); setComments(data); } catch {}
  };

  useEffect(() => { fetchPost(); fetchComments(); }, [id]);

  const handleLike = async () => {
    try { const { data } = await postAPI.like(id!); setLikes(data.likes); setLiked(data.liked); } catch {}
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSending(true);
    try { await commentAPI.create(id!, { content: newComment.trim() }); setNewComment(''); fetchComments(); }
    catch {} finally { setSending(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );
  if (!post) return null;

  const isOwner = user?._id === post.author?._id;

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: 620, 
      margin: '0 auto', 
      padding: 'clamp(16px, 4vw, 32px) clamp(12px, 3vw, 20px)' 
    }}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text3)', background: 'none', fontSize: 13, marginBottom: 24, padding: '8px 0' }}>
        ← Back
      </button>

      <article style={{ background: 'var(--surface)', borderRadius: 24, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 24, animation: 'fadeIn 0.4s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            onClick={() => navigate(`/profile/${post.author._id}`)}>
            <Avatar user={post.author} size={44} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>@{post.author?.username}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                {new Date(post.createdAt).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>
          {isOwner && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => navigate(`/edit/${post._id}`)} style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text2)', fontSize: 12 }}>
                ✏️ Edit
              </button>
              <button onClick={async () => { if (window.confirm('Delete this post?')) { await postAPI.delete(post._id); navigate('/'); } }}
                style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid rgba(232,120,120,0.3)', background: 'transparent', color: 'var(--red)', fontSize: 12 }}>
                🗑 Delete
              </button>
            </div>
          )}
        </div>

        {/* Image — fixed: removed localhost:5000 prefix */}
        {post.image && (
          <img src={post.image} alt={post.title} style={{ width: '100%', maxHeight: 480, objectFit: 'cover', display: 'block' }} />
        )}

        <div style={{ padding: '24px 24px 16px' }}>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 28, fontWeight: 700, lineHeight: 1.3, marginBottom: 16, color: 'var(--text)' }}>
            {post.title}
          </h1>
          {post.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
              {post.tags.map(tag => (
                <span key={tag} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(200,168,233,0.1)', color: 'var(--accent)', border: '1px solid rgba(200,168,233,0.2)' }}>#{tag}</span>
              ))}
            </div>
          )}
          <div style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{post.content}</div>
        </div>

        <div style={{ display: 'flex', gap: 4, padding: '12px 16px 18px', borderTop: '1px solid var(--border)' }}>
          <button onClick={handleLike} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12,
            background: liked ? 'rgba(232,137,184,0.12)' : 'var(--bg)', border: `1px solid ${liked ? 'rgba(232,137,184,0.3)' : 'var(--border)'}`,
            color: liked ? 'var(--pink)' : 'var(--text3)', fontSize: 14, fontWeight: liked ? 600 : 400, transition: 'all 0.2s'
          }}>
            <span style={{ fontSize: 18 }}>{liked ? '❤️' : '🤍'}</span>
            {likes.length} {likes.length === 1 ? 'like' : 'likes'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', color: 'var(--text3)', fontSize: 14 }}>
            <span style={{ fontSize: 18 }}>💬</span> {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </div>
        </div>
      </article>

      <div style={{ background: 'var(--surface)', borderRadius: 24, border: '1px solid var(--border)', padding: '20px', animation: 'fadeIn 0.5s ease' }}>
        <h3 style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 600, marginBottom: 20, color: 'var(--text)' }}>
          Comments ({comments.length})
        </h3>
        <form onSubmit={handleComment} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <Avatar user={user} size={36} />
          <div style={{ flex: 1, display: 'flex', gap: 8 }}>
            <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Share your thoughts..."
              style={{ flex: 1, padding: '10px 14px', borderRadius: 12, fontSize: 14, background: 'var(--bg)', border: '1px solid var(--border2)', color: 'var(--text)' }} />
            <button type="submit" disabled={sending || !newComment.trim()} style={{
              padding: '10px 18px', borderRadius: 12, background: 'linear-gradient(135deg, var(--accent2), var(--accent3))',
              color: 'white', fontSize: 13, fontWeight: 600, opacity: !newComment.trim() ? 0.5 : 1, cursor: !newComment.trim() ? 'not-allowed' : 'pointer'
            }}>
              {sending ? '...' : 'Post'}
            </button>
          </div>
        </form>
        {comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text3)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>💭</div>
            <div>Be the first to comment</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {comments.map(comment => (
              <CommentItem key={comment._id} comment={comment} postId={id!} onRefresh={fetchComments} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostPage;