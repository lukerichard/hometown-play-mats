import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else {
        setError('Failed to login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Google login error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled');
      } else {
        setError('Failed to login with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FDF8F0',
      padding: '20px',
      paddingTop: '80px',
      fontFamily: "'DM Sans', 'Poppins', sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: '#3B3B3B',
          padding: '32px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '32px',
            fontWeight: '800',
            color: 'white',
            letterSpacing: '-0.5px',
            fontFamily: "'Poppins', 'DM Sans', sans-serif"
          }}>
            Welcome Back
          </h1>
          <p style={{
            margin: '8px 0 0 0',
            color: 'rgba(255, 255, 255, 0.85)',
            fontSize: '15px'
          }}>
            Login to continue designing your play mats
          </p>
        </div>

        {/* Form */}
        <div style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '700',
                color: '#2D2D2D',
                marginBottom: '8px'
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  border: '2.5px solid #E0DDD5',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                  color: '#2D2D2D'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3DAEF5';
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(61, 174, 245, 0.25)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E0DDD5';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '700',
                color: '#2D2D2D',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  border: '2.5px solid #E0DDD5',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                  color: '#2D2D2D'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3DAEF5';
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(61, 174, 245, 0.25)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E0DDD5';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                marginBottom: '20px',
                padding: '12px 16px',
                background: '#fde8e8',
                borderLeft: '5px solid #E84545',
                borderRadius: '12px',
                color: '#b71c1c',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 28px',
                background: loading ? '#B0A999' : '#3DAEF5',
                color: 'white',
                border: 'none',
                borderRadius: '999px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: '0.3px',
                boxShadow: loading ? 'none' : '0 0 0 4px rgba(61, 174, 245, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '24px 0',
            gap: '16px'
          }}>
            <div style={{ flex: 1, height: '1px', background: '#E0DDD5' }} />
            <span style={{ color: '#5A5A5A', fontSize: '14px', fontWeight: '600' }}>
              Or continue with
            </span>
            <div style={{ flex: 1, height: '1px', background: '#E0DDD5' }} />
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: 'white',
              border: '2.5px solid #E0DDD5',
              borderRadius: '999px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.2s',
              opacity: loading ? 0.6 : 1,
              color: '#2D2D2D'
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.borderColor = '#3DAEF5')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.borderColor = '#E0DDD5')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
              <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
              <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
              <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
            </svg>
            Sign in with Google
          </button>

          {/* Signup Link */}
          <p style={{
            marginTop: '24px',
            textAlign: 'center',
            color: '#5A5A5A',
            fontSize: '15px'
          }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{
              color: '#3DAEF5',
              fontWeight: '700',
              textDecoration: 'none'
            }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
