import React, { useState, useEffect } from 'react';
import { postAPI } from '../utils/api';
import { Post } from '../types';
import PostCard from '../components/PostCard';

const FeedPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'feed' | 'explore'>('explore');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = async (p = 1, feedMode = tab === 'feed') => {
    setLoading(true);
    try {
      const { data } = await postAPI.getAll({ page: p, limit: 10, feed: feedMode });
      if (p === 1) setPosts(data.posts);
      else setPosts(prev => [...prev, ...data.posts]);
      setTotalPages(data.pages);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); fetchPosts(1, tab === 'feed'); }, [tab]);

  const handleDelete = (id: string) => setPosts(p => p.filter(post => post._id !== id));

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: 620, 
      margin: '0 auto', 
      padding: 'clamp(16px, 4vw, 32px) clamp(12px, 3vw, 20px)' 
    }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 32, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>
          {tab === 'feed' ? 'Your Feed' : 'Discover'}
        </h1>
        <div style={{ display: 'flex', gap: 8, background: 'var(--surface)', borderRadius: 14, padding: 5, width: 'fit-content', border: '1px solid var(--border)' }}>
          {(['explore', 'feed'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 22px', borderRadius: 10, fontSize: 13, fontWeight: 500,
              background: tab === t ? 'linear-gradient(135deg, var(--accent2), var(--accent3))' : 'transparent',
              color: tab === t ? 'white' : 'var(--text3)', transition: 'all 0.2s', letterSpacing: '0.2px'
            }}>
              {t === 'explore' ? 'All Posts' : 'Following'}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      {loading && page === 1 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: 'var(--surface)', borderRadius: 20, height: 280, border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
          <div style={{ fontFamily: 'Playfair Display', fontSize: 22, marginBottom: 8, color: 'var(--text2)' }}>
            {tab === 'feed' ? 'Your feed is empty' : 'No posts yet'}
          </div>
          <div style={{ fontSize: 14 }}>
            {tab === 'feed' ? 'Follow some writers to see their posts here' : 'Be the first to share your story'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {posts.map((post, i) => (
            <div key={post._id} style={{ animationDelay: `${i * 0.05}s` }}>
              <PostCard post={post} onDelete={handleDelete} />
            </div>
          ))}
          {page < totalPages && (
            <button onClick={() => { const np = page + 1; setPage(np); fetchPosts(np); }}
              disabled={loading} style={{
                padding: '14px 0', borderRadius: 14, border: '1px solid var(--border2)', background: 'var(--surface)',
                color: 'var(--accent)', fontSize: 14, fontWeight: 500, transition: 'all 0.2s', marginTop: 8
              }}>
              {loading ? 'Loading...' : 'Load more posts'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedPage;
