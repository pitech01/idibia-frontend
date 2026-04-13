import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import * as Toasts from 'react-hot-toast';
const { Toaster, toast } = Toasts as any;

import Homepage from './app/index'
import Login from './app/auth/Login'
import Register from './app/auth/Register'
import Preloader from './components/Preloader'
import ForgotPassword from './app/auth/ForgotPassword'
import ChangePassword from './app/auth/ChangePassword'
import PatientDashboard from './app/patient/PatientDashboard'
import DoctorDashboard from './app/doctor/DoctorDashboard'
import PendingDashboard from './app/shared/PendingDashboard'
import DoctorVerification from './app/doctor/DoctorVerification'
import AdminLogin from './app/admin/AdminLogin'
import AdminDashboard from './app/admin/AdminDashboard'
import SuperAdminLogin from './app/admin/SuperAdminLogin'
import SuperAdminDashboard from './app/admin/SuperAdminDashboard'
import { api } from './services'
import './index.css'

function App() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'patient' | 'doctor' | 'nurse' | 'admin' | 'super-admin'>(() => {
    const savedRole = localStorage.getItem('userRole');
    return (savedRole as any) || 'patient';
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/user');
        setCurrentUser(response.data);
        setUserRole(response.data.role);
      } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    localStorage.setItem('userRole', userRole);
  }, [userRole]);

  useEffect(() => {
    // Handle password reset token
    const params = new URLSearchParams(window.location.search);
    if (params.get('token') && location.pathname.includes('reset-password')) {
      navigate('/reset-password' + window.location.search);
    }

    // Handle email verification
    if (params.get('verified') === '1') {
      toast.success('Email verified successfully! Please login.');
      navigate('/login');
    }
  }, [location, navigate]);

  const handleLoginSuccess = (role: 'patient' | 'doctor' | 'nurse' | 'admin' | 'super-admin', isCompleted: boolean = true, isVerified: boolean = true, userData?: any) => {
    setUserRole(role);
    if (userData) {
      setCurrentUser(userData);
    } else {
      api.get('/user').then(res => setCurrentUser(res.data));
    }

    if (!isCompleted) {
      navigate('/register');
      toast('Please complete your profile registration.', { icon: '📝' });
      return;
    }

    if (role === 'patient') {
      navigate('/patient/dashboard');
    } else if (role === 'doctor') {
      if (isVerified) {
        navigate('/doctor/dashboard');
      } else {
        navigate('/pending-dashboard');
      }
    } else if (role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role === 'super-admin') {
      navigate('/super-admin/dashboard');
    } else {
      navigate('/pending-dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setCurrentUser(null);
    navigate('/login');
  };

  if (loading) {
    return <Preloader />;
  }

  return (
    <>
      <Toaster
        position="top-right"
        containerStyle={{
          zIndex: 99999,
        }}
      />
      <Routes>
        <Route path="/" element={
          <Homepage
            user={currentUser}
            onLoginClick={() => navigate('/login')}
            onDashboardClick={() => {
              if (userRole === 'patient') navigate('/patient/dashboard');
              else if (userRole === 'doctor') {
                const isVerified = currentUser?.doctor?.is_verified;
                if (isVerified === false) navigate('/pending-dashboard');
                else navigate('/doctor/dashboard');
              }
              else if (userRole === 'admin') navigate('/admin/dashboard');
              else if (userRole === 'super-admin') navigate('/super-admin/dashboard');
              else navigate('/pending-dashboard');
            }}
          />
        } />
        <Route path="/login" element={
          <Login
            onBack={() => navigate('/')}
            onRegisterClick={() => navigate('/register')}
            onForgotPasswordClick={() => navigate('/forgot-password')}
            onLoginSuccess={handleLoginSuccess}
          />
        } />
        <Route path="/register" element={
          <Register
            onBack={() => navigate('/')}
            onLoginClick={() => navigate('/login')}
            onRegisterSuccess={handleLoginSuccess}
          />
        } />
        <Route path="/forgot-password" element={
          <ForgotPassword
            onBack={() => navigate('/')}
            onLoginClick={() => navigate('/login')}
          />
        } />
        <Route path="/reset-password" element={
          <ChangePassword
            onBack={() => navigate('/login')}
            onLoginClick={() => navigate('/login')}
          />
        } />
        
        {/* Dashboards */}
        <Route path="/patient/dashboard/*" element={<PatientDashboard onLogout={handleLogout} />} />
        <Route path="/doctor/dashboard/*" element={<DoctorDashboard onLogout={handleLogout} />} />
        <Route path="/doctor/verification" element={<DoctorVerification onComplete={() => navigate('/pending-dashboard')} />} />
        <Route path="/pending-dashboard" element={
          <PendingDashboard
            role={(userRole === 'nurse' || userRole === 'doctor') ? userRole : 'doctor'}
            onLogout={handleLogout}
          />
        } />
        
        <Route path="/admin-login" element={
          <AdminLogin
            onBack={() => navigate('/')}
            onLoginSuccess={handleLoginSuccess}
          />
        } />
        <Route path="/admin/dashboard/*" element={<AdminDashboard onLogout={handleLogout} />} />
        
        <Route path="/super-admin-login" element={
          <SuperAdminLogin
            onBack={() => navigate('/')}
            onLoginSuccess={handleLoginSuccess}
          />
        } />
        <Route path="/super-admin/dashboard/*" element={<SuperAdminDashboard onLogout={handleLogout} />} />
        
        {/* Catch all - Redirect to home or 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
