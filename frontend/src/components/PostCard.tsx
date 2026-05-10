import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../utils/api';
import { Post } from '../types';

const Avatar = ({ user, size = 36 }: { user: any; size?: number }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', background: 'var(--accent3)', flexShrink: 0,
    backgroundImage: user?.avatar ? `url(${user.avatar})` : 'none',
    backgroundSize: 'cover', backgroundPosition: 'center',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.38, fontWeight: 700, color: 'white', border: '2px solid var(--border2)'
  }}>
    {!user?.avatar && user?.username?.[0]?.toUpperCase()}
  </div>
);

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  return new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' });
};

interface PostCardProps {
  post: Post;
  onDelete?: (id: string) => void;
  onUpdate?: (post: Post) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onDelete, onUpdate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [likes, setLikes] = useState(post.likes || []);
  const [liked, setLiked] = useState(post.likes?.includes(user?._id || '') || false);
  const [likeAnim, setLikeAnim] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = user?._id === post.author?._id;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { data } = await postAPI.like(post._id);
      setLikes(data.likes);
      setLiked(data.liked);
      setLikeAnim(true);
      setTimeout(() => setLikeAnim(false), 600);
    } catch {}
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this post?')) return;
    setDeleting(true);
    try { await postAPI.delete(post._id); onDelete?.(post._id); }
    catch {} finally { setDeleting(false); setShowMenu(false); }
  };

  const truncate = (str: string, n: number) => str.length > n ? str.slice(0, n) + '...' : str;

  return (
    <article style={{
      background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)',
      overflow: 'hidden', transition: 'all 0.3s', cursor: 'pointer',
      animation: 'fadeIn 0.4s ease'
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 0', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          onClick={e => { e.stopPropagation(); navigate(`/profile/${post.author._id}`); }}>
          <Avatar user={post.author} size={38} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{post.author?.username}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{timeAgo(post.createdAt)}</div>
          </div>
        </div>
        {isOwner && (
          <div style={{ position: 'relative' }}>
            <button onClick={e => { e.stopPropagation(); setShowMenu(!showMenu); }}
              style={{ background: 'transparent', color: 'var(--text3)', padding: '4px 8px', borderRadius: 8, fontSize: 18, lineHeight: 1 }}>⋯</button>
            {showMenu && (
              <div style={{ position: 'absolute', right: 0, top: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 12, padding: 6, zIndex: 20, minWidth: 140, boxShadow: 'var(--shadow)' }}
                onClick={e => e.stopPropagation()}>
                <button onClick={e => { e.stopPropagation(); navigate(`/edit/${post._id}`); setShowMenu(false); }}
                  style={{ display: 'block', width: '100%', padding: '9px 14px', borderRadius: 8, textAlign: 'left', fontSize: 13, color: 'var(--text2)', background: 'transparent' }}>✏️ Edit</button>
                <button onClick={handleDelete} disabled={deleting}
                  style={{ display: 'block', width: '100%', padding: '9px 14px', borderRadius: 8, textAlign: 'left', fontSize: 13, color: 'var(--red)', background: 'transparent' }}>
                  {deleting ? '...' : '🗑 Delete'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image */}
      {post.image && (
        <div style={{ margin: '12px 0', overflow: 'hidden', cursor: 'pointer' }}
          onClick={() => navigate(`/post/${post._id}`)}>
          <img src={post.image} alt={post.title}
            style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }}
            onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.02)'}
            onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'}
          />
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '10px 16px 4px' }} onClick={() => navigate(`/post/${post._id}`)}>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 8, lineHeight: 1.3 }}>
          {post.title}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 10 }}>
          {truncate(post.content, 160)}
        </p>
        {post.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {post.tags.slice(0, 4).map(tag => (
              <span key={tag} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(200,168,233,0.1)', color: 'var(--accent)', border: '1px solid rgba(200,168,233,0.2)' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px 14px', borderTop: '1px solid var(--border)' }}>
        <button onClick={handleLike} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10,
          background: liked ? 'rgba(232,137,184,0.1)' : 'transparent', color: liked ? 'var(--pink)' : 'var(--text3)',
          fontSize: 13, transition: 'all 0.2s', border: '1px solid transparent',
          animation: likeAnim ? 'heartPop 0.5s ease' : 'none'
        }}>
          <span style={{ fontSize: 16 }}>{liked ? '❤️' : '🤍'}</span>
          {likes.length > 0 && <span style={{ fontWeight: 500 }}>{likes.length}</span>}
        </button>
        <button onClick={() => navigate(`/post/${post._id}`)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10,
          background: 'transparent', color: 'var(--text3)', fontSize: 13, transition: 'all 0.2s'
        }}>
          <span style={{ fontSize: 16 }}>💬</span> Comment
        </button>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text3)' }}>
          {new Date(post.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
    </article>
  );
};

export default PostCard;
export { Avatar, timeAgo };