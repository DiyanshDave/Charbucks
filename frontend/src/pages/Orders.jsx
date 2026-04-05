import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import OrderProgress from '../components/OrderProgress';
import { ordersAPI, tablesAPI } from '../config/api';
import toast from 'react-hot-toast';
import { Send, CreditCard, RefreshCw, ChevronDown, ChevronUp, Monitor } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [tableMap, setTableMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(new Set());
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
    // Auto-poll every 8 seconds to catch kitchen status changes
    const interval = setInterval(loadOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const [ordersRes, tablesRes] = await Promise.all([
        ordersAPI.getAll(),
        tablesAPI.getAll(),
      ]);
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      const tables = Array.isArray(tablesRes.data) ? tablesRes.data : [];
      const map = {};
      tables.forEach(t => { map[t.id] = t; });
      setTableMap(map);
    } catch (err) {
      if (loading) toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToKitchen = async (orderIdVal) => {
    try {
      await ordersAPI.sendToKitchen(orderIdVal);
      toast.success('Sent to kitchen');
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send');
    }
  };

  const toggleExpand = (id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Filter orders
  const filtered = filter === 'all' ? orders
    : filter === 'active' ? orders.filter(o => !['paid', 'cancelled'].includes(o.status))
    : orders.filter(o => o.status === filter);

  const activeCount = orders.filter(o => !['paid', 'cancelled'].includes(o.status)).length;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700, fontStyle: 'italic' }}>All Orders</h1>
            <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>
              {orders.length} total • {activeCount} active
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginLeft: '0.75rem', fontSize: '0.6875rem', color: 'var(--success)' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }} />
                Live updates
              </span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => window.open('/kitchen-display', '_blank')}>
              <Monitor size={14} /> Kitchen Display
            </button>
            <button className="btn btn-secondary btn-sm" onClick={loadOrders}><RefreshCw size={14} /> Refresh</button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="tab-group" style={{ marginBottom: '1.5rem', maxWidth: '500px' }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'active', label: `Active (${activeCount})` },
            { key: 'paid', label: 'Paid' },
          ].map(f => (
            <button key={f.key} className={`tab-item ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: '140px', borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', padding: '4rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>No orders found</p>
            <button className="btn btn-primary" onClick={() => navigate('/floor')}>Go to Floor Plan</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map((order) => {
              const isExpanded = expanded.has(order.order_id);
              const isActive = !['paid', 'cancelled'].includes(order.status);

              return (
                <div key={order.order_id} style={{
                  background: 'var(--surface-container-low)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                }}>
                  {/* Main Row */}
                  <div style={{
                    padding: '1.25rem 1.5rem',
                    display: 'flex', alignItems: 'center', gap: '1.25rem',
                    cursor: 'pointer',
                  }}
                    onClick={() => toggleExpand(order.order_id)}
                  >
                    {/* Table image */}
                    <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-sm)', background: 'var(--surface-container-highest)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      <img
                        src={`/tables/table-${tableMap[order.table_id]?.seats || 4}.png`}
                        alt={`Table ${order.table_id}`}
                        style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<span style="font-family:var(--font-serif);font-weight:700;font-size:0.75rem;color:var(--on-surface-variant)">${order.table_id}</span>`;
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <h3 className="title-md">{tableMap[order.table_id]?.name || `Table ${order.table_id}`}</h3>
                        <span className={`status-pill ${order.status === 'paid' ? 'status-paid' : order.status === 'to_cook' || order.status === 'preparing' ? 'status-available' : 'status-pending'}`}>
                          {order.status === 'to_cook' ? 'In Kitchen' : order.status}
                        </span>
                        {isActive && (
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }} />
                        )}
                      </div>
                      <p className="label-sm">
                        {(order.items || []).length} items •
                        {order.created_at ? ` ${new Date(order.created_at).toLocaleString()}` : ''}
                      </p>
                    </div>

                    {/* Amount */}
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                      ₹{parseFloat(order.total_amount || 0).toFixed(2)}
                    </span>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
                      {order.status === 'created' && (
                        <button onClick={() => handleSendToKitchen(order.order_id)} className="btn btn-secondary btn-sm"><Send size={12} /> Kitchen</button>
                      )}
                      {order.status !== 'paid' && (
                        <button onClick={() => navigate(`/payment/${order.order_id}`)} className="btn btn-primary btn-sm"><CreditCard size={12} /> Pay</button>
                      )}
                    </div>

                    {/* Expand toggle */}
                    {isExpanded ? <ChevronUp size={18} style={{ color: 'var(--outline)' }} /> : <ChevronDown size={18} style={{ color: 'var(--outline)' }} />}
                  </div>

                  {/* Expanded: Progress Bar + Items */}
                  {isExpanded && (
                    <div style={{
                      padding: '0 1.5rem 1.5rem',
                      animation: 'slideUp 0.2s ease',
                    }}>
                      {/* Live Progress Bar */}
                      <div style={{
                        background: 'var(--surface)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1.25rem 1.5rem',
                        marginBottom: '1rem',
                      }}>
                        <p className="label-sm" style={{ marginBottom: '0.875rem', fontWeight: 700 }}>Order Progress</p>
                        <OrderProgress status={order.status} />
                      </div>

                      {/* Items list */}
                      {(order.items || []).length > 0 && (
                        <div style={{
                          background: 'var(--surface)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem 1.25rem',
                        }}>
                          <p className="label-sm" style={{ marginBottom: '0.625rem', fontWeight: 700 }}>Items</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {(order.items || []).map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.375rem 0' }}>
                                <span style={{ fontSize: '0.9375rem' }}>
                                  <strong style={{ color: 'var(--primary)' }}>{item.quantity}x</strong> {item.name}
                                </span>
                                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>₹{(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}