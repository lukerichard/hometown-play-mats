import { useState } from 'react';
import { updateCartQuantity, removeFromCart } from '../../utils/cartUtils';

const CartItem = ({ cartItem, mat, onViewMat }) => {
  const [updating, setUpdating] = useState(false);

  const font = "'DM Sans', 'Poppins', sans-serif";

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    setUpdating(true);
    try { await updateCartQuantity(cartItem.id, newQuantity); }
    catch (error) { console.error('Error updating quantity:', error); alert('Failed to update quantity. Please try again.'); }
    finally { setUpdating(false); }
  };

  const handleRemove = async () => {
    if (!confirm('Remove this item from cart?')) return;
    setUpdating(true);
    try { await removeFromCart(cartItem.id); }
    catch (error) { console.error('Error removing item:', error); alert('Failed to remove item. Please try again.'); }
    finally { setUpdating(false); }
  };

  const totalPrice = (cartItem.quantity * cartItem.pricePerUnit).toFixed(2);

  return (
    <div style={{
      display: 'flex', gap: '20px', padding: '20px', background: 'white',
      borderRadius: '20px', border: '2px solid #E0DDD5',
      opacity: updating ? 0.6 : 1, pointerEvents: updating ? 'none' : 'auto',
      transition: 'all 0.2s', fontFamily: font
    }}>
      {/* Mat Preview Image */}
      <div
        onClick={() => mat && onViewMat(mat)}
        style={{
          width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden',
          background: '#F0F7ED', flexShrink: 0, cursor: mat ? 'pointer' : 'default',
          transition: 'all 0.2s', border: '2px solid transparent'
        }}
        onMouseEnter={(e) => { if (mat) { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.borderColor = '#3DAEF5'; } }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'transparent'; }}
      >
        {mat?.previewImageUrl ? (
          <img src={mat.previewImageUrl} alt={mat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
          onClick={() => mat && onViewMat(mat)}
          style={{
            margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: '#2D2D2D',
            cursor: mat ? 'pointer' : 'default', transition: 'color 0.2s', fontFamily: font
          }}
          onMouseEnter={(e) => mat && (e.currentTarget.style.color = '#3DAEF5')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#2D2D2D')}
        >
          {mat?.name || 'Mat'}
        </h3>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <span style={{
            padding: '4px 12px', background: '#D6EFFF', borderRadius: '999px',
            fontSize: '12px', fontWeight: '700', color: '#3DAEF5', textTransform: 'uppercase'
          }}>
            {mat?.matSize || 'N/A'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Quantity Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#5A5A5A' }}>Qty:</span>
            <button
              onClick={() => handleQuantityChange(cartItem.quantity - 1)}
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
              onClick={() => handleQuantityChange(cartItem.quantity + 1)}
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
            onClick={handleRemove}
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
