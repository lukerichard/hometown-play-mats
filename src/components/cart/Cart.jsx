import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { where, orderBy } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { useFirestore } from '../../hooks/useFirestore';
import { getMat } from '../../utils/matStorage';
import { calculateCartTotal } from '../../utils/cartUtils';
import CartItem from './CartItem';

const Cart = () => {
  const { currentUser } = useAuth();
  const [matsData, setMatsData] = useState({});
  const [loadingMats, setLoadingMats] = useState(true);

  // Real-time listener for cart items
  const { data: cartItems, loading: loadingCart, error } = useFirestore('cart', [
    where('userId', '==', currentUser?.uid || ''),
    orderBy('addedAt', 'desc')
  ]);

  // Fetch mat details for each cart item
  useEffect(() => {
    const fetchMats = async () => {
      if (cartItems.length === 0) {
        setLoadingMats(false);
        return;
      }

      setLoadingMats(true);
      const mats = {};

      try {
        await Promise.all(
          cartItems.map(async (item) => {
            try {
              const mat = await getMat(item.matId);
              mats[item.matId] = mat;
            } catch (error) {
              console.error(`Error fetching mat ${item.matId}:`, error);
              mats[item.matId] = null;
            }
          })
        );

        setMatsData(mats);
      } catch (error) {
        console.error('Error fetching mats:', error);
      } finally {
        setLoadingMats(false);
      }
    };

    fetchMats();
  }, [cartItems]);

  const loading = loadingCart || loadingMats;
  const total = calculateCartTotal(cartItems);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f8fafb',
        padding: '100px 20px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(16, 185, 129, 0.2)',
            borderTop: '4px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{
            color: '#64748b',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            Loading your cart...
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f8fafb',
        padding: '100px 20px 40px'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          background: 'white',
          padding: '32px',
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#dc2626', fontSize: '16px', fontWeight: '600' }}>
            Error loading cart: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafb',
      padding: '100px 20px 40px'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: '800',
          color: '#1e293b',
          marginBottom: '32px',
          letterSpacing: '-0.5px'
        }}>
          Shopping Cart
        </h1>

        {/* Empty State or Cart Items */}
        {cartItems.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '64px 32px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '16px'
            }}>
              🛒
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '800',
              color: '#1e293b',
              marginBottom: '12px'
            }}>
              Your cart is empty
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#64748b',
              marginBottom: '32px',
              maxWidth: '400px',
              margin: '0 auto 32px'
            }}>
              Start designing a mat and add it to your cart to get started!
            </p>
            <Link to="/">
              <button style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '800',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Design a Mat
              </button>
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '40px'
          }}>
            {/* Cart Items */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  cartItem={item}
                  mat={matsData[item.matId]}
                />
              ))}
            </div>

            {/* Cart Summary */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              position: 'sticky',
              top: '100px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '800',
                color: '#1e293b',
                marginBottom: '20px'
              }}>
                Order Summary
              </h2>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <span style={{ fontSize: '15px', color: '#64748b', fontWeight: '600' }}>
                  Items ({cartItems.length})
                </span>
                <span style={{ fontSize: '15px', color: '#1e293b', fontWeight: '700' }}>
                  ${total.toFixed(2)}
                </span>
              </div>

              <div style={{
                borderTop: '2px solid rgba(16, 185, 129, 0.15)',
                marginTop: '16px',
                paddingTop: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '24px'
              }}>
                <span style={{ fontSize: '18px', color: '#1e293b', fontWeight: '800' }}>
                  Total
                </span>
                <span style={{ fontSize: '24px', color: '#10b981', fontWeight: '800' }}>
                  ${total.toFixed(2)}
                </span>
              </div>

              <button
                onClick={() => alert('Checkout coming soon! 🚀')}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: '0.3px',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.2s',
                  marginBottom: '12px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Proceed to Checkout
              </button>

              <Link to="/">
                <button style={{
                  width: '100%',
                  padding: '14px',
                  background: 'white',
                  border: '2px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.2s',
                  display: 'block',
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: '#1e293b'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)';
                  e.currentTarget.style.background = 'white';
                }}
                >
                  Continue Shopping
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
