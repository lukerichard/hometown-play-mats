import { useState } from 'react';
import { updateCartQuantity, removeFromCart } from '../../utils/cartUtils';

const CartItem = ({ cartItem, mat, onViewMat }) => {
  const [updating, setUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;

    setUpdating(true);
    try {
      await updateCartQuantity(cartItem.id, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Remove this item from cart?')) return;

    setUpdating(true);
    try {
      await removeFromCart(cartItem.id);
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const totalPrice = (cartItem.quantity * cartItem.pricePerUnit).toFixed(2);

  return (
    <div style={{
      display: 'flex',
      gap: '20px',
      padding: '20px',
      background: 'white',
      borderRadius: '12px',
      border: '2px solid rgba(121, 151, 127, 0.5)',
      opacity: updating ? 0.6 : 1,
      pointerEvents: updating ? 'none' : 'auto',
      transition: 'all 0.2s'
    }}>
      {/* Mat Preview Image */}
      <div
        onClick={() => mat && onViewMat(mat)}
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '8px',
          overflow: 'hidden',
          background: '#f8fafb',
          flexShrink: 0,
          cursor: mat ? 'pointer' : 'default',
          transition: 'all 0.2s',
          border: '2px solid transparent'
        }}
        onMouseEnter={(e) => {
          if (mat) {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.borderColor = 'rgba(121, 151, 127, 0.8)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.borderColor = 'transparent';
        }}
      >
        {mat?.previewImageUrl ? (
          <img
            src={mat.previewImageUrl}
            alt={mat.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            fontSize: '12px'
          }}>
            No preview
          </div>
        )}
      </div>

      {/* Item Details */}
      <div style={{ flex: 1 }}>
        <h3
          onClick={() => mat && onViewMat(mat)}
          style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: '800',
            color: '#3A3A3A',
            cursor: mat ? 'pointer' : 'default',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => mat && (e.currentTarget.style.color = '#C78880')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#3A3A3A')}
        >
          {mat?.name || 'Mat'}
        </h3>

        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <span style={{
            padding: '4px 10px',
            background: 'rgba(121, 151, 127, 0.3)',
            border: '1px solid rgba(121, 151, 127, 0.6)',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '700',
            color: '#A86E67',
            textTransform: 'capitalize'
          }}>
            {mat?.matSize || 'N/A'}
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          {/* Quantity Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#64748b'
            }}>
              Qty:
            </span>
            <button
              onClick={() => handleQuantityChange(cartItem.quantity - 1)}
              disabled={cartItem.quantity <= 1 || updating}
              style={{
                width: '32px',
                height: '32px',
                background: 'white',
                border: '2px solid rgba(121, 151, 127, 0.6)',
                borderRadius: '6px',
                fontSize: '18px',
                fontWeight: '700',
                color: '#3A3A3A',
                cursor: cartItem.quantity <= 1 ? 'not-allowed' : 'pointer',
                opacity: cartItem.quantity <= 1 ? 0.4 : 1
              }}
            >
              -
            </button>
            <span style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#3A3A3A',
              minWidth: '30px',
              textAlign: 'center'
            }}>
              {cartItem.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(cartItem.quantity + 1)}
              disabled={updating}
              style={{
                width: '32px',
                height: '32px',
                background: 'white',
                border: '2px solid rgba(121, 151, 127, 0.6)',
                borderRadius: '6px',
                fontSize: '18px',
                fontWeight: '700',
                color: '#3A3A3A',
                cursor: 'pointer'
              }}
            >
              +
            </button>
          </div>

          {/* Price */}
          <div>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#64748b',
              marginRight: '8px'
            }}>
              Price:
            </span>
            <span style={{
              fontSize: '18px',
              fontWeight: '800',
              color: '#C78880'
            }}>
              ${totalPrice}
            </span>
          </div>

          {/* Remove Button */}
          <button
            onClick={handleRemove}
            disabled={updating}
            style={{
              marginLeft: 'auto',
              padding: '8px 16px',
              background: 'white',
              color: '#dc2626',
              border: '2px solid rgba(220, 38, 38, 0.2)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)';
              e.currentTarget.style.borderColor = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.2)';
            }}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
