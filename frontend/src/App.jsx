import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import FloorPlan from './pages/FloorPlan';
import Order from './pages/Order';
import Payment from './pages/Payment';
import Kitchen from './pages/Kitchen';
import StationView from './pages/StationView';
import KitchenDisplay from './pages/KitchenDisplay';
import Products from './pages/Products';
import Tables from './pages/Tables';
import Sessions from './pages/Sessions';
import Reports from './pages/Reports';
import Orders from './pages/Orders';

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return token ? children : <Navigate to="/login" />;
}

function GoogleCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    const token = params.get('token');
    const userStr = params.get('user');
    if (token) {
      let user = {};
      try { user = JSON.parse(decodeURIComponent(userStr)); } catch {}
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = '/dashboard';
    } else {
      navigate('/login', { replace: true });
    }
  }, []);
  return <LoadingScreen />;
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--primary)' }}>Charbucks</h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'var(--font-sans)', borderRadius: '1rem', background: 'var(--surface-container-low)', color: 'var(--on-surface)' } }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<GoogleCallback />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />

          {/* Standalone Kitchen Display — no sidebar, for kitchen TV */}
          <Route path="/kitchen-display" element={<KitchenDisplay />} />

          <Route path="/floor" element={<PrivateRoute><FloorPlan /></PrivateRoute>} />
          <Route path="/order/:tableId" element={<PrivateRoute><Order /></PrivateRoute>} />
          <Route path="/payment/:orderId" element={<PrivateRoute><Payment /></PrivateRoute>} />
          <Route path="/kitchen" element={<PrivateRoute><Kitchen /></PrivateRoute>} />
          <Route path="/station-view" element={<PrivateRoute><StationView /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
          <Route path="/tables" element={<PrivateRoute><Tables /></PrivateRoute>} />
          <Route path="/sessions" element={<PrivateRoute><Sessions /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/floor" />} />
          <Route path="*" element={<Navigate to="/floor" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}