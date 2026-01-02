import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      zIndex: 1000,
      boxShadow: '0 4px 20px rgba(255, 107, 107, 0.15)',
      borderBottom: '3px solid rgba(255, 107, 107, 0.2)'
    }}>
      {/* Top gradient bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #FF6B6B, #FFD93D, #6C5CE7, #4ECDC4, #FF6B6B)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 3s linear infinite'
      }} />

      <div style={{
        maxWidth: '100%',
        padding: '18px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo/Title */}
        <Link to="/" style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.5px'
          }}>
            Hometown Play Mats
          </h1>
        </Link>

        {/* Right side - Auth actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {currentUser ? (
            // Authenticated user - show avatar with dropdown
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'white',
                  border: '3px solid rgba(255, 107, 107, 0.3)',
                  borderRadius: '30px',
                  padding: '6px 16px 6px 6px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 2px 10px rgba(255, 107, 107, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 107, 107, 0.08)';
                  e.currentTarget.style.borderColor = '#FF6B6B';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = 'rgba(255, 107, 107, 0.3)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(255, 107, 107, 0.1)';
                }}
              >
                {/* Avatar */}
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Profile"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid rgba(255, 107, 107, 0.3)'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '800',
                    boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)'
                  }}>
                    {getInitials(currentUser.displayName || currentUser.email)}
                  </div>
                )}

                {/* Display name */}
                <span style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#2D3436'
                }}>
                  {currentUser.displayName || 'Account'}
                </span>

                {/* Dropdown arrow */}
                <svg
                  style={{
                    width: '16px',
                    height: '16px',
                    fill: '#2D3436',
                    transition: 'transform 0.3s',
                    transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '220px',
                  background: 'white',
                  border: '3px solid rgba(255, 107, 107, 0.2)',
                  borderRadius: '16px',
                  boxShadow: '0 10px 40px rgba(255, 107, 107, 0.2)',
                  overflow: 'hidden'
                }}>
                  <Link
                    to="/account"
                    style={{
                      display: 'block',
                      padding: '14px 20px',
                      color: '#2D3436',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: '700',
                      borderBottom: '2px solid rgba(255, 107, 107, 0.1)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 107, 107, 0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Account Settings
                  </Link>
                  <Link
                    to="/saved-mats"
                    style={{
                      display: 'block',
                      padding: '14px 20px',
                      color: '#2D3436',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: '700',
                      borderBottom: '2px solid rgba(255, 107, 107, 0.1)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 107, 107, 0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Saved Mats
                  </Link>
                  <Link
                    to="/cart"
                    style={{
                      display: 'block',
                      padding: '14px 20px',
                      color: '#2D3436',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: '700',
                      borderBottom: '2px solid rgba(255, 107, 107, 0.1)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 107, 107, 0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Cart
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '14px 20px',
                      background: 'transparent',
                      border: 'none',
                      color: '#dc2626',
                      textAlign: 'left',
                      fontSize: '15px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220, 38, 38, 0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Not authenticated - show login/signup buttons
            <>
              <Link to="/login">
                <button style={{
                  padding: '12px 24px',
                  background: 'white',
                  color: '#2D3436',
                  border: '3px solid rgba(255, 107, 107, 0.3)',
                  borderRadius: '14px',
                  fontSize: '15px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#FF6B6B';
                  e.currentTarget.style.background = 'rgba(255, 107, 107, 0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 107, 107, 0.3)';
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  Login
                </button>
              </Link>
              <Link to="/signup">
                <button style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '15px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
                  transition: 'all 0.3s',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.4)';
                }}
                >
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }
      `}</style>
    </header>
  );
};

export default Header;
