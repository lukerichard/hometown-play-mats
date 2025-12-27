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
      background: '#f8fafb',
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
    }}>
      {/* Top gradient bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #C78880, #A86E67, #C78880)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 3s linear infinite'
      }} />

      <div style={{
        maxWidth: '100%',
        padding: '16px 40px',
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
            color: '#3A3A3A',
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
                  border: '2px solid rgba(199, 136, 128, 0.4)',
                  borderRadius: '30px',
                  padding: '6px 16px 6px 6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'Inter, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(199, 136, 128, 0.1)';
                  e.currentTarget.style.borderColor = '#C78880';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = 'rgba(199, 136, 128, 0.4)';
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
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #C78880 0%, #A86E67 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '700'
                  }}>
                    {getInitials(currentUser.displayName || currentUser.email)}
                  </div>
                )}

                {/* Display name */}
                <span style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#3A3A3A'
                }}>
                  {currentUser.displayName || 'Account'}
                </span>

                {/* Dropdown arrow */}
                <svg
                  style={{
                    width: '16px',
                    height: '16px',
                    fill: '#3A3A3A',
                    transition: 'transform 0.2s',
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
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                  overflow: 'hidden'
                }}>
                  <Link
                    to="/account"
                    style={{
                      display: 'block',
                      padding: '14px 20px',
                      color: '#3A3A3A',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: '600',
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Account Settings
                  </Link>
                  <Link
                    to="/saved-mats"
                    style={{
                      display: 'block',
                      padding: '14px 20px',
                      color: '#3A3A3A',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: '600',
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Saved Mats
                  </Link>
                  <Link
                    to="/cart"
                    style={{
                      display: 'block',
                      padding: '14px 20px',
                      color: '#3A3A3A',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: '600',
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafb'}
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
                      fontWeight: '600',
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
                  padding: '10px 20px',
                  background: 'white',
                  color: '#3A3A3A',
                  border: '2px solid rgba(199, 136, 128, 0.4)',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#C78880';
                  e.currentTarget.style.background = 'rgba(199, 136, 128, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(199, 136, 128, 0.4)';
                  e.currentTarget.style.background = 'white';
                }}>
                  Login
                </button>
              </Link>
              <Link to="/signup">
                <button style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #C78880 0%, #A86E67 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 4px 12px rgba(121, 151, 127, 0.5)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
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
