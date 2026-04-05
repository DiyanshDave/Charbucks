import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { kitchenAPI } from '../config/api';
import toast from 'react-hot-toast';
import {
  ChefHat, Flame, Coffee, CakeSlice, Salad, Clock,
  ArrowLeft, CheckCircle2, Circle, Timer, Bell, Beef, Wine
} from 'lucide-react';

// Station config — map product categories to kitchen stations
const STATIONS = [
  { id: 'grill', label: 'Grill Station', icon: Flame, color: '#c24400', bgColor: 'rgba(194,68,0,0.08)' },
  { id: 'mains', label: 'Main Kitchen', icon: ChefHat, color: '#24340c', bgColor: 'rgba(36,52,12,0.08)' },
  { id: 'fry', label: 'Fry Station', icon: Beef, color: '#8a5a00', bgColor: 'rgba(138,90,0,0.08)' },
  { id: 'beverages', label: 'Beverage Bar', icon: Coffee, color: '#5c3d1e', bgColor: 'rgba(92,61,30,0.08)' },
  { id: 'dessert', label: 'Pastry & Dessert', icon: CakeSlice, color: '#660013', bgColor: 'rgba(102,0,19,0.08)' },
  { id: 'salads', label: 'Cold Station', icon: Salad, color: '#2d6a1e', bgColor: 'rgba(45,106,30,0.08)' },
];

