import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // If already logged in, go to dashboard
  useEffect(() => {
    if (token) navigate('/dashboard');
  }, [token, navigate]);

  // Show Google error if redirected back with error
  useEffect(() => {
    if (searchParams.get('error') === 'google_auth_failed') {
      toast.error('Google login failed. Please try again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = 'http://localhost:3000/api/auth/google';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--surface-container)' }}>
      {/* Left - Illustration */}
      <div style={{
        flex: '0 0 45%',
        background: 'linear-gradient(160deg, var(--surface-container) 0%, var(--surface-container-high) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <svg width="280" height="440" viewBox="0 0 280 440" fill="none">
            <path d="M40 440V180C40 80.589 100.589 20 200 20H140C240.411 20 240 80.589 240 180V440H40Z" fill="var(--primary)" />
            <path d="M60 440V190C60 100.589 96.589 50 140 50C183.411 50 220 100.589 220 190V440H60Z" fill="#1e2d0a" opacity="0.5" />
            <circle cx="190" cy="280" r="8" fill="var(--surface-container)" />
          </svg>
          <div style={{ position: 'absolute', bottom: '90px', left: '-30px', width: '100px', height: '35px', background: 'var(--secondary)', borderRadius: '4px' }}>
            {[0, 20, 40, 60].map((x) => (
              <div key={x} style={{ position: 'absolute', top: '-12px', left: `${x + 8}px`, width: '10px', height: '10px', borderRadius: '50%', background: 'var(--tertiary)' }} />
            ))}
          </div>
        </div>
        <svg style={{ position: 'absolute', top: '60px', left: '60px', opacity: 0.1 }} width="60" height="60" viewBox="0 0 60 60">
          <path d="M30 5C30 5 5 20 5 40C5 50 15 55 30 55C45 55 55 50 55 40C55 20 30 5 30 5Z" fill="var(--primary)" />
        </svg>
        <svg style={{ position: 'absolute', bottom: '100px', right: '80px', opacity: 0.08 }} width="40" height="50" viewBox="0 0 40 50">
          <path d="M20 0C20 0 0 15 0 30C0 40 10 45 20 48C30 45 40 40 40 30C40 15 20 0 20 0Z" fill="var(--primary)" />
        </svg>
      </div>

      {/* Right - Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '420px', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '3rem 2.5rem', boxShadow: 'var(--shadow-card)' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--on-primary)', fontSize: '2rem', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>C</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 600, fontStyle: 'italic', color: 'var(--primary)', marginBottom: '0.25rem' }}>Charbucks</h1>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Digital Maître D'</p>
          </div>

          {/* Tab Switcher */}
          <div className="tab-group" style={{ marginBottom: '2rem' }}>
            <div className="tab-item active">Login</div>
            <Link to="/signup" className="tab-item" style={{ textDecoration: 'none', textAlign: 'center' }}>Signup</Link>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="input-group" style={{ marginBottom: '1.25rem' }}>
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
                <input type="email" className="input-field" style={{ paddingLeft: '2.75rem' }} placeholder="maitred@charbucks.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '2rem' }}>
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
                <input type={showPw ? 'text' : 'password'} className="input-field" style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--outline)', cursor: 'pointer' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-tertiary btn-lg" disabled={loading} style={{ width: '100%', marginBottom: '1.5rem' }}>
              {loading ? 'Entering...' : 'Enter Session'}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--outline-variant)' }} />
            <span style={{ fontSize: '0.6875rem', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--outline-variant)' }} />
          </div>

          {/* Google OAuth */}
          <button onClick={handleGoogleLogin} className="btn btn-secondary" style={{ width: '100%' }}>
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}