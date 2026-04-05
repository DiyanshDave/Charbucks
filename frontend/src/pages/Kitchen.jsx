import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { kitchenAPI } from '../config/api';
import toast from 'react-hot-toast';
import { Clock, CheckCheck, Bell, ChefHat, Monitor } from 'lucide-react';

export default function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadOrders = useCallback(async () => {
    try {
      const [activeRes, completedRes] = await Promise.all([
        kitchenAPI.getOrders(),
        kitchenAPI.getCompleted(),
      ]);
      setOrders(Array.isArray(activeRes.data) ? activeRes.data : []);
      setCompleted(Array.isArray(completedRes.data) ? completedRes.data : []);
    } catch (err) {
      console.error('Kitchen load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const handleStatusChange = async (orderIdVal, newStatus) => {
    try {
      await kitchenAPI.updateStatus(orderIdVal, { status: newStatus });
      toast.success(`Order moved to ${newStatus}`);
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update order');
    }
  };

  const openKitchenDisplay = () => {
    window.open('/kitchen-display', 'KitchenDisplay', 'width=1400,height=900,menubar=no,toolbar=no');
  };

  const received = orders.filter(o => o.status === 'to_cook');
  const preparing = orders.filter(o => o.status === 'preparing');
  const done = completed.slice(0, 10);
  const totalActive = received.length + preparing.length;

  const columns = [
    { title: 'Received', count: received.length, items: received, nextStatus: 'preparing', color: 'var(--primary)' },
    { title: 'Preparing', count: preparing.length, items: preparing, nextStatus: 'completed', color: 'var(--warning)' },
    { title: 'Completed', count: done.length, items: done, nextStatus: null, color: 'var(--on-surface-variant)' },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700, fontStyle: 'italic', marginBottom: '0.25rem' }}>Kitchen Display</h1>
            <p className="label-sm">{totalActive} Active Orders</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/station-view')}><Clock size={14} /> Station View</button>
            <button className="btn btn-primary" onClick={openKitchenDisplay}><Monitor size={14} /> Open Full Kitchen Display</button>
          </div>
        </div>

        {/* Info banner */}
        <div style={{
          background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)',
          padding: '0.875rem 1.25rem', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <Monitor size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <p style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>
            Click <strong>"Open Full Kitchen Display"</strong> to launch a separate full-screen window for the kitchen monitor. It works independently and auto-updates.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {[0, 1, 2].map(i => <div key={i} className="skeleton" style={{ height: '500px', borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
            {columns.map(col => (
              <div key={col.title}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 600, fontStyle: 'italic' }}>{col.title}</h2>
                  <span className="badge badge-primary">{col.count}</span>
                  <div style={{ flex: 1, height: '2px', background: `linear-gradient(90deg, ${col.color}, transparent)`, opacity: 0.3 }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {col.items.length === 0 ? (
                    <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center', opacity: 0.5 }}>
                      <p className="body-md">No orders</p>
                    </div>
                  ) : col.items.map(order => {
                    const isUrgent = col.title === 'Preparing';
                    return (
                      <div key={order.order_id}
                        onClick={() => col.nextStatus && handleStatusChange(order.order_id, col.nextStatus)}
                        style={{
                          background: isUrgent ? 'var(--surface-container-highest)' : 'var(--surface-container-low)',
                          borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem',
                          cursor: col.nextStatus ? 'pointer' : 'default',
                          borderLeft: isUrgent ? '4px solid var(--tertiary)' : col.title === 'Received' ? '4px solid var(--primary)' : '4px solid transparent',
                          transition: 'transform 0.2s', opacity: col.title === 'Completed' ? 0.6 : 1,
                        }}
                        onMouseEnter={e => { if (col.nextStatus) e.currentTarget.style.transform = 'scale(1.01)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span className="label-sm">Order {order.order_id}</span>
                          {order.created_at && (
                            <span style={{ background: isUrgent ? 'var(--tertiary)' : 'var(--primary)', color: 'white', padding: '0.125rem 0.5rem', borderRadius: '999px', fontSize: '0.625rem', fontWeight: 700 }}>
                              {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          {col.title === 'Completed' && <CheckCheck size={16} style={{ color: 'var(--on-surface-variant)' }} />}
                        </div>
                        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                          {order.table_name || `Table ${order.table_id}`}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {(order.items || []).map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.9375rem' }}>{item.quantity || 1}x {item.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}