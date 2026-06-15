import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { isVerifiedAccount } from '../../utils/authStatus';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState('');
  const isSignedIn = isVerifiedAccount(currentUser);

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
    <header
      className="fixed left-0 right-0 top-0 z-[1000]"
      style={{
        height: '72px',
        background: '#ffffff',
        borderBottom: '1px solid #e3ded5',
        color: '#00123a',
      }}
    >
      <div className="flex h-full items-center justify-between px-6 md:px-8">
        {/* Logo */}
        <Link to="/" className="no-underline">
          <span
            className="text-2xl font-bold tracking-tight"
            style={{ color: '#00123a', fontFamily: "'Poppins', 'DM Sans', sans-serif" }}
          >
            Hometown Play Mats
          </span>
        </Link>

        <nav className="hidden items-center gap-12 text-sm font-semibold md:flex">
          <a href="#how-it-works" className="text-[#00123a] no-underline transition-colors duration-150 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary focus-visible:rounded-sm">How it Works</a>
          <a href="#sizes" className="text-[#00123a] no-underline transition-colors duration-150 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary focus-visible:rounded-sm">Sizes</a>
          <a href="#gift-guide" className="text-[#00123a] no-underline transition-colors duration-150 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary focus-visible:rounded-sm">Gift Guide</a>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <>
              <Link to="/create">
                <button
                  className="h-10 cursor-pointer rounded-md border-none px-6 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    background: 'var(--builder-orange)',
                    color: 'var(--builder-ink)',
                    boxShadow: '0 2px 0 var(--builder-orange-edge), 0 6px 14px rgba(0, 0, 0, 0.12)',
                  }}
                >
                  Create Your Mat
                </button>
              </Link>

              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  className="flex items-center gap-2.5 bg-surface-alt border-2 border-border rounded-full py-1.5 px-4 pl-1.5 cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-md"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {currentUser.photoURL && failedAvatarUrl !== currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-border"
                      referrerPolicy="no-referrer"
                      onError={() => setFailedAvatarUrl(currentUser.photoURL)}
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
            </>
          ) : (
            <>
              <Link to="/login" className="hidden md:block">
                <button
                  className="cursor-pointer border-0 bg-transparent px-3 py-2 text-sm font-bold"
                  style={{ color: '#00123a', fontFamily: "'DM Sans', sans-serif" }}
                >
                  Login
                </button>
              </Link>
              <Link to="/create">
                <button
                  className="h-10 cursor-pointer rounded-md border-none px-6 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    background: 'var(--builder-orange)',
                    color: 'var(--builder-ink)',
                    boxShadow: '0 2px 0 var(--builder-orange-edge), 0 6px 14px rgba(0, 0, 0, 0.12)',
                  }}
                >
                  Create Your Mat
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
