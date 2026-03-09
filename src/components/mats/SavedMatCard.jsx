import { useState } from 'react';
import { deleteMat } from '../../utils/matStorage';

const SavedMatCard = ({ mat, onViewMat, isInCart }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const font = "'DM Sans', 'Poppins', sans-serif";

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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.10)',
        transition: 'all 0.2s',
        border: '2px solid transparent',
        fontFamily: font
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
        e.currentTarget.style.borderColor = '#3DAEF5';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.10)';
        e.currentTarget.style.borderColor = 'transparent';
      }}>
        {/* Preview Image */}
        <div style={{ position: 'relative', paddingTop: '75%', background: '#F0F7ED', overflow: 'hidden' }}>
          {mat.previewImageUrl ? (
            <img src={mat.previewImageUrl} alt={mat.name} style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover'
            }} />
          ) : (
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#5A5A5A', fontSize: '14px'
            }}>
              No preview available
            </div>
          )}

          {isInCart && (
            <div style={{
              position: 'absolute', top: '12px', right: '12px',
              padding: '4px 12px', background: '#5EC269', color: 'white',
              borderRadius: '999px', fontSize: '12px', fontWeight: '700',
              letterSpacing: '0.5px', textTransform: 'uppercase',
              boxShadow: '0 2px 8px rgba(94, 194, 105, 0.4)',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              IN CART
            </div>
          )}
        </div>

        {/* Card Content */}
        <div style={{ padding: '20px' }}>
          <h3 style={{
            margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800',
            color: '#2D2D2D', fontFamily: font
          }}>
            {mat.name}
          </h3>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{
              padding: '4px 12px', background: '#D6EFFF', borderRadius: '999px',
              fontSize: '12px', fontWeight: '700', color: '#3DAEF5', textTransform: 'uppercase'
            }}>
              {mat.matSize}
            </span>
            <span style={{
              padding: '4px 12px', background: '#F0F7ED', borderRadius: '999px',
              fontSize: '12px', fontWeight: '700', color: '#5A5A5A', textTransform: 'uppercase'
            }}>
              {mat.colorScheme}
            </span>
          </div>

          <div style={{ fontSize: '13px', color: '#5A5A5A', marginBottom: '16px', fontWeight: '500' }}>
            Created {formatDate(mat.createdAt)}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => onViewMat(mat)} style={{
              flex: 1, padding: '12px', background: '#3DAEF5', color: 'white',
              border: 'none', borderRadius: '999px', fontSize: '14px', fontWeight: '700',
              cursor: 'pointer', fontFamily: font, transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#2A9BE0'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#3DAEF5'}>
              Load
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} style={{
              padding: '12px 16px', background: 'white', color: '#E84545',
              border: '2.5px solid rgba(232, 69, 69, 0.2)', borderRadius: '999px',
              fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: font, transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fde8e8'; e.currentTarget.style.borderColor = '#E84545'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'rgba(232, 69, 69, 0.2)'; }}>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div onClick={() => setShowDeleteConfirm(false)} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)', zIndex: 9999, backdropFilter: 'blur(4px)'
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '400px',
            zIndex: 10000, boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', fontFamily: font
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#E84545', marginBottom: '8px', fontFamily: "'Poppins', sans-serif" }}>
              Delete "{mat.name}"?
            </h3>
            <p style={{ fontSize: '15px', color: '#5A5A5A', marginBottom: '24px', lineHeight: '1.6' }}>
              This action cannot be undone. This mat will be permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting} style={{
                flex: 1, padding: '14px', background: 'white', border: '2.5px solid #E0DDD5',
                borderRadius: '999px', fontSize: '15px', fontWeight: '700',
                cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: font
              }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} style={{
                flex: 1, padding: '14px', background: deleting ? '#B0A999' : '#E84545',
                color: 'white', border: 'none', borderRadius: '999px', fontSize: '15px', fontWeight: '700',
                cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: font
              }}>
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
