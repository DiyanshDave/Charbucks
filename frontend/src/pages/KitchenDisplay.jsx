import { useState, useEffect, useCallback } from 'react';
import { kitchenAPI } from '../config/api';
import { CheckCheck, Clock, ChefHat, Flame, Bell, Volume2 } from 'lucide-react';

const STATUS_FLOW = ['to_cook', 'preparing', 'completed'];
const STATUS_LABELS = { to_cook: 'Received', preparing: 'Preparing', completed: 'Completed' };
const STATUS_COLORS = {
  to_cook: { bg: '#24340c', text: '#fff' },
  preparing: { bg: '#c28a00', text: '#fff' },
  completed: { bg: '#3d7a2a', text: '#fff' },
};

export default function KitchenDisplay() {
  const [orders, setOrders] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [prevCount, setPrevCount] = useState(0);
  const [soundOn, setSoundOn] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      const [activeRes, completedRes] = await Promise.all([
        kitchenAPI.getOrders(),
        kitchenAPI.getCompleted(),
      ]);
      const active = Array.isArray(activeRes.data) ? activeRes.data : [];
      const done = Array.isArray(completedRes.data) ? completedRes.data : [];

      // Detect new orders
      if (active.length > prevCount && prevCount > 0) {
        const newest = active[active.length - 1];
        setNewOrderAlert(newest);
        if (soundOn) playBeep();
        setTimeout(() => setNewOrderAlert(null), 5000);
      }
      setPrevCount(active.length);
      setOrders(active);
      setCompleted(done);
    } catch (err) {
      console.error('Kitchen display error:', err);
    }
  }, [prevCount, soundOn]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 6000);
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => { clearInterval(interval); clearInterval(timer); };
  }, [loadOrders]);

  const handleAdvance = async (orderId, currentStatus) => {
    const idx = STATUS_FLOW.indexOf(currentStatus);
    if (idx < 0 || idx >= STATUS_FLOW.length - 1) return;
    const nextStatus = STATUS_FLOW[idx + 1];
    try {
      await kitchenAPI.updateStatus(orderId, { status: nextStatus });
      loadOrders();
    } catch (err) {
      console.error('Failed to advance:', err);
    }
  };

  const getElapsed = (createdAt) => {
    if (!createdAt) return '0:00';
    const diff = Math.floor((now - new Date(createdAt).getTime()) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const getUrgencyColor = (createdAt) => {
    if (!createdAt) return '#24340c';
    const mins = Math.floor((now - new Date(createdAt).getTime()) / 60000);
    if (mins >= 20) return '#660013';
    if (mins >= 10) return '#c28a00';
    return '#24340c';
  };

  const received = orders.filter(o => o.status === 'to_cook');
  const preparing = orders.filter(o => o.status === 'preparing');
  const done = completed.slice(0, 8);

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 800; osc.type = 'sine';
      gain.gain.value = 0.3;
      osc.start(); osc.stop(ctx.currentTime + 0.15);
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2); gain2.connect(ctx.destination);
        osc2.frequency.value = 1000; osc2.type = 'sine';
        gain2.gain.value = 0.3;
        osc2.start(); osc2.stop(ctx.currentTime + 0.2);
      }, 200);
    } catch {}
  };

  const columns = [
    { key: 'received', title: 'Received', items: received, color: '#24340c', accent: '#3d5a18' },
    { key: 'preparing', title: 'Preparing', items: preparing, color: '#c28a00', accent: '#e8a500' },
    { key: 'completed', title: 'Completed', items: done, color: '#3d7a2a', accent: '#4d9a35' },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: '#1a1610', color: '#fff8f2',
      fontFamily: "'Inter', system-ui, sans-serif",
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header Bar */}
      <div style={{
        padding: '1rem 2rem',
        background: 'linear-gradient(90deg, #24340c, #3d5a18)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ChefHat size={28} />
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.04em' }}>
              CHARBUCKS KITCHEN
            </h1>
            <p style={{ fontSize: '0.6875rem', opacity: 0.6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Live Kitchen Display • {received.length + preparing.length} Active Orders
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Live clock */}
          <span style={{ fontSize: '1.5rem', fontWeight: 300, fontVariantNumeric: 'tabular-nums', opacity: 0.8 }}>
            {new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>

          {/* Sound toggle */}
          <button onClick={() => setSoundOn(!soundOn)} style={{
            background: soundOn ? 'rgba(255,248,242,0.15)' : 'transparent',
            border: '1px solid rgba(255,248,242,0.2)', borderRadius: '8px',
            color: '#fff8f2', padding: '0.5rem', cursor: 'pointer',
          }}>
            <Volume2 size={16} style={{ opacity: soundOn ? 1 : 0.3 }} />
          </button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0', overflow: 'hidden' }}>
        {columns.map(col => (
          <div key={col.key} style={{
            display: 'flex', flexDirection: 'column',
            borderRight: col.key !== 'completed' ? '1px solid rgba(255,248,242,0.06)' : 'none',
          }}>
            {/* Column Header */}
            <div style={{
              padding: '1rem 1.5rem',
              background: 'rgba(255,248,242,0.03)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: `3px solid ${col.color}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 600, fontStyle: 'italic' }}>
                  {col.title}
                </h2>
                <span style={{
                  background: col.color, color: '#fff',
                  padding: '0.125rem 0.625rem', borderRadius: '999px',
                  fontSize: '0.8125rem', fontWeight: 700,
                }}>
                  {col.items.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div style={{
              flex: 1, padding: '1rem', overflowY: 'auto',
              display: 'flex', flexDirection: 'column', gap: '0.75rem',
            }}>
              {col.items.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                  <p style={{ fontSize: '0.875rem' }}>No orders</p>
                </div>
              ) : col.items.map(order => {
                const elapsed = getElapsed(order.created_at);
                const urgColor = getUrgencyColor(order.created_at);
                const isCompleted = col.key === 'completed';

                return (
                  <div
                    key={order.order_id}
                    onClick={() => !isCompleted && handleAdvance(order.order_id, order.status)}
                    style={{
                      background: isCompleted ? 'rgba(255,248,242,0.03)' : 'rgba(255,248,242,0.06)',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      cursor: isCompleted ? 'default' : 'pointer',
                      transition: 'all 0.2s',
                      borderLeft: `4px solid ${isCompleted ? 'rgba(61,122,42,0.4)' : col.color}`,
                      opacity: isCompleted ? 0.5 : 1,
                    }}
                    onMouseEnter={e => { if (!isCompleted) e.currentTarget.style.background = 'rgba(255,248,242,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isCompleted ? 'rgba(255,248,242,0.03)' : 'rgba(255,248,242,0.06)'; }}
                  >
                    {/* Card Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                      <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.5 }}>
                        {order.order_id.slice(-8)}
                      </span>
                      {!isCompleted && (
                        <span style={{
                          background: urgColor, color: '#fff',
                          padding: '0.2rem 0.625rem', borderRadius: '999px',
                          fontSize: '0.75rem', fontWeight: 700,
                          fontVariantNumeric: 'tabular-nums',
                        }}>
                          {elapsed}
                        </span>
                      )}
                      {isCompleted && <CheckCheck size={16} style={{ opacity: 0.4 }} />}
                    </div>

                    {/* Table name */}
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                      {order.table_name || `Table ${order.table_id}`}
                    </h3>

                    {/* Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '0.375rem 0',
                          borderBottom: idx < (order.items || []).length - 1 ? '1px solid rgba(255,248,242,0.06)' : 'none',
                        }}>
                          <span style={{ fontSize: '0.9375rem' }}>
                            <strong style={{ color: col.accent }}>{item.quantity}x</strong> {item.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Tap hint */}
                    {!isCompleted && (
                      <p style={{
                        marginTop: '0.75rem', fontSize: '0.625rem', textTransform: 'uppercase',
                        letterSpacing: '0.06em', opacity: 0.3, textAlign: 'center',
                      }}>
                        Tap to move to {col.key === 'received' ? 'Preparing' : 'Completed'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* New Order Alert */}
      {newOrderAlert && (
        <div style={{
          position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #24340c, #3d5a18)',
          padding: '1rem 2.5rem', borderRadius: '24px',
          display: 'flex', alignItems: 'center', gap: '1rem',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          animation: 'slideUp 0.3s ease',
          zIndex: 1000,
        }}>
          <Bell size={20} />
          <div>
            <p style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.6 }}>New Order Just In</p>
            <p style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
              {newOrderAlert.table_name || `Table ${newOrderAlert.table_id}`}: {(newOrderAlert.items || []).length} Items
            </p>
          </div>
        </div>
      )}
    </div>
  );
}