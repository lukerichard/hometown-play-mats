import { useState } from 'react';
import { joinLaunchWaitlist } from '../../utils/waitlist';

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
      setSuccess(`You're on the launch list at ${savedEmail}.`);
    } catch (submitError) {
      setError(submitError.message || 'Could not join the launch list. Please try again.');
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
            <span>Checkout Coming Soon</span>
            <h2 id="coming-soon-title">We are almost ready to launch.</h2>
          </div>
          <button type="button" className="cart-confirmation-close" onClick={onClose} aria-label="Close">
            X
          </button>
        </div>

        <div className="coming-soon-content">
          <p>
            Leave your email and we will let you know as soon as Hometown Play Mats is ready to take orders.
          </p>

          {selectedItem?.previewImage && (
            <div className="coming-soon-preview">
              <img src={selectedItem.previewImage} alt={`${selectedItem.name || 'Custom play mat'} preview`} />
              <div>
                <strong>{selectedItem.name || 'Custom Play Mat'}</strong>
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
                {submitting ? 'Joining...' : 'Notify Me'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default ComingSoonCheckoutModal;
