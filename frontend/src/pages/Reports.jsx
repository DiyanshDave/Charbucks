import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { reportsAPI } from '../config/api';
import toast from 'react-hot-toast';
import { Download, Filter, DollarSign, ShoppingBag, TrendingUp, FileSpreadsheet, FileText } from 'lucide-react';

const settingsTabs = [
  { key: 'products', label: 'Products', path: '/products' },
  { key: 'tables', label: 'Tables', path: '/tables' },
  { key: 'sessions', label: 'Sessions', path: '/sessions' },
  { key: 'reports', label: 'Reports', path: '/reports' },
];

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from: '', to: '', status: '', productId: '', sessionId: '' });
  const [showExport, setShowExport] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { loadReports(); }, []);

  const loadReports = async (params = {}) => {
    setLoading(true);
    try {
      const cleanParams = {};
      Object.entries({ ...filters, ...params }).forEach(([k, v]) => { if (v) cleanParams[k] = v; });
      const res = await reportsAPI.get(cleanParams);
      setData(res.data);
    } catch (err) {
      console.error('Reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => loadReports(filters);
  const handleClear = () => {
    const empty = { from: '', to: '', status: '', productId: '', sessionId: '' };
    setFilters(empty);
    loadReports(empty);
  };

  const summary = data?.summary || {};
  const orders = data?.orders || [];
  const bestSelling = data?.bestSellingProducts || [];

  // ─── EXPORT TO CSV (Excel) ───
  const exportCSV = () => {
    if (orders.length === 0) return toast.error('No data to export');

    const headers = ['Order ID', 'Table', 'Total Amount', 'Status', 'Date', 'Items'];
    const rows = orders.map(o => [
      o.order_id,
      o.table_id,
      parseFloat(o.total_amount || 0).toFixed(2),
      o.status,
      o.created_at ? new Date(o.created_at).toLocaleDateString() : '',
      (o.items || []).map(i => `${i.quantity}x ${i.name}`).join('; '),
    ]);

    const csvContent = [
      // Summary row
      `Charbucks POS Report — Generated ${new Date().toLocaleString()}`,
      `Total Revenue,₹${(summary.totalRevenue || 0).toFixed(2)}`,
      `Total Orders,${summary.totalOrders || 0}`,
      `Paid Orders,${summary.paidOrders || 0}`,
      `Pending Orders,${summary.pendingOrders || 0}`,
      '',
      // Best selling
      'Best Selling Products',
      'Product,Quantity Sold,Revenue',
      ...bestSelling.map(p => `${p.name},${p.totalQuantity},₹${(p.totalRevenue || 0).toFixed(2)}`),
      '',
      // Orders
      'Order History',
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `charbucks-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported — open in Excel');
    setShowExport(false);
  };

  // ─── EXPORT TO PDF (print) ───
  const exportPDF = () => {
    if (orders.length === 0) return toast.error('No data to export');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Charbucks Report</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #2a2118; max-width: 900px; margin: 0 auto; }
          h1 { font-family: 'Playfair Display', serif; color: #24340c; font-size: 2rem; margin-bottom: 4px; }
          h2 { font-family: 'Playfair Display', serif; color: #24340c; font-size: 1.25rem; margin-top: 2rem; margin-bottom: 0.75rem; }
          .subtitle { color: #7a6f60; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 1.5rem; }
          .stats { display: flex; gap: 1.5rem; margin-bottom: 2rem; }
          .stat { background: #fff2df; border-radius: 12px; padding: 1rem 1.5rem; flex: 1; }
          .stat-value { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; }
          .stat-label { font-size: 0.625rem; text-transform: uppercase; letter-spacing: 0.06em; color: #7a6f60; margin-top: 0.25rem; }
          table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
          th { text-align: left; padding: 0.625rem 0.75rem; background: #f2ddc0; font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 700; }
          td { padding: 0.625rem 0.75rem; border-bottom: 1px solid #f2ddc0; }
          .paid { color: #3d7a2a; font-weight: 600; }
          .pending { color: #c28a00; font-weight: 600; }
          .footer { margin-top: 3rem; text-align: center; color: #7a6f60; font-size: 0.6875rem; border-top: 1px solid #f2ddc0; padding-top: 1rem; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>Charbucks — Sales Report</h1>
        <p class="subtitle">Generated on ${new Date().toLocaleString()}</p>

        <div class="stats">
          <div class="stat"><div class="stat-value">₹${(summary.totalRevenue || 0).toFixed(2)}</div><div class="stat-label">Total Revenue</div></div>
          <div class="stat"><div class="stat-value">${summary.totalOrders || 0}</div><div class="stat-label">Total Orders</div></div>
          <div class="stat"><div class="stat-value">${summary.paidOrders || 0}</div><div class="stat-label">Paid</div></div>
          <div class="stat"><div class="stat-value">${summary.pendingOrders || 0}</div><div class="stat-label">Pending</div></div>
        </div>

        ${bestSelling.length > 0 ? `
          <h2>Best Selling Products</h2>
          <table>
            <thead><tr><th>Product</th><th>Qty Sold</th><th>Revenue</th></tr></thead>
            <tbody>
              ${bestSelling.map(p => `<tr><td>${p.name}</td><td>${p.totalQuantity}</td><td>₹${(p.totalRevenue || 0).toFixed(2)}</td></tr>`).join('')}
            </tbody>
          </table>
        ` : ''}

        <h2>Order History</h2>
        <table>
          <thead><tr><th>Order ID</th><th>Table</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            ${orders.map(o => `
              <tr>
                <td>${o.order_id}</td>
                <td>${o.table_id}</td>
                <td>₹${parseFloat(o.total_amount || 0).toFixed(2)}</td>
                <td class="${o.status === 'paid' ? 'paid' : 'pending'}">${o.status}</td>
                <td>${o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">Charbucks Fine Dining POS • Confidential</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
    toast.success('PDF ready — use Print → Save as PDF');
    setShowExport(false);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="tab-group" style={{ marginBottom: '2rem', maxWidth: '500px' }}>
          {settingsTabs.map(tab => (
            <button key={tab.key} className={`tab-item ${tab.key === 'reports' ? 'active' : ''}`} onClick={() => navigate(tab.path)}>{tab.label}</button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, fontStyle: 'italic' }}>Reports & Analytics</h1>
            <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>Sales performance and order insights</p>
          </div>
          <div style={{ position: 'relative' }}>
            <button className="btn btn-secondary" onClick={() => setShowExport(!showExport)}>
              <Download size={14} /> Export
            </button>
            {/* Export dropdown */}
            {showExport && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
                background: 'var(--surface)', borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-float)', overflow: 'hidden', zIndex: 50, minWidth: '200px',
              }}>
                <button onClick={exportCSV} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem',
                  background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                  fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--on-surface)',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-container-low)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <FileSpreadsheet size={16} style={{ color: 'var(--success)' }} />
                  <div>
                    <p style={{ fontWeight: 600 }}>Export as Excel (CSV)</p>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--on-surface-variant)' }}>Opens in Excel, Google Sheets</p>
                  </div>
                </button>
                <button onClick={exportPDF} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem',
                  background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                  fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--on-surface)',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-container-low)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <FileText size={16} style={{ color: 'var(--tertiary)' }} />
                  <div>
                    <p style={{ fontWeight: 600 }}>Export as PDF</p>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--on-surface-variant)' }}>Styled report, print-ready</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Revenue', value: `₹${(summary.totalRevenue || 0).toFixed(2)}`, icon: DollarSign, color: 'var(--primary)' },
            { label: 'Total Orders', value: summary.totalOrders || 0, icon: ShoppingBag, color: 'var(--secondary)' },
            { label: 'Paid Orders', value: summary.paidOrders || 0, icon: TrendingUp, color: 'var(--success)' },
            { label: 'Pending', value: summary.pendingOrders || 0, icon: ShoppingBag, color: 'var(--tertiary)' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <Icon size={18} style={{ color: s.color }} />
                </div>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 700 }}>{s.value}</p>
                <p className="label-sm">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Filter size={16} style={{ color: 'var(--on-surface-variant)' }} />
            <span className="label-lg" style={{ color: 'var(--on-surface-variant)' }}>Filters</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', alignItems: 'end' }}>
            <div className="input-group"><label>From</label><input type="date" className="input-field" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} /></div>
            <div className="input-group"><label>To</label><input type="date" className="input-field" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} /></div>
            <div className="input-group"><label>Status</label>
              <select className="input-field" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                <option value="">All</option><option value="paid">Paid</option><option value="created">Created</option><option value="to_cook">To Cook</option><option value="preparing">Preparing</option><option value="completed">Completed</option>
              </select>
            </div>
            <div className="input-group"><label>Session ID</label><input className="input-field" placeholder="e.g., sess123" value={filters.sessionId} onChange={e => setFilters({ ...filters, sessionId: e.target.value })} /></div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary btn-sm" onClick={handleFilter} style={{ flex: 1 }}>Apply</button>
              <button className="btn btn-ghost btn-sm" onClick={handleClear}>Clear</button>
            </div>
          </div>
        </div>

        {/* Best Selling */}
        {bestSelling.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 600, fontStyle: 'italic', marginBottom: '1rem' }}>Best Selling Products</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {bestSelling.slice(0, 6).map((p, i) => (
                <div key={i} style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', minWidth: '2rem' }}>#{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</p>
                    <p className="label-sm">{p.totalQuantity} sold • ₹{(p.totalRevenue || 0).toFixed(0)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Table */}
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 600, fontStyle: 'italic', marginBottom: '1rem' }}>Order History</h2>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: '56px', borderRadius: 'var(--radius-sm)' }} />)}
          </div>
        ) : orders.length === 0 ? (
          <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--on-surface-variant)' }}>No orders found</p>
          </div>
        ) : (
          <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', padding: '0.875rem 1.5rem', background: 'var(--surface-container)' }}>
              {['Order ID', 'Table', 'Total', 'Status', 'Date'].map(h => <span key={h} className="label-sm" style={{ fontWeight: 700 }}>{h}</span>)}
            </div>
            {orders.map((order, idx) => (
              <div key={order.order_id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', padding: '0.875rem 1.5rem', background: idx % 2 === 0 ? 'transparent' : 'var(--surface-container-low)' }}>
                <span className="body-md" style={{ fontWeight: 500 }}>{order.order_id}</span>
                <span className="body-md">{order.table_id}</span>
                <span style={{ fontWeight: 600 }}>₹{parseFloat(order.total_amount || 0).toFixed(2)}</span>
                <span><span className={`status-pill ${order.status === 'paid' ? 'status-paid' : 'status-pending'}`}>{order.status}</span></span>
                <span className="body-md" style={{ color: 'var(--on-surface-variant)' }}>{order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}