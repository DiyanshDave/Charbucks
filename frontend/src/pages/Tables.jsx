import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { tablesAPI } from '../config/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit3, X, Users } from 'lucide-react';

const settingsTabs = [
  { key: 'products', label: 'Products', path: '/products' },
  { key: 'tables', label: 'Tables', path: '/tables' },
  { key: 'sessions', label: 'Sessions', path: '/sessions' },
  { key: 'reports', label: 'Reports', path: '/reports' },
];

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTable, setEditTable] = useState(null); // for status edit only
  // Backend create requires: id, name, seats
  const [form, setForm] = useState({ id: '', name: '', seats: '4' });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { loadTables(); }, []);

  const loadTables = async () => {
    try {
      const res = await tablesAPI.getAll();
      setTables(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditTable(null);
    setForm({ id: '', name: '', seats: '4' });
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.id || !form.name || !form.seats) return toast.error('All fields required (ID, Name, Seats)');
    setSaving(true);
    try {
      await tablesAPI.create({ id: form.id, name: form.name, seats: parseInt(form.seats) });
      toast.success('Table created');
      setShowModal(false);
      loadTables();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create table');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (table) => {
    const newStatus = table.status === 'occupied' ? 'available' : 'occupied';
    try {
      // PATCH only accepts { status }
      await tablesAPI.update(table.id, { status: newStatus });
      toast.success(`Table set to ${newStatus}`);
      loadTables();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this table?')) return;
    try {
      await tablesAPI.delete(id);
      toast.success('Table deleted');
      loadTables();
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
            <button key={tab.key} className={`tab-item ${tab.key === 'tables' ? 'active' : ''}`} onClick={() => navigate(tab.path)}>{tab.label}</button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, fontStyle: 'italic' }}>Floor & Table Setup</h1>
            <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>{tables.length} tables configured</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Table</button>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: '160px', borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : tables.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)' }}>
            <Users size={48} style={{ color: 'var(--outline)', marginBottom: '1rem' }} />
            <h3 className="title-lg" style={{ marginBottom: '0.5rem' }}>No Tables</h3>
            <p style={{ color: 'var(--on-surface-variant)' }}>Add tables to start</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {tables.map(table => {
              const isOccupied = table.status === 'occupied';
              return (
                <div key={table.id} style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '2rem', height: '2rem', borderRadius: '50%', background: isOccupied ? 'var(--tertiary)' : 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700 }}>
                    {table.id}
                  </div>
                  <span className={`status-pill ${isOccupied ? 'status-occupied' : 'status-available'}`} style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>
                    {isOccupied ? 'Occupied' : 'Available'}
                  </span>

                  {/* Table image */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem 0' }}>
                    <img
                      src={`/tables/table-${table.seats || 4}.png`}
                      alt={`${table.seats}-seater`}
                      style={{ width: '100px', height: '100px', objectFit: 'contain', opacity: isOccupied ? 0.5 : 0.8 }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>

                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>{table.name}</h3>
                  <p className="label-sm" style={{ marginBottom: '1rem' }}>
                    <Users size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} />{table.seats || 4} Seats
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleToggleStatus(table)} className="btn btn-ghost btn-sm" style={{ flex: 1, padding: '0.4rem' }}>
                      <Edit3 size={12} /> {isOccupied ? 'Free' : 'Occupy'}
                    </button>
                    <button onClick={() => handleDelete(table.id)} style={{ background: 'none', border: 'none', color: 'var(--tertiary)', cursor: 'pointer', padding: '0.4rem' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700 }}>New Table</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div className="input-group">
                    <label>Table ID</label>
                    <input className="input-field" placeholder="e.g., t1" value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>Table Name</label>
                    <input className="input-field" placeholder="e.g., Table 01" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                </div>

                {/* Visual Seat Picker */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="label-sm" style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--on-surface-variant)' }}>Select Seats</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                    {[2, 4, 6, 8].map(seat => {
                      const selected = parseInt(form.seats) === seat;
                      return (
                        <button
                          key={seat}
                          type="button"
                          onClick={() => setForm({ ...form, seats: String(seat) })}
                          style={{
                            padding: '0.75rem 0.5rem',
                            borderRadius: 'var(--radius-md)',
                            border: 'none',
                            background: selected ? 'var(--primary)' : 'var(--surface-container-highest)',
                            color: selected ? 'var(--on-primary)' : 'var(--on-surface)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                          }}
                        >
                          <img
                            src={`/tables/table-${seat}.png`}
                            alt={`${seat}-seater`}
                            style={{
                              width: '48px',
                              height: '48px',
                              objectFit: 'contain',
                              filter: selected ? 'brightness(10)' : 'none',
                              opacity: selected ? 1 : 0.6,
                            }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{seat} Seats</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" disabled={saving} style={{ width: '100%' }}>{saving ? 'Creating...' : 'Create Table'}</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}