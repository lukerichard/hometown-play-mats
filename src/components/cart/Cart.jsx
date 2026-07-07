import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFirestore } from '../../hooks/useFirestore';
import { useCartMats } from '../../hooks/useCartMats';
import { calculateCartTotal, buildCartSummaryItem } from '../../utils/cartUtils';
import { MAT_SIZES, formatCurrency } from '../../utils/pricing';
import { trackEvent } from '../../utils/analytics';
import CartItem from './CartItem';
import CartConfirmationModal from './CartConfirmationModal';

const Cart = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [reviewingCartItem, setReviewingCartItem] = useState(null);
  const [showRemovedNotice, setShowRemovedNotice] = useState(false);

  const font = "'DM Sans', 'Poppins', sans-serif";
  const fontDisplay = "'Poppins', 'DM Sans', sans-serif";

  const matSizes = MAT_SIZES;

  const colorSchemes = {
    pastel: { name: 'Pastel Park' },
    modern: { name: 'Modern Mini' },
    classic: { name: 'Classic City' },
    muted: { name: 'Muted' },
    neon: { name: 'Neon Vibrant' }
  };
  const { data: cartItems, loading: loadingCart, error } = useFirestore(
    currentUser?.uid ? `users/${currentUser.uid}/cart` : null
  );
  const { matsData, loading: loadingMats } = useCartMats(currentUser?.uid, cartItems);

  const loading = loadingCart || loadingMats;
  const total = calculateCartTotal(cartItems);
  const getCartSummaryItem = (item) => buildCartSummaryItem(item, matsData, {
    userId: currentUser?.uid || '',
    matSizes,
    colorSchemes
  });

  const handleCheckout = () => {
    trackEvent('Checkout Started', {
      source: 'cart',
      item_count: cartItems.length,
      cart_total: total,
    });
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#ffffff', padding: '100px 20px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px', height: '50px',
            border: '4px solid #E0DDD5', borderTop: '4px solid #3DAEF5',
            borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px'
          }} />
          <p style={{ color: '#5A5A5A', fontSize: '16px', fontWeight: '600' }}>Loading your cart...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#ffffff', padding: '100px 20px 40px', fontFamily: font }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '32px', borderRadius: '20px', textAlign: 'center' }}>
          <p style={{ color: '#E84545', fontSize: '16px', fontWeight: '600' }}>Error loading cart: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', padding: '100px 20px 40px', fontFamily: font }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#2D2D2D', marginBottom: '32px', fontFamily: fontDisplay }}>
          Shopping Cart
        </h1>

        {!currentUser?.uid || cartItems.length === 0 ? (
          <div style={{
            background: 'white', borderRadius: '20px', padding: '64px 32px',
            textAlign: 'center', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.10)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#2D2D2D', marginBottom: '12px', fontFamily: fontDisplay }}>
              Your cart is empty
            </h2>
            <p style={{ fontSize: '16px', color: '#5A5A5A', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
              Start designing a mat and add it to your cart to get started!
            </p>
            <Link to="/create">
              <button style={{
                padding: '16px 36px', background: '#3DAEF5', color: 'white',
                border: 'none', borderRadius: '999px', fontSize: '16px', fontWeight: '700',
                cursor: 'pointer', fontFamily: font,
                boxShadow: '0 0 0 4px rgba(61, 174, 245, 0.25)', transition: 'all 0.2s'
              }}>
                Design a Mat
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  userId={currentUser.uid}
                  cartItem={item}
                  mat={matsData[item.designId || item.matId]}
                  onViewMat={() => setReviewingCartItem(getCartSummaryItem(item))}
                  onRemoved={() => setShowRemovedNotice(true)}
                />
              ))}
            </div>

            {/* Cart Summary */}
            <div style={{
              background: 'white', borderRadius: '20px', padding: '32px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.10)', position: 'sticky', top: '100px'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#2D2D2D', marginBottom: '20px', fontFamily: font }}>
                Order Summary
              </h2>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '15px', color: '#5A5A5A', fontWeight: '600' }}>Subtotal ({cartItems.length} item{cartItems.length === 1 ? '' : 's'})</span>
                <span style={{ fontSize: '15px', color: '#2D2D2D', fontWeight: '700' }}>{formatCurrency(total)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '15px', color: '#5A5A5A', fontWeight: '600' }}>Shipping</span>
                <span style={{ fontSize: '15px', color: '#2e7d32', fontWeight: '700' }}>Included</span>
              </div>

              <div style={{
                borderTop: '2px solid #E0DDD5', marginTop: '16px', paddingTop: '16px',
                display: 'flex', justifyContent: 'space-between', marginBottom: '8px'
              }}>
                <span style={{ fontSize: '18px', color: '#2D2D2D', fontWeight: '800' }}>Total</span>
                <span style={{ fontSize: '24px', color: '#3DAEF5', fontWeight: '800' }}>{formatCurrency(total)}</span>
              </div>

              <p style={{ fontSize: '13px', color: '#8A8A8A', marginBottom: '20px' }}>
                Tax is calculated at checkout, based on your shipping province.
              </p>

              <button
                onClick={handleCheckout}
                style={{
                  width: '100%', padding: '16px', background: '#3DAEF5', color: 'white',
                  border: 'none', borderRadius: '999px', fontSize: '16px', fontWeight: '700',
                  cursor: 'pointer', fontFamily: font,
                  boxShadow: '0 0 0 4px rgba(61, 174, 245, 0.25)',
                  transition: 'all 0.2s', marginBottom: '12px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#2A9BE0'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#3DAEF5'}
              >
                Continue to Checkout
              </button>

              <Link to="/">
                <button style={{
                  width: '100%', padding: '14px', background: 'white',
                  border: '2.5px solid #E0DDD5', borderRadius: '999px', fontSize: '15px',
                  fontWeight: '700', cursor: 'pointer', fontFamily: font,
                  transition: 'all 0.2s', display: 'block', textAlign: 'center',
                  textDecoration: 'none', color: '#2D2D2D'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3DAEF5'; e.currentTarget.style.color = '#3DAEF5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E0DDD5'; e.currentTarget.style.color = '#2D2D2D'; }}>
                  Continue Shopping
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <CartConfirmationModal
        key={reviewingCartItem?.designId || 'cart-review-empty'}
        item={reviewingCartItem}
        onClose={() => setReviewingCartItem(null)}
      />

      {showRemovedNotice && (
        <>
          <div className="cart-confirmation-scrim" onClick={() => setShowRemovedNotice(false)} />
          <section
            className="cart-confirmation-modal cart-removed-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-removed-title"
          >
            <div className="cart-confirmation-header">
              <div>
                <span>Cart Updated</span>
                <h2 id="cart-removed-title">Removed from cart</h2>
              </div>
              <button
                type="button"
                className="cart-confirmation-close"
                onClick={() => setShowRemovedNotice(false)}
                aria-label="Close removed from cart message"
              >
                X
              </button>
            </div>
            <div className="coming-soon-content">
              <p>Your play mat has been removed from your cart.</p>
              <div className="cart-confirmation-actions">
                <button
                  type="button"
                  className="primary-action"
                  onClick={() => setShowRemovedNotice(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Cart;
