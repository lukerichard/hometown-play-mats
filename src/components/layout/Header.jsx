import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFirestore } from '../../hooks/useFirestore';
import { isVerifiedAccount } from '../../utils/authStatus';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState('');
  const isSignedIn = isVerifiedAccount(currentUser);
  const { data: cartItems } = useFirestore(
    isSignedIn && currentUser?.uid ? `users/${currentUser.uid}/cart` : null
  );
  const cartItemCount = cartItems.reduce(
    (total, item) => total + (Number(item.quantity) || 1),
    0
  );

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
      <div className="flex h-full items-center justify-between px-3 sm:px-6 md:px-8">
        {/* Logo */}
        <Link to="/" className="no-underline">
          <span
            className="text-lg font-bold tracking-tight sm:text-2xl"
            style={{ color: '#00123a', fontFamily: "'Poppins', 'DM Sans', sans-serif" }}
          >
            <span className="hidden min-[361px]:inline">Hometown Play Mats</span>
            <span className="min-[361px]:hidden">Hometown</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-12 text-sm font-semibold md:flex">
          <a href="#how-it-works" className="text-[#00123a] no-underline transition-colors duration-150 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary focus-visible:rounded-sm">How it Works</a>
          <a href="#sizes" className="text-[#00123a] no-underline transition-colors duration-150 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary focus-visible:rounded-sm">Sizes</a>
          <a href="#gift-guide" className="text-[#00123a] no-underline transition-colors duration-150 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary focus-visible:rounded-sm">Gift Guide</a>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isSignedIn ? (
            <>
              <Link to="/create">
                <button
                  className="h-10 cursor-pointer rounded-md border-none px-4 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 sm:px-6"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    background: 'var(--builder-orange)',
                    color: 'var(--builder-ink)',
                    boxShadow: '0 2px 0 var(--builder-orange-edge), 0 6px 14px rgba(0, 0, 0, 0.12)',
                  }}
                >
                  <span className="sm:hidden">Create</span>
                  <span className="hidden sm:inline">Create Your Mat</span>
                </button>
              </Link>

              <Link
                to="/cart"
                aria-label={`Cart with ${cartItemCount} ${cartItemCount === 1 ? 'item' : 'items'}`}
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#00123a] no-underline transition-colors duration-200 hover:bg-surface-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <svg
                  aria-hidden="true"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="20" r="1" />
                  <circle cx="19" cy="20" r="1" />
                  <path d="M3 4h2l2.4 10.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#E84545] px-1 text-[10px] font-bold leading-none text-white">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>

              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  aria-label="Open account menu"
                  aria-expanded={showDropdown}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-border bg-surface-alt p-0 transition-all duration-200 hover:border-primary hover:shadow-md sm:w-auto sm:gap-2.5 sm:py-1.5 sm:pl-1.5 sm:pr-4"
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
                  <span className="hidden text-sm font-semibold text-text sm:inline">
                    {currentUser.displayName || 'Account'}
                  </span>
                  <svg
                    className="hidden h-4 w-4 text-text-light transition-transform duration-200 sm:block"
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
                  className="h-10 cursor-pointer rounded-md border-none px-4 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 sm:px-6"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    background: 'var(--builder-orange)',
                    color: 'var(--builder-ink)',
                    boxShadow: '0 2px 0 var(--builder-orange-edge), 0 6px 14px rgba(0, 0, 0, 0.12)',
                  }}
                >
                  <span className="sm:hidden">Create</span>
                  <span className="hidden sm:inline">Create Your Mat</span>
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
