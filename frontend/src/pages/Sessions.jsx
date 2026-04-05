import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { sessionsAPI, ordersAPI } from '../config/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Play, Square, Clock, CalendarDays, DollarSign } from 'lucide-react';

const settingsTabs = [
  { key: 'products', label: 'Products', path: '/products' },
  { key: 'tables', label: 'Tables', path: '/tables' },
  { key: 'sessions', label: 'Sessions', path: '/sessions' },
  { key: 'reports', label: 'Reports', path: '/reports' },
];

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { loadSessions(); }, []);

  const loadSessions = async () => {
    try {
      const res = await sessionsAPI.getAll();
      setSessions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async () => {
    if (!user?.id) return toast.error('User not found');
    try {
      await sessionsAPI.open({ userId: user.id });
      toast.success('Session opened');
      loadSessions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to open session');
    }
  };

  const handleClose = async (session) => {
    try {
      // Calculate total from paid orders during this session
      const ordersRes = await ordersAPI.getAll();
      const allOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];

      const sessionOpened = session.opened_at ? new Date(session.opened_at) : new Date(0);
      const paidOrders = allOrders.filter(o => {
        if (o.status !== 'paid') return false;
        if (!o.created_at) return false;
        return new Date(o.created_at) >= sessionOpened;
      });
      const closingAmount = paidOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

      await sessionsAPI.close({ sessionId: session.id, closingAmount });
      toast.success(`Session closed — Total Sales: ₹${closingAmount.toFixed(2)}`);
      loadSessions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to close session');
    }
  };

  const openSessions = sessions.filter(s => s.status === 'open');
  const closedSessions = sessions.filter(s => s.status !== 'open');

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="tab-group" style={{ marginBottom: '2rem', maxWidth: '500px' }}>
          {settingsTabs.map(tab => (
            <button key={tab.key} className={`tab-item ${tab.key === 'sessions' ? 'active' : ''}`} onClick={() => navigate(tab.path)}>{tab.label}</button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, fontStyle: 'italic' }}>POS Sessions</h1>
            <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>{openSessions.length} active</p>
          </div>
          <button className="btn btn-primary" onClick={handleOpen}><Play size={14} /> Open New Session</button>
        </div>

        {openSessions.length > 0 && (
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 600, fontStyle: 'italic', marginBottom: '1rem' }}>Active Sessions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {openSessions.map(session => (
                <div key={session.id} style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', borderLeft: '4px solid var(--success)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(61,122,42,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={20} style={{ color: 'var(--success)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 className="title-md">Session {session.id}</h3>
                    <p className="label-sm">Opened: {session.opened_at ? new Date(session.opened_at).toLocaleString() : 'Just now'}</p>
                  </div>
                  <button onClick={() => handleClose(session)} className="btn btn-tertiary btn-sm"><Square size={12} /> Close</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 600, fontStyle: 'italic', marginBottom: '1rem' }}>Past Sessions</h2>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: '70px', borderRadius: 'var(--radius-md)' }} />)}
          </div>
        ) : closedSessions.length === 0 ? (
          <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--on-surface-variant)' }}>No past sessions</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {closedSessions.map(session => (
              <div key={session.id} style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <CalendarDays size={16} style={{ color: 'var(--on-surface-variant)' }} />
                <span className="body-md" style={{ fontWeight: 500, flex: 1 }}>Session {session.id}</span>
                <span className="label-sm">{session.closed_at ? new Date(session.closed_at).toLocaleDateString() : '—'}</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--primary)', minWidth: '100px', textAlign: 'right' }}>
                  ₹{parseFloat(session.closing_amount || 0).toFixed(2)}
                </span>
                <span className="status-pill status-occupied" style={{ fontSize: '0.5625rem' }}>Closed</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}