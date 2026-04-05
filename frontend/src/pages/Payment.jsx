import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import Sidebar from '../components/Sidebar';
import { ordersAPI, paymentsAPI } from '../config/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Banknote, CreditCard, QrCode, Check, X, FileText, Users } from 'lucide-react';

// Razorpay config from .env
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;
const UPI_ID = import.meta.env.VITE_UPI_ID || '8511862864@fam';
const MERCHANT_NAME = import.meta.env.VITE_MERCHANT_NAME || 'Charbucks';

// Load Razorpay script once
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Payment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => { loadOrder(); }, []);

  const loadOrder = async () => {
    try {
      const res = await ordersAPI.getAll();
      const orders = Array.isArray(res.data) ? res.data : [];
      const found = orders.find(o => o.order_id === orderId);
      setOrder(found);
    } catch (err) {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = parseFloat(order?.total_amount || 0);

  // ─── UPI QR string ───
  const upiQRValue = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Order ' + orderId)}`;

  // ─── CASH PAYMENT ───
  const handleCash = async () => {
    setProcessing(true);
    try {
      await ordersAPI.update(orderId, { status: 'paid' });
      setConfirmed(true);
      toast.success('Cash payment confirmed!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  // ─── RAZORPAY CARD PAYMENT ───
  const handleCard = async () => {
    setProcessing(true);
    try {
      // Step 1: Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Failed to load Razorpay. Check your internet.');
        setProcessing(false);
        return;
      }

      // Step 2: Create Razorpay order via backend
      const createRes = await paymentsAPI.createOrder({ orderId });
      const { razorpayOrderId, amount, currency } = createRes.data;

      // Step 3: Open Razorpay checkout modal
      const options = {
        key: RAZORPAY_KEY,
        amount: amount,
        currency: currency || 'INR',
        name: MERCHANT_NAME,
        description: `Order ${orderId}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          // Step 4: Verify payment on backend
          try {
            await paymentsAPI.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId,
              method: 'Card',
            });
            setConfirmed(true);
            toast.success('Card payment successful!');
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: MERCHANT_NAME,
        },
        theme: {
          color: '#24340c',
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            toast('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        toast.error('Payment failed: ' + (response.error?.description || 'Unknown error'));
        setProcessing(false);
      });
      razorpay.open();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start payment');
      setProcessing(false);
    }
  };

  // ─── UPI QR PAYMENT (manual confirm by cashier after guest scans) ───
  const handleUPIConfirm = async () => {
    setProcessing(true);
    try {
      // Mark order as paid directly (cashier confirms guest has paid via QR)
      await ordersAPI.update(orderId, { status: 'paid' });
      setConfirmed(true);
      toast.success('UPI payment confirmed!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = (paymentMethod) => {
    if (paymentMethod === 'cash') handleCash();
    else if (paymentMethod === 'card') handleCard();
    else if (paymentMethod === 'upi') handleUPIConfirm();
  };

  // ─── CONFIRMED SCREEN ───
  if (confirmed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', cursor: 'pointer' }}
        onClick={() => navigate('/floor')}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--success)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={48} color="white" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Payment Confirmed</h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '1rem' }}>Tap anywhere to return to Floor View</p>
        </div>
      </div>
    );
  }

  const methods = [
    { key: 'cash', label: 'Cash', desc: 'Settle via Physical Currency', icon: Banknote },
    { key: 'card', label: 'Card / UPI via Razorpay', desc: 'Card, Netbanking, Wallets', icon: CreditCard },
    { key: 'upi', label: 'UPI QR Code', desc: 'Scan & Pay with any UPI app', icon: QrCode },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{ paddingBottom: '5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <div>
            <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: '0.5rem', padding: '0.25rem 0' }}>
              <ArrowLeft size={16} /> Back to Table {order?.table_id || ''}
            </button>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700 }}>Final Settlement</h1>
          </div>
          <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.5rem', textAlign: 'right' }}>
            <p className="label-sm">Total Amount Due</p>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)', lineHeight: 1.1 }}>₹{totalAmount.toFixed(2)}</p>
          </div>
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-lg)' }} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* ── LEFT: Payment Methods ── */}
            <div>
              <p className="label-lg" style={{ marginBottom: '1rem', color: 'var(--on-surface-variant)' }}>Payment Method</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                {methods.map(m => {
                  const Icon = m.icon;
                  const active = method === m.key;
                  return (
                    <button key={m.key} onClick={() => setMethod(m.key)} style={{
                      display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem',
                      background: active ? 'var(--primary)' : 'var(--surface-container-low)',
                      color: active ? 'var(--on-primary)' : 'var(--on-surface)',
                      border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                      transition: 'all 0.2s', textAlign: 'left', width: '100%',
                    }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', background: active ? 'rgba(255,248,242,0.15)' : 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '1rem' }}>{m.label}</p>
                        <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>{m.desc}</p>
                      </div>
                      {active && <Check size={18} style={{ marginLeft: 'auto' }} />}
                    </button>
                  );
                })}
              </div>

              {/* Summary */}
              <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.5rem' }}>
                <p className="label-lg" style={{ marginBottom: '0.75rem', color: 'var(--on-surface-variant)' }}>Summary</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Order Total</span><span style={{ fontWeight: 600 }}>₹{totalAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Order ID</span><span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{orderId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Items</span><span style={{ fontWeight: 600 }}>{(order?.items || []).length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>UPI ID</span><span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{UPI_ID}</span>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Action Area ── */}
            <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>

              {/* ── UPI QR CODE ── */}
              {method === 'upi' ? (
                <>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Scan to Pay</h3>
                  <p style={{ color: 'var(--on-surface-variant)', marginBottom: '0.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    Present this QR to the guest for scanning
                  </p>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem' }}>
                    ₹{totalAmount.toFixed(2)}
                  </p>

                  {/* Real QR Code */}
                  <div style={{
                    background: 'white', borderRadius: 'var(--radius-md)', padding: '1rem',
                    marginBottom: '1rem', boxShadow: 'var(--shadow-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <QRCodeSVG
                      value={upiQRValue}
                      size={200}
                      bgColor="#ffffff"
                      fgColor="#24340c"
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  {/* UPI ID display */}
                  <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                    UPI ID
                  </p>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '1rem' }}>
                    {UPI_ID}
                  </p>

                  {/* Waiting indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--tertiary)', animation: 'pulse 2s infinite' }} />
                    <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.8125rem' }}>
                      Awaiting customer payment...
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => handlePayment('upi')} className="btn btn-primary" disabled={processing}>
                      <Check size={14} /> Payment Received
                    </button>
                    <button onClick={() => setMethod(null)} className="btn btn-ghost">
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </>

              /* ── CARD / RAZORPAY ── */
              ) : method === 'card' ? (
                <>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <CreditCard size={32} style={{ color: 'var(--primary)' }} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Razorpay Checkout</h3>
                  <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                    Card, Netbanking, UPI, Wallets
                  </p>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1.5rem' }}>
                    ₹{totalAmount.toFixed(2)}
                  </p>
                  <button onClick={() => handlePayment('card')} className="btn btn-primary btn-lg" disabled={processing}>
                    {processing ? 'Opening Razorpay...' : 'Pay with Razorpay'}
                  </button>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--on-surface-variant)', marginTop: '1rem' }}>
                    Powered by Razorpay • Secure Payment
                  </p>
                </>

              /* ── CASH ── */
              ) : method === 'cash' ? (
                <>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <Banknote size={32} style={{ color: 'var(--primary)' }} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Cash Payment</h3>
                  <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Collect cash from guest and confirm
                  </p>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1.5rem' }}>
                    ₹{totalAmount.toFixed(2)}
                  </p>
                  <button onClick={() => handlePayment('cash')} className="btn btn-primary btn-lg" disabled={processing}>
                    {processing ? 'Confirming...' : 'Confirm Cash Received'}
                  </button>
                </>

              /* ── NO METHOD SELECTED ── */
              ) : (
                <div style={{ opacity: 0.3, textAlign: 'center' }}>
                  <CreditCard size={48} style={{ marginBottom: '1rem' }} />
                  <p style={{ fontSize: '1rem' }}>Select a payment method</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div style={{ position: 'fixed', bottom: 0, left: 240, right: 0, background: 'var(--surface-container-low)', padding: '1rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-ghost btn-sm"><FileText size={14} /> Preview Bill</button>
            <button className="btn btn-ghost btn-sm"><Users size={14} /> Split Check</button>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--tertiary)' }}><X size={14} /> Void Payment</button>
        </div>
      </main>
    </div>
  );
}