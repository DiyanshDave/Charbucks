import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { productsAPI, ordersAPI } from '../config/api';
import toast from 'react-hot-toast';
import {
  Search, Plus, Minus, ArrowRight, Send, ShoppingBag,
  Utensils, Coffee, CakeSlice, Wine, Beef
} from 'lucide-react';

const categoryIcons = { pizza: Utensils, burger: Beef, coffee: Coffee, dessert: CakeSlice, drinks: Wine };

export default function Order() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const res = await productsAPI.getAll();
      // Backend returns flat array
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(products.map(p => (p.category || 'other').toLowerCase()))];

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'all' || (p.category || '').toLowerCase() === activeCategory;
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(c => c.id === product.id);
      if (exists) return prev.map(c => c.id === product.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQty = (productId, delta) => {
    setCart(prev => prev.map(c => {
      if (c.id === productId) {
        const newQty = c.quantity + delta;
        return newQty > 0 ? { ...c, quantity: newQty } : null;
      }
      return c;
    }).filter(Boolean));
  };

  const subtotal = cart.reduce((sum, c) => sum + (parseFloat(c.price) || 0) * c.quantity, 0);
  const serviceCharge = subtotal * 0.1;
  const total = subtotal + serviceCharge;

  const buildOrderPayload = () => ({
    tableId: tableId,
    items: cart.map(c => ({
      productId: c.id,
      name: c.name,
      price: parseFloat(c.price),
      quantity: c.quantity,
    })),
    totalAmount: total, // Backend expects totalAmount, not total
  });

  const handleCreateOrder = async () => {
    if (cart.length === 0) return toast.error('Cart is empty');
    setSending(true);
    try {
      const res = await ordersAPI.create(buildOrderPayload());
      // Backend returns { orderId, status }
      const orderId = res.data.orderId;
      toast.success('Order created!');
      navigate(`/payment/${orderId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create order');
    } finally {
      setSending(false);
    }
  };

  const handleSendToKitchen = async () => {
    if (cart.length === 0) return toast.error('Cart is empty');
    setSending(true);
    try {
      const res = await ordersAPI.create(buildOrderPayload());
      const orderId = res.data.orderId;
      // Send to kitchen (sets status to 'to_cook')
      await ordersAPI.sendToKitchen(orderId);
      toast.success('Order sent to kitchen!');
      setCart([]);
      navigate('/floor');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send order');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{ display: 'flex', gap: 0, padding: 0, marginLeft: '240px' }}>
        {/* Category Sidebar */}
        <div style={{ width: '200px', background: 'var(--primary)', padding: '2rem 0', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <p className="label-sm" style={{ color: 'rgba(255,248,242,0.4)', padding: '0 1.25rem', marginBottom: '1rem' }}>Categories</p>
          {categories.map(cat => {
            const Icon = categoryIcons[cat] || ShoppingBag;
            const active = activeCategory === cat;
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem',
                background: active ? 'rgba(255,248,242,0.12)' : 'transparent', border: 'none',
                color: active ? '#fff' : 'rgba(255,248,242,0.5)', fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem', fontWeight: active ? 600 : 400, cursor: 'pointer',
                textTransform: 'capitalize', width: '100%', textAlign: 'left',
              }}>
                <Icon size={18} />{cat}
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        <div style={{ flex: 1, padding: '2rem 2.5rem', overflowY: 'auto', height: '100vh' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 600, fontStyle: 'italic', lineHeight: 1.1, marginBottom: '0.25rem' }}>Artisanal Selection</h1>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>Curated flavors for the discerning palate.</p>

          <div style={{ position: 'relative', maxWidth: '300px', marginBottom: '2rem' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
            <input type="text" className="input-field" style={{ paddingLeft: '2.75rem' }} placeholder="Search menu..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: '280px', borderRadius: 'var(--radius-lg)' }} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {filtered.map(product => (
                <div key={product.id} style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', transition: 'transform 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                  <div style={{ height: '160px', background: 'linear-gradient(135deg, var(--primary), var(--primary-container))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'rgba(255,248,242,0.2)' }}>{(product.name || '?').charAt(0)}</span>
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                      <h3 className="title-md">{product.name}</h3>
                      <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>₹{parseFloat(product.price || 0).toFixed(2)}</span>
                    </div>
                    <p className="label-sm" style={{ marginBottom: '1rem' }}>{(product.category || 'item').toUpperCase()}</p>
                    <button onClick={() => addToCart(product)} className="btn btn-primary btn-sm" style={{ width: '100%' }}><Plus size={14} /> Add to Order</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Panel */}
        <div style={{ width: '340px', background: 'var(--surface-container-low)', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700 }}>Your Order</h2>
            <span style={{ background: 'var(--surface-container-highest)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-xl)', fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Table {tableId}
            </span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cart.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                <ShoppingBag size={40} style={{ marginBottom: '0.75rem' }} />
                <p className="body-md">No items yet</p>
              </div>
            ) : cart.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '0.875rem' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, var(--primary), var(--primary-container))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'rgba(255,248,242,0.3)', fontFamily: 'var(--font-serif)', fontSize: '1.25rem' }}>{item.name?.charAt(0)}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                  <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem' }}>₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button onClick={() => updateQty(item.id, -1)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--surface-container-low)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Minus size={12} /></button>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, width: '1.5rem', textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, 1)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--surface-container-low)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus size={12} /></button>
                </div>
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span className="label-sm">Subtotal</span><span style={{ fontWeight: 600 }}>₹{subtotal.toFixed(2)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}><span className="label-sm">Service Charge (10%)</span><span style={{ fontWeight: 600 }}>₹{serviceCharge.toFixed(2)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>₹{total.toFixed(2)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button onClick={handleSendToKitchen} className="btn btn-secondary btn-lg" disabled={sending} style={{ width: '100%' }}><Send size={16} /> Send to Kitchen</button>
                <button onClick={handleCreateOrder} className="btn btn-primary btn-lg" disabled={sending} style={{ width: '100%' }}>Proceed to Payment <ArrowRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}