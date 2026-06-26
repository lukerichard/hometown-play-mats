import { useState } from 'react';
import { updateCartQuantity, removeFromCart } from '../../utils/cartUtils';
import { getMatAspectRatio } from '../../utils/matDimensions';

const CartItem = ({ userId, cartItem, mat, onViewMat, onRemoved }) => {
  const [updating, setUpdating] = useState(false);

  const font = "'DM Sans', 'Poppins', sans-serif";

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    setUpdating(true);
    try { await updateCartQuantity(userId, cartItem.id, newQuantity); }
    catch (error) { console.error('Error updating quantity:', error); alert('Failed to update quantity. Please try again.'); }
    finally { setUpdating(false); }
  };

  const handleRemove = async () => {
    setUpdating(true);
    try {
      await removeFromCart(userId, cartItem.id);
      if (onRemoved) onRemoved();
    }
    catch (error) { console.error('Error removing item:', error); alert('Failed to remove item. Please try again.'); }
    finally { setUpdating(false); }
  };

  const totalPrice = (cartItem.quantity * cartItem.pricePerUnit).toFixed(2);
  const matSize = mat?.matSize || cartItem.matSize || 'medium';
  const previewAspectRatio = getMatAspectRatio(matSize);
  const itemTitle = `${matSize.charAt(0).toUpperCase()}${matSize.slice(1)} Hometown Play Mat`;
  const handleViewMat = () => {
    if (onViewMat) onViewMat();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Review this cart item"
      onClick={handleViewMat}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleViewMat();
        }
      }}
      style={{
        display: 'flex', gap: '20px', padding: '20px', background: 'white',
        borderRadius: '20px', border: '2px solid #E0DDD5',
        opacity: updating ? 0.6 : 1, pointerEvents: updating ? 'none' : 'auto',
        transition: 'all 0.2s', fontFamily: font, cursor: 'pointer'
      }}
    >
      {/* Mat Preview Image */}
      <div
        style={{
          width: '136px', aspectRatio: previewAspectRatio, maxHeight: '120px',
          borderRadius: '12px', overflow: 'hidden',
          background: '#F0F7ED', flexShrink: 0,
          transition: 'all 0.2s', border: '2px solid transparent',
          display: 'block'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.borderColor = '#3DAEF5'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'transparent'; }}
      >
        {mat?.previewImageUrl ? (
          <img src={mat.previewImageUrl} alt={mat.name} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#5A5A5A', fontSize: '12px'
          }}>No preview</div>
        )}
      </div>

      {/* Item Details */}
      <div style={{ flex: 1 }}>
        <h3
          style={{
            margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: '#2D2D2D',
            transition: 'color 0.2s', fontFamily: font
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#3DAEF5')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#2D2D2D')}
        >
          {itemTitle}
        </h3>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <span style={{
            padding: '4px 12px', background: '#D6EFFF', borderRadius: '999px',
            fontSize: '12px', fontWeight: '700', color: '#3DAEF5', textTransform: 'uppercase'
          }}>
            {matSize}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Quantity Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#5A5A5A' }}>Qty:</span>
            <button
              onClick={(event) => {
                event.stopPropagation();
                handleQuantityChange(cartItem.quantity - 1);
              }}
              disabled={cartItem.quantity <= 1 || updating}
              style={{
                width: '32px', height: '32px', background: 'white', border: '2.5px solid #E0DDD5',
                borderRadius: '8px', fontSize: '18px', fontWeight: '700', color: '#2D2D2D',
                cursor: cartItem.quantity <= 1 ? 'not-allowed' : 'pointer',
                opacity: cartItem.quantity <= 1 ? 0.4 : 1
              }}
            >-</button>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#2D2D2D', minWidth: '30px', textAlign: 'center' }}>
              {cartItem.quantity}
            </span>
            <button
              onClick={(event) => {
                event.stopPropagation();
                handleQuantityChange(cartItem.quantity + 1);
              }}
              disabled={updating}
              style={{
                width: '32px', height: '32px', background: 'white', border: '2.5px solid #E0DDD5',
                borderRadius: '8px', fontSize: '18px', fontWeight: '700', color: '#2D2D2D', cursor: 'pointer'
              }}
            >+</button>
          </div>

          {/* Price */}
          <div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#5A5A5A', marginRight: '8px' }}>Price:</span>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#3DAEF5' }}>${totalPrice}</span>
          </div>

          {/* Remove Button */}
          <button
            onClick={(event) => {
              event.stopPropagation();
              handleRemove();
            }}
            disabled={updating}
            style={{
              marginLeft: 'auto', padding: '8px 20px', background: 'white', color: '#E84545',
              border: '2.5px solid rgba(232, 69, 69, 0.2)', borderRadius: '999px',
              fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: font, transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fde8e8'; e.currentTarget.style.borderColor = '#E84545'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'rgba(232, 69, 69, 0.2)'; }}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
