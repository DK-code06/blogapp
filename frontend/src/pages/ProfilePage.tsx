import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI, postAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { User, Post } from '../types';
import PostCard from '../components/PostCard';

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user: me, updateUser } = useAuth();
  const navigate = useNavigate();
  const isMe = id === me?._id;
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [tab, setTab] = useState<'posts' | 'followers' | 'following'>('posts');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', bio: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await userAPI.getOne(id!);
      setProfile(data);
      setFollowerCount(data.followers?.length || 0);
      setFollowing((data.followers as any[])?.some((f: any) => (f._id || f) === me?._id));
      setEditForm({ username: data.username, bio: data.bio || '' });
    } catch { navigate('/'); } finally { setLoading(false); }
  };

  const fetchPosts = async () => {
    try { const { data } = await postAPI.getUserPosts(id!); setPosts(data); } catch {}
  };

  const handleFollow = async () => {
    try {
      const { data } = await userAPI.follow(id!);
      setFollowing(data.following);
      setFollowerCount(data.followersCount);
    } catch {}
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      fd.append('username', editForm.username);
      fd.append('bio', editForm.bio);
      if (avatarFile) fd.append('avatar', avatarFile);
      const { data } = await userAPI.update(fd);
      updateUser(data); setProfile(data); setEditing(false); setAvatarFile(null); setAvatarPreview('');
    } catch {} finally { setSaving(false); }
  };

  const handleDeletePost = (pid: string) => setPosts(p => p.filter(post => post._id !== pid));

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );
  if (!profile) return null;

  // Fixed: use cloudinary URL directly, no localhost prefix
  const avatarSrc = avatarPreview || profile.avatar || '';

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: 620, 
      margin: '0 auto', 
      padding: 'clamp(16px, 4vw, 32px) clamp(12px, 3vw, 20px)' 
    }}>
      <div style={{ background: 'var(--surface)', borderRadius: 24, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 24, animation: 'fadeIn 0.4s ease' }}>
        <div style={{ height: 120, background: 'linear-gradient(135deg, var(--accent3), var(--bg3), var(--pink))', backgroundSize: '200% 200%', animation: 'gradientShift 8s ease infinite', opacity: 0.6 }} />

        <div style={{ padding: '0 24px 24px', marginTop: -36 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', background: 'var(--accent3)',
                backgroundImage: avatarSrc ? `url(${avatarSrc})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center',
                border: '4px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, fontWeight: 700, color: 'white'
              }}>
                {!avatarSrc && profile.username?.[0]?.toUpperCase()}
              </div>
              {isMe && editing && (
                <>
                  <button onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: 'var(--accent2)', color: 'white', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--surface)' }}>
                    📷
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {isMe ? (
                <button onClick={() => setEditing(!editing)} style={{
                  padding: '9px 20px', borderRadius: 12, border: '1px solid var(--border2)',
                  background: editing ? 'transparent' : 'linear-gradient(135deg, var(--accent2), var(--accent3))',
                  color: editing ? 'var(--text2)' : 'white', fontSize: 13, fontWeight: 500
                }}>
                  {editing ? 'Cancel' : 'Edit Profile'}
                </button>
              ) : (
                <button onClick={handleFollow} style={{
                  padding: '9px 24px', borderRadius: 12,
                  background: following ? 'transparent' : 'linear-gradient(135deg, var(--accent2), var(--accent3))',
                  border: following ? '1px solid var(--border2)' : 'none',
                  color: following ? 'var(--text2)' : 'white', fontSize: 13, fontWeight: 600,
                  boxShadow: following ? 'none' : '0 4px 16px rgba(160,122,192,0.35)'
                }}>
                  {following ? 'Following ✓' : '+ Follow'}
                </button>
              )}
            </div>
          </div>

          {isMe && editing ? (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input value={editForm.username} onChange={e => setEditForm(p => ({ ...p, username: e.target.value }))}
                placeholder="Username"
                style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14, background: 'var(--bg)', border: '1px solid var(--border2)', color: 'var(--text)', fontWeight: 600 }} />
              <textarea value={editForm.bio} onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                placeholder="Tell your story..." rows={3} maxLength={200}
                style={{ padding: '10px 14px', borderRadius: 10, fontSize: 13, background: 'var(--bg)', border: '1px solid var(--border2)', color: 'var(--text)', resize: 'none', lineHeight: 1.6 }} />
              <button type="submit" disabled={saving} style={{ padding: '10px 0', borderRadius: 10, background: 'linear-gradient(135deg, var(--accent2), var(--accent3))', color: 'white', fontSize: 13, fontWeight: 600, opacity: saving ? 0.8 : 1 }}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          ) : (
            <div>
              <div style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>@{profile.username}</div>
              {profile.bio && <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6, lineHeight: 1.6 }}>{profile.bio}</p>}
            </div>
          )}

          <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
            {[
              { label: 'Posts', val: posts.length, action: () => setTab('posts') },
              { label: 'Followers', val: followerCount, action: () => setTab('followers') },
              { label: 'Following', val: (profile.following as any[])?.length || 0, action: () => setTab('following') }
            ].map(s => (
              <button key={s.label} onClick={s.action} style={{ background: 'none', textAlign: 'left', padding: 0 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {(['posts', 'followers', 'following'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 18px', background: 'none', fontSize: 13, fontWeight: 500, textTransform: 'capitalize',
            color: tab === t ? 'var(--accent)' : 'var(--text3)',
            borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`,
            transition: 'all 0.2s', marginBottom: -1
          }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'posts' && (
        posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
            <div style={{ fontFamily: 'Playfair Display', fontSize: 18, color: 'var(--text2)', marginBottom: 8 }}>No posts yet</div>
            {isMe && (
              <button onClick={() => navigate('/create')} style={{ padding: '10px 24px', borderRadius: 12, background: 'linear-gradient(135deg, var(--accent2), var(--accent3))', color: 'white', fontSize: 13, fontWeight: 600, marginTop: 8 }}>
                Create your first post
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {posts.map(post => <PostCard key={post._id} post={post} onDelete={handleDeletePost} />)}
          </div>
        )
      )}

      {(tab === 'followers' || tab === 'following') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {((tab === 'followers' ? profile.followers : profile.following) as any[])?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
              No {tab} yet
            </div>
          ) : ((tab === 'followers' ? profile.followers : profile.following) as any[])?.map((u: any) => (
            <div key={u._id || u} onClick={() => navigate(`/profile/${u._id || u}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}>
              {/* Fixed: removed localhost:5000 prefix */}
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent3)', backgroundImage: u.avatar ? `url(${u.avatar})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                {!u.avatar && (u.username?.[0]?.toUpperCase() || '?')}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>@{u.username || 'User'}</div>
                {u.bio && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{u.bio}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;