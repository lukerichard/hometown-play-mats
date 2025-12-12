import { useState } from 'react';
import { deleteMat } from '../../utils/matStorage';

const SavedMatCard = ({ mat, onViewMat, isInCart }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteMat(mat.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting mat:', error);
      alert('Failed to delete mat. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s',
        border: '2px solid transparent'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(16, 185, 129, 0.2)';
        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.borderColor = 'transparent';
      }}>
        {/* Preview Image */}
        <div style={{
          position: 'relative',
          paddingTop: '75%',
          background: '#f8fafb',
          overflow: 'hidden'
        }}>
          {mat.previewImageUrl ? (
            <img
              src={mat.previewImageUrl}
              alt={mat.name}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              fontSize: '14px'
            }}>
              No preview available
            </div>
          )}

          {/* In Cart Badge */}
          {isInCart && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              padding: '6px 12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '800',
              letterSpacing: '0.5px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              🛒 IN CART
            </div>
          )}
        </div>

        {/* Card Content */}
        <div style={{ padding: '20px' }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: '800',
            color: '#1e293b',
            letterSpacing: '-0.3px'
          }}>
            {mat.name}
          </h3>

          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '16px',
            flexWrap: 'wrap'
          }}>
            <span style={{
              padding: '4px 12px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#059669',
              textTransform: 'capitalize'
            }}>
              {mat.matSize}
            </span>
            <span style={{
              padding: '4px 12px',
              background: 'rgba(100, 116, 139, 0.1)',
              border: '1px solid rgba(100, 116, 139, 0.2)',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#475569',
              textTransform: 'capitalize'
            }}>
              {mat.colorScheme}
            </span>
          </div>

          <div style={{
            fontSize: '13px',
            color: '#64748b',
            marginBottom: '16px',
            fontWeight: '500'
          }}>
            Created {formatDate(mat.createdAt)}
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            <button
              onClick={() => onViewMat(mat)}
              style={{
                flex: 1,
                padding: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Load
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                padding: '12px 16px',
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
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div
            onClick={() => setShowDeleteConfirm(false)}
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
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '400px',
            zIndex: 10000,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '800',
              color: '#dc2626',
              marginBottom: '8px'
            }}>
              Delete "{mat.name}"?
            </h3>
            <p style={{
              fontSize: '15px',
              color: '#64748b',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              This action cannot be undone. This mat will be permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'white',
                  border: '2px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: deleting ? '#9ca3af' : '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SavedMatCard;
