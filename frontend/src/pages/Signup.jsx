import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error('Please fill all fields');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await signup(name, email, password);
      toast.success('Account created!');
      navigate('/floor');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--surface-container)' }}>
      <div style={{ flex:'0 0 45%', background:'linear-gradient(160deg, var(--surface-container) 0%, var(--surface-container-high) 100%)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'relative', zIndex:1 }}>
          <svg width="280" height="440" viewBox="0 0 280 440" fill="none">
            <path d="M40 440V180C40 80.589 100.589 20 200 20H140C240.411 20 240 80.589 240 180V440H40Z" fill="var(--primary)" />
            <path d="M60 440V190C60 100.589 96.589 50 140 50C183.411 50 220 100.589 220 190V440H60Z" fill="#1e2d0a" opacity="0.5" />
            <circle cx="190" cy="280" r="8" fill="var(--surface-container)" />
          </svg>
        </div>
      </div>
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
        <div style={{ width:'100%', maxWidth:'420px', background:'var(--surface)', borderRadius:'var(--radius-lg)', padding:'3rem 2.5rem', boxShadow:'var(--shadow-card)' }}>
          <div style={{ textAlign:'center', marginBottom:'2rem' }}>
            <div style={{ width:'80px',height:'80px',borderRadius:'50%',background:'var(--primary)',margin:'0 auto 1rem',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <span style={{ color:'var(--on-primary)',fontSize:'2rem',fontFamily:'var(--font-serif)',fontWeight:700 }}>C</span>
            </div>
            <h1 style={{ fontFamily:'var(--font-serif)',fontSize:'2rem',fontWeight:600,fontStyle:'italic',color:'var(--primary)',marginBottom:'0.25rem' }}>Charbucks</h1>
            <p style={{ fontSize:'0.6875rem',fontWeight:600,letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--on-surface-variant)' }}>Create Your Account</p>
          </div>
          <div className="tab-group" style={{ marginBottom:'2rem' }}>
            <Link to="/login" className="tab-item" style={{ textDecoration:'none',textAlign:'center' }}>Login</Link>
            <div className="tab-item active">Signup</div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="input-group" style={{ marginBottom:'1.25rem' }}>
              <label>Full Name</label>
              <div style={{ position:'relative' }}>
                <User size={16} style={{ position:'absolute',left:'1rem',top:'50%',transform:'translateY(-50%)',color:'var(--outline)' }} />
                <input type="text" className="input-field" style={{ paddingLeft:'2.75rem' }} placeholder="Julian Sinclair" value={name} onChange={e=>setName(e.target.value)} />
              </div>
            </div>
            <div className="input-group" style={{ marginBottom:'1.25rem' }}>
              <label>Email Address</label>
              <div style={{ position:'relative' }}>
                <Mail size={16} style={{ position:'absolute',left:'1rem',top:'50%',transform:'translateY(-50%)',color:'var(--outline)' }} />
                <input type="email" className="input-field" style={{ paddingLeft:'2.75rem' }} placeholder="julian@charbucks.com" value={email} onChange={e=>setEmail(e.target.value)} />
              </div>
            </div>
            <div className="input-group" style={{ marginBottom:'2rem' }}>
              <label>Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={16} style={{ position:'absolute',left:'1rem',top:'50%',transform:'translateY(-50%)',color:'var(--outline)' }} />
                <input type={showPw?'text':'password'} className="input-field" style={{ paddingLeft:'2.75rem',paddingRight:'2.75rem' }} placeholder="Min. 6 characters" value={password} onChange={e=>setPassword(e.target.value)} />
                <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute',right:'0.75rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--outline)',cursor:'pointer' }}>
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-tertiary btn-lg" disabled={loading} style={{ width:'100%' }}>
              {loading ? 'Creating...' : 'Create Account'} <ArrowRight size={16}/>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}