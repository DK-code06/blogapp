import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ICON = { 
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>', 
  explore: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>', 
  create: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>', 
  profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>' 
};

const SvgIcon = ({ html, size = 24 }: { html: string; size?: number }) => (
  <span dangerouslySetInnerHTML={{ __html: html }} style={{ display: 'flex', width: size, height: size }} />
);

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/auth'); };

  const navItems = [
    { to: '/', icon: NAV_ICON.home, label: 'Home', exact: true },
    { to: '/explore', icon: NAV_ICON.explore, label: 'Explore' },
    { to: '/create', icon: NAV_ICON.create, label: 'Create' },
    { to: `/profile/${user?._id}`, icon: NAV_ICON.profile, label: 'Profile' },
  ];

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <nav className="sidebar">
        <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 40, color: 'var(--text)' }}>
          REMINISCE
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
          {navItems.map((item) => (
            <NavLink 
              key={item.label} 
              to={item.to} 
              end={item.exact}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                color: isActive ? 'var(--accent)' : 'var(--text2)',
                textDecoration: 'none', fontWeight: isActive ? 600 : 400
              })}
            >
              <SvgIcon html={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <button onClick={handleLogout} style={{ marginTop: 'auto', background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, fontSize: '16px' }}>
           <span>Logout</span>
        </button>
      </nav>

      {/* NEW: Mobile Top Header */}
      <div className="mobile-header">
        <div style={{ fontSize: 20, fontWeight: 'bold', color: 'var(--text)' }}>
          REMINISCE
        </div>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
          Logout
        </button>
      </div>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.label} 
            to={item.to} 
            end={item.exact}
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            <SvgIcon html={item.icon} size={24} />
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;