// Map product category keywords to stations
function getStation(itemName, category) {
  const name = (itemName || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  if (cat.includes('drink') || cat.includes('beverage') || cat.includes('coffee') || cat.includes('tea') || cat.includes('juice') || name.includes('latte') || name.includes('coffee') || name.includes('tea') || name.includes('juice') || name.includes('water') || name.includes('soda') || name.includes('smoothie')) return 'beverages';
  if (cat.includes('dessert') || cat.includes('sweet') || cat.includes('cake') || name.includes('cake') || name.includes('ice cream') || name.includes('brownie') || name.includes('pudding') || name.includes('cookie')) return 'dessert';
  if (cat.includes('salad') || cat.includes('cold') || name.includes('salad') || name.includes('coleslaw') || name.includes('raita')) return 'salads';
  if (cat.includes('grill') || name.includes('steak') || name.includes('bbq') || name.includes('grill') || name.includes('kebab') || name.includes('tandoori') || name.includes('tikka')) return 'grill';
  if (cat.includes('fry') || cat.includes('snack') || name.includes('fries') || name.includes('fried') || name.includes('nuggets') || name.includes('wings') || name.includes('pakora') || name.includes('samosa')) return 'fry';
  return 'mains';
}

export default function StationView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedItems, setCompletedItems] = useState(new Set());
  const [now, setNow] = useState(Date.now());
  const navigate = useNavigate();

  const loadOrders = useCallback(async () => {
    try {
      const res = await kitchenAPI.getOrders();
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Station view load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => { clearInterval(interval); clearInterval(timer); };
  }, [loadOrders]);

  // Flatten all items across all orders, tag each with order info
  const allItems = [];
  orders.forEach(order => {
    (order.items || []).forEach((item, idx) => {
      allItems.push({
        ...item,
        order_id: order.order_id,
        table_id: order.table_id,
        table_name: order.table_name,
        order_status: order.status,
        order_created: order.created_at,
        itemKey: `${order.order_id}_${idx}`,
        station: getStation(item.name, item.category),
      });
    });
  });

  // Group by station
  const stationGroups = {};
  STATIONS.forEach(s => { stationGroups[s.id] = []; });
  allItems.forEach(item => {
    if (stationGroups[item.station]) {
      stationGroups[item.station].push(item);
    } else {
      stationGroups['mains'].push(item);
    }
  });

  // Active stations (have items)
  const activeStations = STATIONS.filter(s => stationGroups[s.id].length > 0);
  const emptyStations = STATIONS.filter(s => stationGroups[s.id].length === 0);

  const toggleItemDone = (itemKey) => {
    setCompletedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemKey)) next.delete(itemKey);
      else next.add(itemKey);
      return next;
    });
  };

  const handleMarkOrderDone = async (orderId) => {
    try {
      // Check if all items for this order are marked done
      const orderItems = allItems.filter(i => i.order_id === orderId);
      const allDone = orderItems.every(i => completedItems.has(i.itemKey));
      if (!allDone) {
        toast.error('Mark all items as done first');
        return;
      }
      const order = orders.find(o => o.order_id === orderId);
      const nextStatus = order?.status === 'to_cook' ? 'preparing' : 'completed';
      await kitchenAPI.updateStatus(orderId, { status: nextStatus });
      toast.success(`Order moved to ${nextStatus}`);
      // Clear completed items for this order
      setCompletedItems(prev => {
        const next = new Set(prev);
        orderItems.forEach(i => next.delete(i.itemKey));
        return next;
      });
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    }
  };

  const getElapsed = (createdAt) => {
    if (!createdAt) return '';
    const diff = Math.floor((now - new Date(createdAt).getTime()) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const getUrgency = (createdAt) => {
    if (!createdAt) return 'normal';
    const mins = Math.floor((now - new Date(createdAt).getTime()) / 60000);
    if (mins >= 20) return 'critical';
    if (mins >= 10) return 'warning';
    return 'normal';
  };

  const totalItems = allItems.length;
  const doneCount = allItems.filter(i => completedItems.has(i.itemKey)).length;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{ background: 'var(--surface)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <button onClick={() => navigate('/kitchen')} className="btn btn-ghost btn-sm" style={{ padding: '0.25rem 0', marginBottom: '0.5rem' }}>
              <ArrowLeft size={16} /> Back to Kitchen
            </button>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700, fontStyle: 'italic', marginBottom: '0.25rem' }}>
              Station View
            </h1>
            <p className="label-sm">{totalItems} items across {activeStations.length} stations • {doneCount} completed</p>
          </div>

          {/* Live progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '200px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                <span className="label-sm">Progress</span>
                <span className="label-sm" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  {totalItems > 0 ? Math.round((doneCount / totalItems) * 100) : 0}%
                </span>
              </div>
              <div style={{ height: '6px', background: 'var(--surface-container-low)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '3px',
                  background: 'linear-gradient(90deg, var(--primary), var(--success))',
                  width: `${totalItems > 0 ? (doneCount / totalItems) * 100 : 0}%`,
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={loadOrders}>
              <Timer size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* Station Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {[0, 1, 2].map(i => <div key={i} className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : activeStations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)' }}>
            <ChefHat size={48} style={{ color: 'var(--outline)', marginBottom: '1rem' }} />
            <h3 className="title-lg" style={{ marginBottom: '0.5rem' }}>All Clear</h3>
            <p style={{ color: 'var(--on-surface-variant)' }}>No active orders in the kitchen right now.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {activeStations.map(station => {
              const Icon = station.icon;
              const items = stationGroups[station.id];
              const stationDone = items.filter(i => completedItems.has(i.itemKey)).length;

              return (
                <div key={station.id} style={{
                  background: 'var(--surface-container-low)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  {/* Station Header */}
                  <div style={{
                    padding: '1.25rem 1.5rem',
                    background: station.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.875rem',
                  }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: 'var(--radius-sm)',
                      background: 'var(--surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: 'var(--shadow-soft)',
                    }}>
                      <Icon size={22} style={{ color: station.color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: station.color, marginBottom: '0.125rem' }}>
                        {station.label}
                      </h3>
                      <p className="label-sm" style={{ color: 'var(--on-surface-variant)' }}>
                        {items.length} items • {stationDone} done
                      </p>
                    </div>
                    {/* Station mini progress */}
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: `conic-gradient(${station.color} ${items.length > 0 ? (stationDone / items.length) * 360 : 0}deg, var(--surface-container) 0deg)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{
                        width: '30px', height: '30px', borderRadius: '50%',
                        background: station.bgColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.625rem', fontWeight: 800, color: station.color,
                      }}>
                        {stationDone}/{items.length}
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {items.map(item => {
                      const isDone = completedItems.has(item.itemKey);
                      const urgency = getUrgency(item.order_created);
                      const elapsed = getElapsed(item.order_created);

                      return (
                        <div
                          key={item.itemKey}
                          onClick={() => toggleItemDone(item.itemKey)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.875rem',
                            padding: '0.875rem 1rem',
                            background: isDone ? 'rgba(61,122,42,0.06)' : 'var(--surface)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            opacity: isDone ? 0.5 : 1,
                            borderLeft: isDone
                              ? '3px solid var(--success)'
                              : urgency === 'critical'
                                ? '3px solid var(--tertiary)'
                                : urgency === 'warning'
                                  ? '3px solid var(--warning)'
                                  : '3px solid transparent',
                          }}
                        >
                          {/* Check circle */}
                          {isDone
                            ? <CheckCircle2 size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
                            : <Circle size={20} style={{ color: 'var(--outline)', flexShrink: 0 }} />
                          }

                          {/* Item info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              fontSize: '0.9375rem', fontWeight: 600,
                              textDecoration: isDone ? 'line-through' : 'none',
                              color: isDone ? 'var(--on-surface-variant)' : 'var(--on-surface)',
                            }}>
                              {item.quantity}x {item.name}
                            </p>
                            <p className="label-sm" style={{ fontSize: '0.625rem' }}>
                              {item.table_name || `Table ${item.table_id}`} • Order {item.order_id.slice(-6)}
                            </p>
                          </div>

                          {/* Timer */}
                          {!isDone && (
                            <span style={{
                              fontSize: '0.6875rem', fontWeight: 700, fontFamily: 'var(--font-sans)',
                              padding: '0.2rem 0.5rem', borderRadius: '999px',
                              background: urgency === 'critical' ? 'var(--tertiary)'
                                : urgency === 'warning' ? 'var(--warning)'
                                : 'var(--primary)',
                              color: 'white',
                              fontVariantNumeric: 'tabular-nums',
                            }}>
                              {elapsed}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Station Footer - Mark orders complete */}
                  {stationDone > 0 && (
                    <div style={{ padding: '0.75rem 1rem', background: 'var(--surface-container)' }}>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--on-surface-variant)', textAlign: 'center' }}>
                        Tap items to mark done • {stationDone} of {items.length} complete
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Empty stations shown as dimmed */}
            {emptyStations.map(station => {
              const Icon = station.icon;
              return (
                <div key={station.id} style={{
                  background: 'var(--surface-container-low)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2rem',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  opacity: 0.35, minHeight: '200px',
                }}>
                  <Icon size={28} style={{ color: station.color, marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: station.color }}>{station.label}</p>
                  <p className="label-sm" style={{ marginTop: '0.25rem' }}>No active items</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating action: mark all done for an order */}
        {orders.length > 0 && (
          <div style={{
            position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center',
            zIndex: 50,
          }}>
            {orders.map(order => {
              const orderItems = allItems.filter(i => i.order_id === order.order_id);
              const allDone = orderItems.length > 0 && orderItems.every(i => completedItems.has(i.itemKey));
              if (!allDone) return null;
              return (
                <button
                  key={order.order_id}
                  onClick={() => handleMarkOrderDone(order.order_id)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-xl)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-float)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    animation: 'slideUp 0.3s ease',
                  }}
                >
                  <Bell size={14} />
                  Complete {order.table_name || `Table ${order.table_id}`}
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}