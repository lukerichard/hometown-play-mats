import { useState } from 'react';
import { joinLaunchWaitlist } from '../../utils/waitlist';
import { getMatAspectRatio } from '../../utils/matDimensions';
import Logo from '../Logo';

const PRODUCT_DETAIL_IMAGE = '/images/play-mat-product-detail.png';
const CHECKOUT_ITEM_TITLE = 'Your Hometown Play Mat';

const ComingSoonCheckoutModal = ({
  open,
  onClose,
  userId = '',
  defaultEmail = '',
  source = 'checkout',
  selectedItem = null,
  cartItems = []
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const selectedItemAspectRatio = getMatAspectRatio(selectedItem?.matSize);

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const savedEmail = await joinLaunchWaitlist({
        email,
        userId,
        source,
        selectedItem,
        cartItems
      });
      setSuccess(`Your place is saved at ${savedEmail}.`);
    } catch (submitError) {
      setError(submitError.message || 'Could not save your place. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="cart-confirmation-scrim" onClick={onClose} />
      <section
        className="cart-confirmation-modal coming-soon-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="coming-soon-title"
      >
        <div className="cart-confirmation-header">
          <div>
            <span>Checkout Opens Soon</span>
            <h2 id="coming-soon-title">The first run of 20 is almost ready.</h2>
          </div>
          <button type="button" className="cart-confirmation-close" onClick={onClose} aria-label="Close">
            X
          </button>
        </div>

        <div className="coming-soon-content">
          <p>
            Leave your email and we will hold your place for when{' '}
            <Logo size={16} gap={4} /> starts taking orders. Each
            founders&rsquo; mat ships with a numbered first-run tag and your family name on the
            map, included.
          </p>

          {selectedItem?.previewImage && (
            <div className="coming-soon-preview" style={{ '--mat-preview-ratio': selectedItemAspectRatio }}>
              <div className="coming-soon-preview-images">
                <img src={selectedItem.previewImage} alt={`${CHECKOUT_ITEM_TITLE} preview`} />
                <img
                  src={PRODUCT_DETAIL_IMAGE}
                  alt="Physical play mat showing its printed surface and non-slip backing"
                />
              </div>
              <div>
                <strong>{CHECKOUT_ITEM_TITLE}</strong>
                <span>{selectedItem.sizeName || selectedItem.matSize || 'Custom size'}</span>
              </div>
            </div>
          )}

          <form className="coming-soon-form" onSubmit={handleSubmit}>
            <label htmlFor="launch-email">Email address</label>
            <input
              id="launch-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />

            {error && <p className="cart-confirmation-error" role="alert">{error}</p>}
            {success && <p className="cart-confirmation-success" role="status">{success}</p>}

            <div className="cart-confirmation-actions">
              <button type="button" className="secondary-action" onClick={onClose} disabled={submitting}>
                Close
              </button>
              <button type="submit" className="primary-action" disabled={submitting}>
                {submitting ? 'Saving...' : 'Hold my place'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default ComingSoonCheckoutModal;
