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
import { Toaster, toast } from 'react-hot-toast';

function App() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'home' | 'login' | 'register' | 'forgot-password' | 'change-password' | 'patient-dashboard' | 'doctor-dashboard' | 'pending-dashboard' | 'doctor-verification'>(() => {
    const savedView = localStorage.getItem('appView');
    return (savedView as any) || 'home';
  });
  const [userRole, setUserRole] = useState<'patient' | 'doctor' | 'nurse'>(() => {
    const savedRole = localStorage.getItem('userRole');
    return (savedRole as any) || 'patient';
  });

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // 2 seconds loader
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('appView', view);
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
  }, []);

  const handleLoginSuccess = (role: 'patient' | 'doctor' | 'nurse') => {
    setUserRole(role);
    if (role === 'patient') {
      setView('patient-dashboard');
    } else if (role === 'doctor') {
      // Ideally check backend if verified. For demo:
      // setView('doctor-dashboard'); // If verified
      setView('doctor-dashboard'); // Go directly to dashboard as requested
    } else {
      setView('pending-dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('appView');
    localStorage.removeItem('userRole');
    setView('login');
  };

  if (loading) {
    return <Preloader />;
  }

  return (
    <>
      <Toaster position="top-right" />
      {view === 'home' && <Homepage onLoginClick={() => setView('login')} />}
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
    </>
  )
}

export default App
