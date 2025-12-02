import { useState } from 'react';
import { Button, Input, Card } from './ui';
import { signUpWithEmail, signInWithEmail, signInWithGoogle, resetPassword } from './auth-service';
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
      let result;
      
      if (isLogin) {
        // Sign in with Firebase
        result = await signInWithEmail(email, password);
      } else {
        // Sign up with Firebase
        result = await signUpWithEmail(email, password, fullName);
      }

      if (!result.success) {
        throw new Error(result.error);
      }

      const userData = {
        email: result.user.email,
        name: result.user.name,
        id: result.user.id,
        emailVerified: result.user.emailVerified
      };
      
      // Get Firebase ID token for backend verification
      const { getIdToken } = await import('./auth-service');
      const token = await getIdToken();
      
      setSuccess(true);
      
      // Show verification message if signing up
      if (!isLogin && result.message) {
        setError(result.message);
      }
      
      setTimeout(() => {
        onLogin(userData, token || 'firebase-token');
      }, 500);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const result = await signInWithGoogle();

      if (!result.success) {
        throw new Error(result.error);
      }

      const userData = {
        email: result.user.email,
        name: result.user.name,
        id: result.user.id,
        emailVerified: result.user.emailVerified,
        photoURL: result.user.photoURL
      };
      
      // Get Firebase ID token
      const { getIdToken } = await import('./auth-service');
      const token = await getIdToken();
      
      setSuccess(true);
      setTimeout(() => {
        onLogin(userData, token || 'firebase-token');
      }, 500);
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await resetPassword(email);
      
      if (result.success) {
        setError(result.message); // Using error field to show success message
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
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

            {isLogin && (
              <button 
                type="button" 
                onClick={handleForgotPassword}
                className="forgot-password-link"
                disabled={loading}
              >
                Forgot Password?
              </button>
            )}
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="google-signin-btn"
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.836.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
              <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

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
