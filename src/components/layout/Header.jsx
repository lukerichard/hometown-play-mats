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

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] bg-white/95 backdrop-blur-xl border-b-2 border-border"
      style={{ boxShadow: '0 1px 8px rgba(0, 0, 0, 0.08)' }}>


      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link to="/" className="no-underline flex items-center gap-2.5 group">
          {/* Mini road icon */}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3B3B3B, #6B6B6B)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="2" width="10" height="12" rx="1" fill="#6B6B6B" />
              <line x1="8" y1="3" x2="8" y2="13" stroke="#FFCC00" strokeWidth="1.5" strokeDasharray="2 1.5" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-text"
            style={{ fontFamily: "'Poppins', 'DM Sans', sans-serif" }}>
            Hometown Play Mats
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="flex items-center gap-2.5 bg-surface-alt border-2 border-border rounded-full py-1.5 px-4 pl-1.5 cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-md"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: '#3DAEF5' }}>
                    {getInitials(currentUser.displayName || currentUser.email)}
                  </div>
                )}
                <span className="text-sm font-semibold text-text">
                  {currentUser.displayName || 'Account'}
                </span>
                <svg
                  className="w-4 h-4 text-text-light transition-transform duration-200"
                  style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-white border-2 border-border rounded-xl overflow-hidden animate-fade-in"
                  style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' }}>
                  {[
                    { to: '/account', label: 'Account Settings' },
                    { to: '/saved-mats', label: 'Saved Mats' },
                    { to: '/cart', label: 'Cart' },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="block px-4 py-3 text-sm font-semibold text-text no-underline border-b border-border/50 transition-colors duration-150 hover:bg-sky-light/50"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-sm font-semibold bg-transparent border-none cursor-pointer transition-colors duration-150 hover:bg-red-50"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: '#E84545' }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login">
                <button
                  className="px-5 py-2.5 bg-white text-text border-2 border-border rounded-full text-sm font-bold cursor-pointer transition-all duration-200 hover:border-primary hover:bg-sky-light/30 hover:-translate-y-0.5"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Login
                </button>
              </Link>
              <Link to="/signup">
                <button
                  className="px-5 py-2.5 text-white border-none rounded-full text-sm font-bold cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    background: '#3DAEF5',
                    boxShadow: '0 2px 8px rgba(61, 174, 245, 0.3)',
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
