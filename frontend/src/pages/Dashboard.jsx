import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { reportsAPI } from '../config/api';
import { DollarSign, ShoppingBag, TrendingUp, Users, Calendar } from 'lucide-react';

export default function Dashboard() {
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    reportsAPI.dashboard()
      .then(res => setDash(res.data))
      .catch(err => console.error('Dashboard error:', err))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Today's Revenue", value: `₹${(dash?.today?.totalRevenue || 0).toFixed(2)}`, icon: DollarSign, color: 'var(--primary)' },
    { label: "Today's Orders", value: dash?.today?.totalOrders || 0, icon: ShoppingBag, color: 'var(--secondary)' },
    { label: 'All-Time Orders', value: dash?.allTime?.totalOrders || 0, icon: TrendingUp, color: 'var(--success)' },
    { label: 'Occupied Tables', value: dash?.tables?.occupied || 0, icon: Users, color: 'var(--tertiary)' },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <div>
            <p className="label-sm" style={{ marginBottom: '0.25rem' }}>Welcome Back</p>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700, fontStyle: 'italic' }}>Dashboard</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary btn-sm"><Calendar size={14} /> Today</button>
            <button className="btn btn-primary" onClick={() => navigate('/floor')}>Open POS Terminal</button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
            {[0, 1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '140px', borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <Icon size={20} style={{ color: s.color }} />
                  </div>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.1, marginBottom: '0.25rem' }}>{s.value}</p>
                  <p className="label-sm">{s.label}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 600, fontStyle: 'italic', marginBottom: '1rem' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Products', desc: 'Manage menu items', path: '/products' },
            { label: 'Tables', desc: 'Floor configuration', path: '/tables' },
            { label: 'Sessions', desc: 'View POS sessions', path: '/sessions' },
            { label: 'Reports', desc: 'Sales analytics', path: '/reports' },
          ].map(a => (
            <button key={a.path} onClick={() => navigate(a.path)} style={{
              background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', padding: '1.5rem',
              border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'transform 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              <h3 className="title-md" style={{ marginBottom: '0.25rem' }}>{a.label}</h3>
              <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>{a.desc}</p>
            </button>
          ))}
        </div>

        {/* Recent Orders */}
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 600, fontStyle: 'italic', marginBottom: '1rem' }}>Recent Orders</h2>
        <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {!dash?.recentOrders?.length ? (
            <p style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No recent orders</p>
          ) : (
            dash.recentOrders.map((o, i) => (
              <div key={o.order_id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', background: i % 2 === 0 ? 'transparent' : 'var(--surface-container-low)' }}>
                <span style={{ fontWeight: 600, minWidth: '100px' }}>{o.order_id}</span>
                <span style={{ flex: 1 }}>Table {o.table_id}</span>
                <span style={{ fontWeight: 600 }}>₹{parseFloat(o.total_amount || 0).toFixed(2)}</span>
                <span className={`status-pill ${o.status === 'paid' ? 'status-paid' : 'status-pending'}`}>{o.status}</span>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}