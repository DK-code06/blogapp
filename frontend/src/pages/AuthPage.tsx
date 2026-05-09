import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.username, form.email, form.password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', overflow: 'hidden'
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,168,233,0.12) 0%, transparent 70%)', animation: 'float 6s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,137,184,0.1) 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(120,105,168,0.06) 0%, transparent 60%)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', animation: 'fadeIn 0.6s ease' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'Playfair Display', fontSize: 36, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-1px' }}>
            REMINISCE
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)', letterSpacing: '3px', textTransform: 'uppercase', marginTop: 6 }}>
            Your Story Shines Here
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)', borderRadius: 24, padding: 36, border: '1px solid var(--border)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,168,233,0.05)'
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 12, padding: 4, marginBottom: 28 }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 9, fontSize: 13, fontWeight: 500,
                  background: mode === m ? 'var(--surface2)' : 'transparent',
                  color: mode === m ? 'var(--accent)' : 'var(--text3)',
                  transition: 'all 0.2s', letterSpacing: '0.3px'
                }}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ background: 'rgba(232,120,120,0.12)', border: '1px solid rgba(232,120,120,0.25)', borderRadius: 10, padding: '12px 16px', color: 'var(--red)', fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <div>
                <label style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 6 }}>Username</label>
                <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} required
                  placeholder="your_username" style={inputStyle} />
              </div>
            )}
            <div>
              <label style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required
                placeholder="you@example.com" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required
                placeholder="••••••••" minLength={6} style={inputStyle} />
            </div>
            <button type="submit" disabled={loading} style={{
              marginTop: 8, padding: '13px 0', borderRadius: 12, fontSize: 14, fontWeight: 600,
              background: loading ? 'var(--accent3)' : 'linear-gradient(135deg, var(--accent2), var(--accent3))',
              color: 'white', transition: 'all 0.2s', letterSpacing: '0.3px',
              boxShadow: '0 4px 20px rgba(160,122,192,0.4)', opacity: loading ? 0.8 : 1, cursor: loading ? 'not-allowed' : 'pointer'
            }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 20 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              style={{ background: 'none', color: 'var(--accent)', fontSize: 12, fontWeight: 500 }}>
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 14,
  background: 'var(--bg)', border: '1px solid var(--border2)', color: 'var(--text)',
  transition: 'border-color 0.2s'
};

export default AuthPage;
