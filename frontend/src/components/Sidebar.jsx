import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Diamond, ShoppingBag, ChefHat, Settings,
  LogOut, ClipboardList
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/floor', label: 'Floor Plan', icon: Diamond },
  { path: '/orders', label: 'Orders', icon: ClipboardList },
  { path: '/kitchen', label: 'Kitchen', icon: ChefHat },
  { path: '/products', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => {
    if (path === '/products') {
      return ['/products', '/tables', '/sessions', '/reports'].includes(location.pathname);
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sidebar">
      {/* Logo - click to go to Dashboard */}
      <div
        onClick={() => navigate('/dashboard')}
        style={{
          padding: '0 1.5rem',
          marginBottom: '2.5rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <img
          src="/logoo.png.jpeg"
          alt="Charbucks"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            objectFit: 'cover',
            background: 'rgba(255,248,242,0.1)',
          }}
          onError={(e) => {
            // fallback if logo.png not found — show letter
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        {/* Fallback if no logo image */}
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'rgba(255,248,242,0.1)',
          display: 'none', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-serif)',
          flexShrink: 0,
        }}>C</div>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.25rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            marginBottom: '0.125rem',
            lineHeight: 1.1,
          }}>
            CHARBUCKS
          </h1>
          <p style={{
            fontSize: '0.5625rem',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            opacity: 0.6,
          }}>
            Fine Dining POS
          </p>
        </div>
      </div>

      {/* Nav Items */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 0.75rem' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                padding: '0.875rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: active ? 'rgba(255,248,242,0.12)' : 'transparent',
                color: active ? '#fff' : 'rgba(255,248,242,0.55)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
                fontWeight: active ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.5} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* User + Logout */}
      <div style={{ padding: '0 1rem', marginTop: 'auto' }}>
        <div style={{
          background: 'rgba(255,248,242,0.08)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            background: 'var(--secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#fff',
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#fff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {user?.name || 'Staff'}
            </p>
            <p style={{ fontSize: '0.6875rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Lead Server
            </p>
          </div>
          <button
            onClick={logout}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,248,242,0.4)',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}