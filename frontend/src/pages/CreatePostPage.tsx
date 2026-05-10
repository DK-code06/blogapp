import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postAPI } from '../utils/api';

const CreatePostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ title: '', content: '', tags: '' });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [existingImage, setExistingImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    postAPI.getOne(id!).then(({ data }) => {
      setForm({ title: data.title, content: data.content, tags: data.tags?.join(', ') || '' });
      if (data.image) setExistingImage(data.image);
    }).catch(() => navigate('/'));
  }, [id]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImage(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith('image/')) { setImage(f); setPreview(URL.createObjectURL(f)); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { setError('Title and content are required'); return; }
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('content', form.content.trim());
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      fd.append('tags', JSON.stringify(tags));
      if (image) fd.append('image', image);
      if (isEdit && existingImage && !image) fd.append('image', existingImage);
      if (isEdit) { const { data } = await postAPI.update(id!, fd); navigate(`/post/${data._id}`); }
      else { const { data } = await postAPI.create(fd); navigate(`/post/${data._id}`); }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save post');
    } finally { setLoading(false); }
  };

  const currentImage = preview || existingImage;

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: 620, 
      margin: '0 auto', 
      padding: 'clamp(16px, 4vw, 32px) clamp(12px, 3vw, 20px)' 
    }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 32, fontWeight: 700, color: 'var(--text)' }}>
          {isEdit ? 'Edit Post' : '✦ New Post'}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6 }}>
          Share your story with the world
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(232,120,120,0.12)', border: '1px solid rgba(232,120,120,0.25)', borderRadius: 12, padding: '12px 16px', color: 'var(--red)', fontSize: 13, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <form onSubmit={submit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Title */}
          <div>
            <label style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: 8 }}>Title *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="An Unforgettable Story..." required maxLength={150}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, fontSize: 18, fontFamily: 'Playfair Display', background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text)', fontWeight: 600 }} />
          </div>

          {/* Image Upload */}
          <div>
            <label style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: 8 }}>Cover Image</label>
            <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              style={{
                border: '2px dashed var(--border2)', borderRadius: 16, padding: currentImage ? 0 : '40px 20px',
                textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', overflow: 'hidden',
                background: 'var(--surface)'
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'}>
              {currentImage ? (
                <div style={{ position: 'relative' }}>
                  <img src={currentImage} alt="Preview" style={{ width: '100%', maxHeight: 360, objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0'}>
                    <span style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>Click to change image</span>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🖼</div>
                  <div style={{ color: 'var(--text2)', fontWeight: 500, marginBottom: 4 }}>Drop image here or click to upload</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>PNG, JPG up to 5MB</div>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
          </div>

          {/* Content */}
          <div>
            <label style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: 8 }}>Content *</label>
            <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              placeholder="Write your story here... Let it flow." required rows={12}
              style={{ width: '100%', padding: '16px', borderRadius: 12, fontSize: 15, background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text)', lineHeight: 1.8, resize: 'vertical', minHeight: 240 }} />
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{form.content.length} characters</div>
          </div>

          {/* Tags */}
          <div>
            <label style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: 8 }}>Tags</label>
            <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
              placeholder="design, technology, life (comma separated)"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, fontSize: 14, background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text)' }} />
            {form.tags && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                {form.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                  <span key={tag} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(200,168,233,0.1)', color: 'var(--accent)', border: '1px solid rgba(200,168,233,0.2)' }}>#{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
            <button type="button" onClick={() => navigate(-1)}
              style={{ flex: 1, padding: '13px 0', borderRadius: 12, border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text2)', fontSize: 14, fontWeight: 500 }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{
              flex: 2, padding: '13px 0', borderRadius: 12, background: loading ? 'var(--accent3)' : 'linear-gradient(135deg, var(--accent2), var(--accent3))',
              color: 'white', fontSize: 14, fontWeight: 600, boxShadow: '0 4px 20px rgba(160,122,192,0.4)', opacity: loading ? 0.8 : 1, cursor: loading ? 'not-allowed' : 'pointer'
            }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  {isEdit ? 'Saving...' : 'Publishing...'}
                </span>
              ) : isEdit ? 'Save Changes' : 'Publish Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePostPage;