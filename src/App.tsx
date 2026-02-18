import { useState, useEffect } from 'react'
import Homepage from './app/index'
import Login from './app/auth/Login'
import Register from './app/auth/Register'
import './index.css'
import Preloader from './components/Preloader'

import ForgotPassword from './app/auth/ForgotPassword'

import ChangePassword from './app/auth/ChangePassword'
import PatientDashboard from './app/patient/PatientDashboard'
import DoctorDashboard from './app/doctor/DoctorDashboard'
import PendingDashboard from './app/shared/PendingDashboard'
import DoctorVerification from './app/doctor/DoctorVerification.tsx'
import AdminLogin from './app/admin/AdminLogin'
import AdminDashboard from './app/admin/AdminDashboard'
import { Toaster, toast } from 'react-hot-toast';
import { api } from './services';

function App() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [view, setView] = useState<'home' | 'login' | 'register' | 'forgot-password' | 'change-password' | 'patient-dashboard' | 'doctor-dashboard' | 'pending-dashboard' | 'doctor-verification' | 'admin-login' | 'admin-dashboard'>(() => {
    // Simple URL check for initial load
    if (window.location.pathname === '/admin-login') return 'admin-login';
    return 'home';
  });
  const [userRole, setUserRole] = useState<'patient' | 'doctor' | 'nurse' | 'admin'>(() => {
    const savedRole = localStorage.getItem('userRole');
    return (savedRole as any) || 'patient';
  });

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
        // We stay at 'home' as per user request: "starts from the homepage"
      } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('appView');
        localStorage.removeItem('userRole');
      } finally {
        // Enforce a minimum loading time for better UX if it's too fast
        setTimeout(() => setLoading(false), 1000);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    // Only save the role, don't force-restore the view on reload anymore
    localStorage.setItem('userRole', userRole);
  }, [view, userRole]);

  useEffect(() => {
    // Check for password reset token
    const params = new URLSearchParams(window.location.search);
    if (params.get('token') && window.location.pathname.includes('reset-password')) {
      setView('change-password');
    }

    // Check for email verification
    if (params.get('verified') === '1') {
      toast.success('Email verified successfully! Please login.');
      setView('login');
      // Clean URL
      window.history.replaceState({}, document.title, '/login');
    }

    // Check for admin path
    if (window.location.pathname === '/admin-login') {
      setView('admin-login');
    }
  }, []);

  const handleLoginSuccess = (role: 'patient' | 'doctor' | 'nurse' | 'admin', isCompleted: boolean = true, isVerified: boolean = true, userData?: any) => {
    setUserRole(role);
    if (userData) {
      setCurrentUser(userData);
    } else {
      // Fetch user data if not provided (fallback)
      api.get('/user').then(res => setCurrentUser(res.data));
    }


    // Check for incomplete profiles (Patient or Doctor who hasn't finished step 7)
    // For Doctor, if !isCompleted, it means they have a User account but no Doctor record -> Send to Register
    if (!isCompleted) {
      setView('register');
      toast('Please complete your profile registration.', { icon: '📝' });
      return;
    }

    if (role === 'patient') {
      setView('patient-dashboard');
    } else if (role === 'doctor') {
      if (isVerified) {
        setView('doctor-dashboard');
      } else {
        setView('pending-dashboard');
      }
    } else if (role === 'admin') {
      setView('admin-dashboard');
    } else {
      setView('pending-dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('appView');
    localStorage.removeItem('userRole');
    setCurrentUser(null);
    setView('login');
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
      {view === 'home' && (
        <Homepage
          user={currentUser}
          onLoginClick={() => setView('login')}
          onDashboardClick={() => {
            if (userRole === 'patient') setView('patient-dashboard');
            else if (userRole === 'doctor') {
              // Check if verified/completed 
              const isVerified = currentUser?.doctor?.is_verified; // Adjust based on API structure
              if (isVerified === false) setView('pending-dashboard');
              else setView('doctor-dashboard');
            }
            else if (userRole === 'admin') setView('admin-dashboard');
            else setView('pending-dashboard');
          }}
        />
      )}
      {view === 'login' && (
        <Login
          onBack={() => setView('home')}
          onRegisterClick={() => setView('register')}
          onForgotPasswordClick={() => setView('forgot-password')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {view === 'register' && (
        <Register
          onBack={() => setView('home')}
          onLoginClick={() => setView('login')}
          onRegisterSuccess={handleLoginSuccess}
        />
      )}
      {view === 'forgot-password' && (
        <ForgotPassword
          onBack={() => setView('home')}
          onLoginClick={() => setView('login')}
        />
      )}
      {view === 'change-password' && (
        <ChangePassword
          onBack={() => setView('login')} // Or 'forgot-password' if preferred
          onLoginClick={() => setView('login')}
        />
      )}
      {view === 'patient-dashboard' && <PatientDashboard onLogout={handleLogout} />}
      {view === 'doctor-dashboard' && <DoctorDashboard onLogout={handleLogout} />}
      {view === 'doctor-verification' && <DoctorVerification onComplete={() => setView('pending-dashboard')} />}
      {view === 'pending-dashboard' && (
        <PendingDashboard
          role={userRole as 'doctor' | 'nurse'}
          onLogout={handleLogout}
        />
      )}
      {view === 'admin-login' && (
        <AdminLogin
          onBack={() => setView('home')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {view === 'admin-dashboard' && <AdminDashboard onLogout={handleLogout} />}
    </>
  )
}

export default App
