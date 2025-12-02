import { useState, useEffect } from 'react';
import AuthForm from './AuthForm';
import ImageForm from './ImageForm';
import LandingPage from './LandingPage';
import { Toast } from './ui';
import { useToast } from './hooks/useToast';
import './styles.css';
import './landing-page.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const { toasts, removeToast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setShowLanding(false);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
    setShowLanding(false);
  };

  const handleLogout = async () => {
    // Call Firebase logout
    const { logout } = await import('./auth-service');
    await logout();
    
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setShowLanding(true);
  };

  const handleGetStarted = () => {
    setShowLanding(false);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <header className="main-header">
        <div className="header-content">
          <div className="logo-section" onClick={() => setShowLanding(true)} style={{ cursor: 'pointer' }}>
            <img src="/Logo.png" alt="Fashion Fusion" className="header-logo" />
            <span className="header-brand">Fashion Fusion</span>
          </div>
          <nav className="nav-menu">
            {user ? (
              <>
                <button onClick={() => setShowLanding(true)} className="nav-link">
                  Home
                </button>
                <button onClick={() => setShowLanding(false)} className="nav-link">
                  AI Studio
                </button>
                <div className="user-menu">
                  <div className="user-avatar" title={user.email}>
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-email-header">{user.email}</span>
                  <button onClick={handleLogout} className="logout-btn-header">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <button onClick={() => setShowLanding(true)} className="nav-link">
                  Home
                </button>
                <button onClick={handleGetStarted} className="nav-link-cta">
                  Get Started
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {showLanding ? (
          <LandingPage onGetStarted={handleGetStarted} />
        ) : !user ? (
          <div className="auth-wrapper">
            <AuthForm onLogin={handleLogin} />
          </div>
        ) : (
          <div className="studio-content">
            <ImageForm />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Fashion Fusion</h4>
            <p>AI-Powered Fashion Transformation Platform</p>
          </div>
          <div className="footer-section">
            <h4>Platform</h4>
            <ul>
              <li>AI Image Generation</li>
              <li>Fashion Analysis</li>
              <li>Style Variations</li>
              <li>E-commerce Integration</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Technology</h4>
            <ul>
              <li>Stability AI</li>
              <li>Vultr AI Analysis</li>
              <li>Smart Detection</li>
              <li>Price Intelligence</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li>About</li>
              <li>Contact</li>
              <li>Privacy</li>
              <li>Terms</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Fashion Fusion. All rights reserved.</p>
        </div>
      </footer>
      
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}
