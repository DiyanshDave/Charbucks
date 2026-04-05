import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { tablesAPI, sessionsAPI, ordersAPI } from '../config/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Lock, ExternalLink, Utensils, Users } from 'lucide-react';

export default function FloorPlan() {
  const [tables, setTables] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFloor, setActiveFloor] = useState('main');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [tablesRes, sessionsRes] = await Promise.all([
        tablesAPI.getAll(),
        sessionsAPI.getAll(),
      ]);
      setTables(Array.isArray(tablesRes.data) ? tablesRes.data : []);
      const sessions = Array.isArray(sessionsRes.data) ? sessionsRes.data : [];
      const openSession = sessions.find(s => s.status === 'open');
      setSession(openSession || null);
    } catch (err) {
      console.error('Failed to load floor data:', err);
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSession = async () => {
    if (!user?.id) return toast.error('User not found, please re-login');
    try {
      const res = await sessionsAPI.open({ userId: user.id });
      setSession(res.data.session);
      toast.success('Session opened');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to open session');
    }
  };

  const handleCloseSession = async () => {
    if (!session) return;
    try {
      // Calculate total from paid orders during this session
      const ordersRes = await ordersAPI.getAll();
      const allOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];

      // Filter paid orders created after session opened
      const sessionOpened = session.opened_at ? new Date(session.opened_at) : new Date(0);
      const paidOrders = allOrders.filter(o => {
        if (o.status !== 'paid') return false;
        if (!o.created_at) return false;
        return new Date(o.created_at) >= sessionOpened;
      });
      const closingAmount = paidOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

      await sessionsAPI.close({ sessionId: session.id, closingAmount });
      setSession(null);
      toast.success(`Session closed — Total: ₹${closingAmount.toFixed(2)}`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to close session');
    }
  };

  const handleTableClick = (table) => {
    if (!session) return toast.error('Open a session first');
    navigate(`/order/${table.id}`);
  };

  const occupied = tables.filter(t => t.status === 'occupied').length;
  const available = tables.filter(t => t.status !== 'occupied').length;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{ background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 600, fontStyle: 'italic', lineHeight: 1.1 }}>Floor Overview</h1>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div className="tab-group">
              {['main', 'private', 'booths'].map(f => (
                <button key={f} className={`tab-item ${activeFloor === f ? 'active' : ''}`} onClick={() => setActiveFloor(f)}>
                  {f === 'main' ? 'Main Dining' : f === 'private' ? 'Private' : 'Booths'}
                </button>
              ))}
            </div>
            {!session ? (
              <button className="btn btn-primary" onClick={handleOpenSession}>Open Session</button>
            ) : (
              <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}><ExternalLink size={14} /> Go to Backend</button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <p className="label-sm" style={{ marginBottom: '0.25rem' }}>Live Table Status</p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700 }}>Main Dining Area</h2>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span className="status-pill status-available">{available} Available</span>
            <span className="status-pill status-occupied">{occupied} Occupied</span>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: '260px', borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : tables.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)' }}>
            <Utensils size={40} style={{ color: 'var(--outline)', marginBottom: '1rem' }} />
            <h3 className="title-lg" style={{ marginBottom: '0.5rem' }}>No Tables Yet</h3>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>Head to Settings to add tables.</p>
            <button className="btn btn-primary" onClick={() => navigate('/tables')}><Plus size={16} /> Add Tables</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem', paddingBottom: '5rem' }}>
            {tables.map((table) => {
              const isOccupied = table.status === 'occupied';
              return (
                <div key={table.id} onClick={() => handleTableClick(table)}
                  style={{
                    background: isOccupied ? 'var(--surface-container-highest)' : 'var(--surface-container-low)',
                    borderRadius: 'var(--radius-lg)', padding: '1.5rem',
                    cursor: session ? 'pointer' : 'default', transition: 'all 0.2s ease',
                    position: 'relative', minHeight: '240px', display: 'flex', flexDirection: 'column',
                  }}
                  onMouseEnter={e => { if (session) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ position: 'absolute', top: '-8px', right: '-8px', width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: isOccupied ? 'var(--tertiary)' : 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 700 }}>
                    {table.id}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <span className="label-sm" style={{ color: isOccupied ? 'var(--tertiary)' : 'var(--success)', fontWeight: 700 }}>
                      {isOccupied ? 'OCCUPIED' : 'AVAILABLE'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Users size={12} style={{ color: 'var(--on-surface-variant)' }} />
                      <span className="label-sm">{table.seats || 4} Seats</span>
                    </span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>{table.name}</h3>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={`/tables/table-${table.seats || 4}.png`} alt={`${table.seats}-seater`}
                      style={{ width: '120px', height: '120px', objectFit: 'contain', opacity: isOccupied ? 0.6 : 0.85, filter: isOccupied ? 'saturate(0.3)' : 'none', transition: 'all 0.2s ease' }}
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: isOccupied ? 'linear-gradient(135deg, rgba(102,0,19,0.08), rgba(102,0,19,0.15))' : 'var(--surface)', display: 'none', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.04)' }}>
                      <Utensils size={24} style={{ color: 'var(--outline)', opacity: 0.4 }} />
                    </div>
                  </div>
                  <div style={{ height: '4px', borderRadius: '2px', marginTop: '1rem', background: isOccupied ? 'linear-gradient(90deg, var(--tertiary), transparent)' : 'linear-gradient(90deg, var(--primary), transparent)', opacity: 0.4 }} />
                </div>
              );
            })}
            <div onClick={() => navigate('/tables')} style={{
              background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', padding: '1.5rem',
              cursor: 'pointer', minHeight: '240px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', opacity: 0.5, transition: 'opacity 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
            >
              <Plus size={32} style={{ color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }} />
              <span className="label-md" style={{ color: 'var(--on-surface-variant)' }}>Add Table</span>
            </div>
          </div>
        )}

        <div style={{ position: 'fixed', bottom: 0, left: 240, right: 0, background: 'var(--surface-container-low)', padding: '1rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}><ExternalLink size={16} /> Go to Backend</button>
          {session && <button className="btn btn-primary" onClick={handleCloseSession}><Lock size={14} /> Close Session</button>}
        </div>
      </main>
    </div>
  );
}