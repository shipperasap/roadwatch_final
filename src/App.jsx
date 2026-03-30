/* ──────────────────────────────────────────────
   Delhi RoadWatch — App Core Structure
   ────────────────────────────────────────────── */

import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { isConfigured } from './lib/config';

// Pages
import LoginPage    from './pages/LoginPage';
import SignupPage   from './pages/SignupPage';
import CitizenHome  from './pages/citizen/CitizenHome';
import ReportViolation from './pages/citizen/ReportViolation';
import MyReports    from './pages/citizen/MyReports';
import AdminDashboard from './pages/admin/AdminDashboard';
import LegalFAQBot  from './pages/shared/LegalFAQBot';
import PoliceDashboard from './pages/police/PoliceDashboard';
import NotificationsPanel from './components/NotificationsPanel';
import SetupPage    from './pages/SetupPage';

import './index.css';

// ── Protected Route ────────────────────────────────────────────────────────
function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, ready } = useAuth();
  if (!ready) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '14px', fontWeight: 700 }}>Loading...</div>;
  if (!currentUser) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    const dest = currentUser.role === 'citizen' ? '/citizen' : currentUser.role === 'admin' ? '/admin' : '/police';
    return <Navigate to={dest} replace />;
  }
  return children;
}

// ── Guest Route ────────────────────────────────────────────────────────────
function GuestRoute({ children }) {
  const { currentUser, ready } = useAuth();
  if (!ready) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '14px', fontWeight: 700 }}>Loading...</div>;
  if (currentUser) {
    const dest = currentUser.role === 'citizen' ? '/citizen' : currentUser.role === 'admin' ? '/admin' : '/police';
    return <Navigate to={dest} replace />;
  }
  return children;
}

// ── Settings Page Wrapper (inside router) ──────────────────────────────────
function SettingsPage() {
  const navigate = useNavigate();
  return <SetupPage onComplete={() => navigate(-1)} showBack onBack={() => navigate(-1)} />;
}

// ── Dashboard Shell ────────────────────────────────────────────────────────
function DashboardLayout() {
  const { currentUser, logout, ready } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  if (!ready) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>Loading...</div>;
  if (!currentUser) return <Navigate to="/" replace />;

  const citizenLinks = [
    { to: '/citizen',            label: 'Overview' },
    { to: '/citizen/report',     label: 'Capture'  },
    { to: '/citizen/my-reports', label: 'History'  },
  ];
  const adminLinks = [
    { to: '/admin',               label: 'Reports'  },
    { to: '/admin/notifications', label: 'Dispatch' },
  ];
  const policeLinks = [
    { to: '/police',             label: 'Overview' },
    { to: '/police/report',      label: 'Capture'  },
    { to: '/police/my-reports',  label: 'History'  },
  ];

  const links = currentUser?.role === 'citizen' ? citizenLinks
    : currentUser?.role === 'admin' ? adminLinks : policeLinks;
  const activeLabel = links.find(l => location.pathname === l.to)?.label || 'Console';

  return (
    <div className="app-layout">
      {isSidebarOpen && (
        <div className="sidebar-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${isSidebarOpen ? 'show' : ''}`} style={{ background: 'white', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', zIndex: 1001 }}>
        {/* Brand */}
        <div style={{ padding: '32px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 900, fontSize: '18px', letterSpacing: '-0.04em', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
            ROAD<span style={{ color: 'var(--primary)', fontStyle: 'italic', fontWeight: 500 }}>WATCH</span>.
          </div>
          <button className="mobile-only" onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Nav Links */}
        <nav style={{ padding: '16px', flex: 1 }}>
          <div style={{ fontSize: '10px', fontWeight: 950, color: 'var(--text-secondary)', opacity: 0.4, letterSpacing: '0.1em', padding: '0 12px', marginBottom: '16px', textTransform: 'uppercase' }}>Navigation</div>
          <ul style={{ listStyle: 'none' }}>
            {links.map(link => (
              <li key={link.to} style={{ marginBottom: '4px' }}>
                <NavLink to={link.to} end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '10px', textDecoration: 'none',
                    background: isActive ? 'var(--primary-light)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.04em', transition: 'all 0.2s ease'
                  })}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', overflow: 'hidden' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: 'var(--primary-dim)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', flexShrink: 0 }}>
              {currentUser?.name?.charAt(0)}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.name || 'User'}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-3)', textTransform: 'capitalize' }}>{currentUser?.role}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn btn-secondary" style={{ flex: 1, fontSize: '12px', padding: '7px' }} onClick={() => navigate('/settings')}>Settings</button>
            <button className="btn btn-secondary" style={{ flex: 1, fontSize: '12px', padding: '7px' }} onClick={handleLogout}>Sign out</button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-main)' }}>
        <header className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: 'white', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="mobile-only" onClick={() => setSidebarOpen(prev => !prev)} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }}>
              <div style={{ width: '20px', height: '2px', background: 'var(--text-primary)' }} />
              <div style={{ width: '14px', height: '2px', background: 'var(--text-primary)' }} />
              <div style={{ width: '20px', height: '2px', background: 'var(--text-primary)' }} />
            </button>
            <h2 style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>{activeLabel}</h2>
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px' }}>
            {currentUser?.name?.charAt(0)}
          </div>
        </header>

        <div style={{ padding: '24px', flex: 1 }}>
          <Routes>
            <Route path="/citizen"             element={<ProtectedRoute allowedRoles={['citizen']}><CitizenHome /></ProtectedRoute>} />
            <Route path="/citizen/report"      element={<ProtectedRoute allowedRoles={['citizen']}><ReportViolation /></ProtectedRoute>} />
            <Route path="/citizen/my-reports"  element={<ProtectedRoute allowedRoles={['citizen']}><MyReports /></ProtectedRoute>} />
            <Route path="/admin"               element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['admin']}><NotificationsPanel /></ProtectedRoute>} />
            <Route path="/police"              element={<ProtectedRoute allowedRoles={['police']}><CitizenHome /></ProtectedRoute>} />
            <Route path="/police/report"       element={<ProtectedRoute allowedRoles={['police']}><PoliceDashboard /></ProtectedRoute>} />
            <Route path="/police/my-reports"   element={<ProtectedRoute allowedRoles={['police']}><MyReports /></ProtectedRoute>} />
            <Route path="/settings"            element={<SettingsPage />} />
            <Route path="*" element={<Navigate to={currentUser?.role === 'citizen' ? '/citizen' : currentUser?.role === 'admin' ? '/admin' : '/police'} replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

// ── App Entry ──────────────────────────────────────────────────────────────
export default function App() {
  const [configured, setConfigured] = useState(() => isConfigured());

  // Show setup page before anything else if keys not set
  if (!configured) {
    return <SetupPage onComplete={() => setConfigured(true)} />;
  }

  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/"       element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
          <Route path="/*"      element={<DashboardLayout />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}
