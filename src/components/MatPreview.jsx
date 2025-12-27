import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MatPreview = ({
  previewImage,
  matSize,
  colorScheme,
  matSizes,
  colorSchemes,
  savedMatId,
  matName,
  cartItem,
  onBackToEdit,
  onAddToCart,
  onUpdateQuantity,
  onSave
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onBackToEdit}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}
      />

      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '1200px',
          maxHeight: '90vh',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          zIndex: 10000,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #C78880 0%, #A86E67 100%)',
          padding: '24px 32px',
          color: 'white',
          position: 'relative'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: '800',
            letterSpacing: '-0.5px'
          }}>
            ✨ Preview Your Play Mat
          </h2>
          <button
            onClick={onBackToEdit}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '40px',
              height: '40px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s',
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden'
        }}>
          {/* Preview Image */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            background: '#f8fafb',
            overflowY: 'auto'
          }}>
            <div style={{
              maxWidth: '600px',
              width: '100%'
            }}>
              <img
                src={previewImage}
                alt="Play Mat Preview"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '12px',
                  display: 'block',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
                }}
              />
            </div>
          </div>

          {/* Settings Panel */}
          <div style={{
            width: '350px',
            background: 'white',
            padding: '32px',
            overflowY: 'auto',
            borderLeft: '1px solid #e5e7eb'
          }}>
          <h2 style={{
            color: '#3A3A3A',
            marginBottom: '24px',
            fontSize: '24px',
            fontWeight: '800',
            letterSpacing: '-0.5px'
          }}>
            Your Configuration
          </h2>

          {/* Mat Size */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '10px'
            }}>
              Mat Size
            </div>
            <div style={{
              padding: '16px',
              background: 'white',
              border: '2px solid rgba(121, 151, 127, 0.6)',
              borderRadius: '10px'
            }}>
              <div style={{
                fontWeight: '700',
                color: '#3A3A3A',
                fontSize: '16px',
                marginBottom: '4px'
              }}>
                {matSizes[matSize].name}
              </div>
              <div style={{
                fontSize: '13px',
                color: '#64748b',
                fontWeight: '500'
              }}>
                {matSizes[matSize].dimensions}
              </div>
            </div>
          </div>

          {/* Color Scheme */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '10px'
            }}>
              Color Scheme
            </div>
            <div style={{
              padding: '16px',
              background: 'white',
              border: '2px solid rgba(121, 151, 127, 0.6)',
              borderRadius: '10px'
            }}>
              <div style={{
                fontWeight: '700',
                color: '#3A3A3A',
                fontSize: '16px'
              }}>
                {colorSchemes[colorScheme].name}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Cart Controls */}
            {cartItem ? (
              <div style={{
                background: 'rgba(74, 93, 78, 0.15)',
                border: '2px solid rgba(74, 93, 78, 0.4)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#4A5D4E',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ fontSize: '16px' }}>✓</span> In Cart
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#3A3A3A'
                  }}>
                    Quantity:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      onClick={() => onUpdateQuantity(cartItem.quantity - 1)}
                      style={{
                        width: '36px',
                        height: '36px',
                        background: 'white',
                        border: '2px solid rgba(74, 93, 78, 0.4)',
                        borderRadius: '8px',
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#3A3A3A',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(74, 93, 78, 0.15)';
                        e.currentTarget.style.borderColor = '#4A5D4E';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.borderColor = 'rgba(74, 93, 78, 0.4)';
                      }}
                    >
                      -
                    </button>
                    <span style={{
                      fontSize: '20px',
                      fontWeight: '800',
                      color: '#4A5D4E',
                      minWidth: '40px',
                      textAlign: 'center'
                    }}>
                      {cartItem.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(cartItem.quantity + 1)}
                      style={{
                        width: '36px',
                        height: '36px',
                        background: 'white',
                        border: '2px solid rgba(74, 93, 78, 0.4)',
                        borderRadius: '8px',
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#3A3A3A',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(74, 93, 78, 0.15)';
                        e.currentTarget.style.borderColor = '#4A5D4E';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.borderColor = 'rgba(74, 93, 78, 0.4)';
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={async () => {
                  setIsAdding(true);
                  await onAddToCart();
                  setIsAdding(false);
                }}
                disabled={isAdding}
                style={{
                  width: '100%',
                  padding: '18px',
                  background: isAdding ? '#9ca3af' : 'linear-gradient(135deg, #C78880 0%, #A86E67 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '18px',
                  fontWeight: '800',
                  cursor: isAdding ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: '0.3px',
                  boxShadow: '0 4px 20px rgba(121, 151, 127, 0.5)',
                  transform: isAdding ? 'scale(0.98)' : 'scale(1)'
                }}
                onMouseEnter={(e) => !isAdding && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => !isAdding && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {isAdding ? '✓ Added!' : '🛒 Add to Cart'}
              </button>
            )}

            {/* Secondary Action - Save for Later */}
            {!savedMatId && (
              <button
                onClick={onSave}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'white',
                  color: '#C78880',
                  border: '2px solid rgba(121, 151, 127, 0.5)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: '0.3px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(121, 151, 127, 0.3)';
                  e.currentTarget.style.borderColor = '#C78880';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = 'rgba(121, 151, 127, 0.5)';
                }}
              >
                💾 Save for Later
              </button>
            )}

            {/* Update Mat Name Button - Shows when mat is already saved */}
            {savedMatId && (
              <button
                onClick={onSave}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'white',
                  color: '#C78880',
                  border: '2px solid rgba(121, 151, 127, 0.5)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: '0.3px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(121, 151, 127, 0.3)';
                  e.currentTarget.style.borderColor = '#C78880';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = 'rgba(121, 151, 127, 0.5)';
                }}
              >
                ✏️ Rename Mat
              </button>
            )}

            {/* View Cart Button */}
            <button
              onClick={() => navigate('/cart')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'white',
                color: '#C78880',
                border: '2px solid rgba(121, 151, 127, 0.5)',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '0.3px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(121, 151, 127, 0.3)';
                e.currentTarget.style.borderColor = '#C78880';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = 'rgba(121, 151, 127, 0.5)';
              }}
            >
              🛒 View Cart
            </button>

            <button
              onClick={onBackToEdit}
              style={{
                width: '100%',
                padding: '12px',
                background: 'white',
                color: '#64748b',
                border: '2px solid rgba(100, 116, 139, 0.2)',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '0.3px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(100, 116, 139, 0.05)';
                e.currentTarget.style.borderColor = '#64748b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.2)';
              }}
            >
              ← Back to Edit
            </button>
          </div>

            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: 'rgba(121, 151, 127, 0.3)',
              border: '1px solid rgba(121, 151, 127, 0.5)',
              borderRadius: '10px',
              fontSize: '13px',
              color: '#8A5139',
              fontWeight: '500',
              lineHeight: '1.6'
            }}>
              <strong>Ready to order?</strong><br />
              Add to cart to proceed to checkout, or save for later to come back and order anytime!
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MatPreview;
