import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postAPI, userAPI } from '../utils/api';
import { Post, User } from '../types';
import PostCard from '../components/PostCard';

const ExplorePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'posts' | 'people'>('posts');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await postAPI.getAll({ limit: 20 });
      setPosts(data.posts);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    if (!query.trim()) { setUsers([]); return; }
    const t = setTimeout(async () => {
      try { const { data } = await userAPI.search(query); setUsers(data); } catch {}
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const handleDelete = (id: string) => setPosts(p => p.filter(post => post._id !== id));

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: 700, 
      margin: '0 auto', 
      padding: 'clamp(16px, 4vw, 32px) clamp(12px, 3vw, 20px)' 
    }}>
      <h1 style={{ fontFamily: 'Playfair Display', fontSize: 32, fontWeight: 700, marginBottom: 20 }}>
        Explore
      </h1>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search posts or people..."
          style={{
            width: '100%', padding: '14px 16px 14px 46px', borderRadius: 14, fontSize: 14,
            background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text)',
            transition: 'border-color 0.2s'
          }} />
        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 16 }}>🔍</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'var(--surface)', borderRadius: 12, padding: 4, width: 'fit-content', border: '1px solid var(--border)' }}>
        {(['posts', 'people'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 20px', borderRadius: 9, fontSize: 13, fontWeight: 500,
            background: tab === t ? 'linear-gradient(135deg, var(--accent2), var(--accent3))' : 'transparent',
            color: tab === t ? 'white' : 'var(--text3)', transition: 'all 0.2s'
          }}>
            {t === 'posts' ? 'Posts' : 'People'}
          </button>
        ))}
      </div>

      {tab === 'people' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {users.length === 0 && query ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>No users found</div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}></div>
              <div>Search for people to connect with</div>
            </div>
          ) : users.map(u => (
            <div key={u._id} onClick={() => navigate(`/profile/${u._id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent3)', backgroundImage: u.avatar ? `url(http://localhost:5000${u.avatar})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                {!u.avatar && u.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>@{u.username}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{u.bio || 'No bio yet'}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                  {(u.followers as any[])?.length || 0} followers
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[1, 2, 3].map(i => <div key={i} style={{ height: 250, background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)' }} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {posts.filter(p => !query || p.title.toLowerCase().includes(query.toLowerCase()) || p.content.toLowerCase().includes(query.toLowerCase())).map(post => (
                <PostCard key={post._id} post={post} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
