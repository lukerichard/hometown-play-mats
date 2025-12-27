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

  // Real-time listener for user's saved mats (only query if user is logged in)
  const { data: mats, loading, error } = useFirestore(
    currentUser?.uid ? 'savedMats' : null,
    currentUser?.uid ? [
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    ] : []
  );

  // Real-time listener for user's cart items
  const { data: cartItems } = useFirestore(
    currentUser?.uid ? 'cart' : null,
    currentUser?.uid ? [
      where('userId', '==', currentUser.uid)
    ] : []
  );

  // Create a Set of matIds that are in the cart for quick lookup
  const matsInCart = new Set(cartItems.map(item => item.matId));

  // Mat size and color scheme definitions
  const matSizes = {
    small: { width: 1, height: 2, name: 'Small', dimensions: '39" × 79" (1m × 2m)' },
    medium: { width: 1.5, height: 2, name: 'Medium', dimensions: '59" × 79" (1.5m × 2m)' },
    large: { width: 2, height: 3, name: 'Large', dimensions: '79" × 118" (2m × 3m)' }
  };

  const colorSchemes = {
    classic: { color: '#C78880', name: 'Classic' },
    muted: { color: '#64748b', name: 'Muted' },
    neon: { color: '#ec4899', name: 'Neon Vibrant' }
  };

  // Find cart item for the mat being previewed
  const previewingCartItem = previewingMat ? cartItems.find(item => item.matId === previewingMat.id) : null;

  // Handler for adding mat to cart
  const handleAddToCart = async () => {
    if (!currentUser) {
      const shouldSignup = confirm('You need an account to add items to cart. Create an account now?');
      if (shouldSignup) {
        navigate('/signup');
      }
      return;
    }

    try {
      const pricePerUnit = previewingMat.matSize === 'small' ? 29.99
        : previewingMat.matSize === 'medium' ? 39.99
        : 49.99;

      // Add to cart (will update quantity if already exists)
      await addToCart(currentUser.uid, previewingMat.id, 1, pricePerUnit);

      // No dialog - clean UX, user can see it in cart badge
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    }
  };

  // Handler for updating cart quantity
  const handleUpdateQuantity = async (newQuantity) => {
    if (!previewingCartItem) return;

    try {
      if (newQuantity <= 0) {
        // Remove item from cart when quantity reaches 0
        await removeFromCart(previewingCartItem.id);
      } else {
        // Update quantity
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
            border: '4px solid rgba(121, 151, 127, 0.6)',
            borderTop: '4px solid #C78880',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{
            color: '#64748b',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            Loading your mats...
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
            Error loading mats: {error}
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
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            color: '#3A3A3A',
            margin: 0,
            letterSpacing: '-0.5px'
          }}>
            Saved Mats
          </h1>
          <Link to="/">
            <button style={{
              padding: '12px 24px',
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
              + Create New Mat
            </button>
          </Link>
        </div>

        {/* Mats Grid or Empty State */}
        {mats.length === 0 ? (
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
              🎨
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '800',
              color: '#3A3A3A',
              marginBottom: '12px'
            }}>
              No saved mats yet
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#64748b',
              marginBottom: '32px',
              maxWidth: '400px',
              margin: '0 auto 32px'
            }}>
              Start designing your first custom play mat! Create unique maps for your toy cars.
            </p>
            <Link to="/">
              <button style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #C78880 0%, #A86E67 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '800',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 4px 20px rgba(121, 151, 127, 0.5)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Create Your First Mat
              </button>
            </Link>
          </div>
        ) : (
          <>
            <p style={{
              fontSize: '16px',
              color: '#64748b',
              marginBottom: '24px',
              fontWeight: '600'
            }}>
              {mats.length} {mats.length === 1 ? 'mat' : 'mats'} saved
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {mats.map((mat) => (
                <SavedMatCard
                  key={mat.id}
                  mat={mat}
                  onViewMat={setPreviewingMat}
                  isInCart={matsInCart.has(mat.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Preview Modal */}
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
