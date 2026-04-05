import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { productsAPI } from '../config/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Package, X } from 'lucide-react';

const settingsTabs = [
  { key: 'products', label: 'Products', path: '/products' },
  { key: 'tables', label: 'Tables', path: '/tables' },
  { key: 'sessions', label: 'Sessions', path: '/sessions' },
  { key: 'reports', label: 'Reports', path: '/reports' },
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  // Backend requires: id, name, price, category (all required)
  const [form, setForm] = useState({ id: '', name: '', category: '', price: '' });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const res = await productsAPI.getAll();
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.id || !form.name || !form.price || !form.category) {
      return toast.error('All fields are required (ID, Name, Price, Category)');
    }
    setSaving(true);
    try {
      await productsAPI.create({
        id: form.id,
        name: form.name,
        price: parseFloat(form.price),
        category: form.category,
      });
      toast.success('Product created');
      setShowModal(false);
      setForm({ id: '', name: '', category: '', price: '' });
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productsAPI.delete(id);
      toast.success('Product deleted');
      loadProducts();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="tab-group" style={{ marginBottom: '2rem', maxWidth: '500px' }}>
          {settingsTabs.map(tab => (
            <button key={tab.key} className={`tab-item ${tab.key === 'products' ? 'active' : ''}`} onClick={() => navigate(tab.path)}>{tab.label}</button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, fontStyle: 'italic' }}>Product Management</h1>
            <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>{products.length} items in your menu</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Product</button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: '80px', borderRadius: 'var(--radius-md)' }} />)}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)' }}>
            <Package size={48} style={{ color: 'var(--outline)', marginBottom: '1rem' }} />
            <h3 className="title-lg" style={{ marginBottom: '0.5rem' }}>No Products</h3>
            <p style={{ color: 'var(--on-surface-variant)' }}>Add your first menu item</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {products.map(product => (
              <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', padding: '1rem 1.5rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, var(--primary), var(--primary-container))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'rgba(255,248,242,0.3)', fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.25rem' }}>{product.name?.charAt(0)}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 className="title-md" style={{ marginBottom: '0.125rem' }}>{product.name}</h3>
                  <p className="label-sm">{(product.category || 'other').toUpperCase()} • ID: {product.id}</p>
                </div>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginRight: '1rem' }}>₹{parseFloat(product.price || 0).toFixed(2)}</span>
                <button onClick={() => handleDelete(product.id)} style={{ background: 'none', border: 'none', color: 'var(--tertiary)', cursor: 'pointer', padding: '0.5rem' }}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700 }}>New Product</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="input-group">
                    <label>Product ID</label>
                    <input className="input-field" placeholder="e.g., p1, pizza01" value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>Category</label>
                    <input className="input-field" placeholder="e.g., Pizza" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                  </div>
                </div>
                <div className="input-group" style={{ marginBottom: '1rem' }}>
                  <label>Product Name</label>
                  <input className="input-field" placeholder="e.g., Truffle Mushroom Pizza" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                  <label>Price (₹)</label>
                  <input type="number" step="0.01" className="input-field" placeholder="24.00" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" disabled={saving} style={{ width: '100%' }}>{saving ? 'Creating...' : 'Create Product'}</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}