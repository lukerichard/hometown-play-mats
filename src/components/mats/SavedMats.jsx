import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { where, orderBy } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { useFirestore } from '../../hooks/useFirestore';
import SavedMatCard from './SavedMatCard';
import MatPreview from '../MatPreview';
import { addToCart, updateCartQuantity, removeFromCart } from '../../utils/cartUtils';

const SavedMats = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [previewingMat, setPreviewingMat] = useState(null);

  const font = "'DM Sans', 'Poppins', sans-serif";
  const fontDisplay = "'Poppins', 'DM Sans', sans-serif";

  const { data: mats, loading, error } = useFirestore(
    currentUser?.uid ? 'savedMats' : null,
    currentUser?.uid ? [
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    ] : []
  );

  const { data: cartItems } = useFirestore(
    currentUser?.uid ? 'cart' : null,
    currentUser?.uid ? [where('userId', '==', currentUser.uid)] : []
  );

  const matsInCart = new Set(cartItems.map(item => item.matId));

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

  const previewingCartItem = previewingMat ? cartItems.find(item => item.matId === previewingMat.id) : null;

  const handleAddToCart = async () => {
    if (!currentUser) {
      const shouldSignup = confirm('You need an account to add items to cart. Create an account now?');
      if (shouldSignup) navigate('/signup');
      return;
    }
    try {
      const pricePerUnit = previewingMat.matSize === 'small' ? 29.99
        : previewingMat.matSize === 'medium' ? 39.99 : 49.99;
      await addToCart(currentUser.uid, previewingMat.id, 1, pricePerUnit);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    }
  };

  const handleUpdateQuantity = async (newQuantity) => {
    if (!previewingCartItem) return;
    try {
      if (newQuantity <= 0) {
        await removeFromCart(previewingCartItem.id);
      } else {
        await updateCartQuantity(previewingCartItem.id, newQuantity);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity. Please try again.');
    }
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
          <p style={{ color: '#5A5A5A', fontSize: '16px', fontWeight: '600' }}>Loading your mats...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#FDF8F0', padding: '100px 20px 40px', fontFamily: font }}>
        <div style={{
          maxWidth: '600px', margin: '0 auto', background: 'white', padding: '32px',
          borderRadius: '20px', textAlign: 'center'
        }}>
          <p style={{ color: '#E84545', fontSize: '16px', fontWeight: '600' }}>Error loading mats: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FDF8F0', padding: '100px 20px 40px', fontFamily: font }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '32px', flexWrap: 'wrap', gap: '16px'
        }}>
          <h1 style={{
            fontSize: '32px', fontWeight: '800', color: '#2D2D2D', margin: 0,
            fontFamily: fontDisplay
          }}>
            Saved Mats
          </h1>
          <Link to="/">
            <button style={{
              padding: '12px 28px', background: '#3DAEF5', color: 'white',
              border: 'none', borderRadius: '999px', fontSize: '15px', fontWeight: '700',
              cursor: 'pointer', fontFamily: font,
              boxShadow: '0 0 0 4px rgba(61, 174, 245, 0.25)', transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#2A9BE0'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#3DAEF5'}>
              + Create New Mat
            </button>
          </Link>
        </div>

        {mats.length === 0 ? (
          <div style={{
            background: 'white', borderRadius: '20px', padding: '64px 32px',
            textAlign: 'center', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.10)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎨</div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#2D2D2D', marginBottom: '12px', fontFamily: fontDisplay }}>
              No saved mats yet
            </h2>
            <p style={{ fontSize: '16px', color: '#5A5A5A', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
              Start designing your first custom play mat! Create unique maps for your toy cars.
            </p>
            <Link to="/">
              <button style={{
                padding: '16px 36px', background: '#3DAEF5', color: 'white',
                border: 'none', borderRadius: '999px', fontSize: '16px', fontWeight: '700',
                cursor: 'pointer', fontFamily: font,
                boxShadow: '0 0 0 4px rgba(61, 174, 245, 0.25)', transition: 'all 0.2s'
              }}>
                Create Your First Mat
              </button>
            </Link>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '16px', color: '#5A5A5A', marginBottom: '24px', fontWeight: '600' }}>
              {mats.length} {mats.length === 1 ? 'mat' : 'mats'} saved
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {mats.map((mat) => (
                <SavedMatCard key={mat.id} mat={mat} onViewMat={setPreviewingMat} isInCart={matsInCart.has(mat.id)} />
              ))}
            </div>
          </>
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

export default SavedMats;
