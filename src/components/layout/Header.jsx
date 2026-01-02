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
      background: 'white',
      zIndex: 1000,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      borderBottom: '2px solid #E5E7EB'
    }}>

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
            color: '#7A8A6E',
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
                  border: '2px solid #D4C4AA',
                  borderRadius: '30px',
                  padding: '6px 16px 6px 6px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F5F0E8';
                  e.currentTarget.style.borderColor = '#7A8A6E';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#D4C4AA';
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
                    background: '#7A8A6E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '800'
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
                  border: '2px solid #D4C4AA',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
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
                      borderBottom: '1px solid #F5F0E8',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F5F0E8'}
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
                      borderBottom: '1px solid #F5F0E8',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F5F0E8'}
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
                      borderBottom: '1px solid #F5F0E8',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F5F0E8'}
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
                  border: '2px solid #D4C4AA',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F5F0E8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                }}>
                  Login
                </button>
              </Link>
              <Link to="/signup">
                <button style={{
                  padding: '12px 24px',
                  background: '#7A8A6E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#5C6E54';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#7A8A6E';
                }}
                >
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

    </header>
  );
};

export default Header;
