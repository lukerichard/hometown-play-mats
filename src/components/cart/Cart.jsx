import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { where, orderBy } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { useFirestore } from '../../hooks/useFirestore';
import { getMat } from '../../utils/matStorage';
import { calculateCartTotal, addToCart, updateCartQuantity, removeFromCart } from '../../utils/cartUtils';
import CartItem from './CartItem';
import MatPreview from '../MatPreview';

const Cart = () => {
  const { currentUser } = useAuth();
  const [matsData, setMatsData] = useState({});
  const [loadingMats, setLoadingMats] = useState(true);
  const [previewingMat, setPreviewingMat] = useState(null);

  const font = "'DM Sans', 'Poppins', sans-serif";
  const fontDisplay = "'Poppins', 'DM Sans', sans-serif";

  const matSizes = {
    small: { width: 1, height: 2, name: 'Small', dimensions: '39" × 79" (1m × 2m)' },
    medium: { width: 1.5, height: 2, name: 'Medium', dimensions: '59" × 79" (1.5m × 2m)' },
    large: { width: 2, height: 3, name: 'Large', dimensions: '79" × 118" (2m × 3m)' }
  };

  const colorSchemes = {
    classic: { color: '#3DAEF5', name: 'Classic' },
    muted: { color: '#5A5A5A', name: 'Muted' },
    neon: { color: '#A76BDB', name: 'Neon Vibrant' }
  };

  const { data: cartItems, loading: loadingCart, error } = useFirestore('cart', [
    where('userId', '==', currentUser?.uid || ''),
    orderBy('addedAt', 'desc')
  ]);

  useEffect(() => {
    const fetchMats = async () => {
      if (cartItems.length === 0) { setLoadingMats(false); return; }
      setLoadingMats(true);
      const mats = {};
      try {
        await Promise.all(cartItems.map(async (item) => {
          try { mats[item.matId] = await getMat(item.matId); }
          catch (error) { console.error(`Error fetching mat ${item.matId}:`, error); mats[item.matId] = null; }
        }));
        setMatsData(mats);
      } catch (error) { console.error('Error fetching mats:', error); }
      finally { setLoadingMats(false); }
    };
    fetchMats();
  }, [cartItems]);

  const loading = loadingCart || loadingMats;
  const total = calculateCartTotal(cartItems);
  const previewingCartItem = previewingMat ? cartItems.find(item => item.matId === previewingMat.id) : null;

  const handleAddToCart = async () => {
    if (!currentUser || !previewingMat) return;
    try {
      const pricePerUnit = previewingMat.matSize === 'small' ? 29.99 : previewingMat.matSize === 'medium' ? 39.99 : 49.99;
      await addToCart(currentUser.uid, previewingMat.id, 1, pricePerUnit);
    } catch (error) { console.error('Error adding to cart:', error); alert('Failed to add to cart. Please try again.'); }
  };

  const handleUpdateQuantity = async (newQuantity) => {
    if (!previewingCartItem) return;
    try {
      if (newQuantity <= 0) { await removeFromCart(previewingCartItem.id); setPreviewingMat(null); }
      else { await updateCartQuantity(previewingCartItem.id, newQuantity); }
    } catch (error) { console.error('Error updating quantity:', error); alert('Failed to update quantity. Please try again.'); }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#FDF8F0', padding: '100px 20px 40px',
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
      <div style={{ minHeight: '100vh', background: '#FDF8F0', padding: '100px 20px 40px', fontFamily: font }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '32px', borderRadius: '20px', textAlign: 'center' }}>
          <p style={{ color: '#E84545', fontSize: '16px', fontWeight: '600' }}>Error loading cart: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FDF8F0', padding: '100px 20px 40px', fontFamily: font }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#2D2D2D', marginBottom: '32px', fontFamily: fontDisplay }}>
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
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
            <Link to="/">
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
                <CartItem key={item.id} cartItem={item} mat={matsData[item.matId]} onViewMat={setPreviewingMat} />
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
                <span style={{ fontSize: '15px', color: '#5A5A5A', fontWeight: '600' }}>Items ({cartItems.length})</span>
                <span style={{ fontSize: '15px', color: '#2D2D2D', fontWeight: '700' }}>${total.toFixed(2)}</span>
              </div>

              <div style={{
                borderTop: '2px solid #E0DDD5', marginTop: '16px', paddingTop: '16px',
                display: 'flex', justifyContent: 'space-between', marginBottom: '24px'
              }}>
                <span style={{ fontSize: '18px', color: '#2D2D2D', fontWeight: '800' }}>Total</span>
                <span style={{ fontSize: '24px', color: '#3DAEF5', fontWeight: '800' }}>${total.toFixed(2)}</span>
              </div>

              <button
                onClick={() => alert('Checkout coming soon!')}
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
                Proceed to Checkout
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

      {previewingMat && (
        <MatPreview
          previewImage={previewingMat.previewImageUrl}
          matSize={previewingMat.matSize}
          colorScheme={previewingMat.colorScheme}
          matSizes={matSizes}
          colorSchemes={colorSchemes}
          savedMatId={previewingMat.id}
          matName={previewingMat.name}
          cartItem={previewingCartItem}
          onBackToEdit={() => setPreviewingMat(null)}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateQuantity}
          onSave={() => {}}
        />
      )}
    </div>
  );
};

export default Cart;
