import { useState } from 'react';
import { Button, Input, Card } from './ui';
import './styles.css';

export default function AuthForm({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (!isLogin) {
      if (!fullName) {
        newErrors.fullName = 'Full name is required';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const userData = {
        email: email,
        name: fullName || email.split('@')[0],
        id: Math.random().toString(36).substr(2, 9)
      };
      const token = 'demo-token-' + Math.random().toString(36).substr(2, 9);
      
      setSuccess(true);
      setTimeout(() => {
        onLogin(userData, token);
      }, 500);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="auth-content">
        <Card className="auth-card">
          <div className="auth-header">
            <div className="brand">
              <span className="brand-icon">✨</span>
              <h1>Fashion Fusion</h1>
            </div>
            <p className="tagline">AI-Powered Fashion Image Generation</p>
          </div>

          <div className="auth-tabs">
            <button
              className={`tab ${isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(true);
                setErrors({});
              }}
              aria-selected={isLogin}
              role="tab"
            >
              Login
            </button>
            <button
              className={`tab ${!isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(false);
                setErrors({});
              }}
              aria-selected={!isLogin}
              role="tab"
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {!isLogin && (
              <Input
                label="Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                error={errors.fullName}
              />
            )}

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              error={errors.email}
              icon="📧"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              error={errors.password}
              icon="🔐"
            />

            {!isLogin && (
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                error={errors.confirmPassword}
                icon="🔐"
              />
            )}

            {error && (
              <div className="error-message">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 5V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M8 11H8.00667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M13.3333 4L6 11.3333L2.66666 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {isLogin ? 'Login successful!' : 'Account created successfully!'}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="auth-submit-btn"
              loading={loading}
              disabled={loading || success}
            >
              {isLogin ? 'Login to Continue' : 'Create Account'}
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setErrors({});
                }}
                className="link-btn"
              >
                {isLogin ? 'Sign up' : 'Login'}
              </button>
            </p>
          </div>
        </Card>

        <div className="features">
          <div className="feature">
            <div className="feature-icon">🎨</div>
            <h3>AI-Powered</h3>
            <p>Generate stunning fashion images with advanced AI</p>
          </div>
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Get your designs in seconds, not hours</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🎭</div>
            <h3>Multiple Styles</h3>
            <p>Choose from various fashion styles and themes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
