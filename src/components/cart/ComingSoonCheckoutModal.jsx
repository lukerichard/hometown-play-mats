import { useState } from 'react';
import { joinLaunchWaitlist } from '../../utils/waitlist';

const ComingSoonCheckoutModal = ({
  open,
  onClose,
  userId = '',
  defaultEmail = '',
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
        source: 'cart-checkout',
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
      <div className="coming-soon-scrim" onClick={onClose} />
      <section
        className="coming-soon-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="coming-soon-title"
      >
        <div className="coming-soon-header">
          <div>
            <span>Checkout Coming Soon</span>
            <h2 id="coming-soon-title">We are almost ready to launch.</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            X
          </button>
        </div>

        <form className="coming-soon-form" onSubmit={handleSubmit}>
          <p>
            Leave your email and we will let you know as soon as Hometown Play Mats is ready to take orders.
          </p>

          <label htmlFor="launch-email">Email address</label>
          <input
            id="launch-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />

          {error && <p className="coming-soon-error" role="alert">{error}</p>}
          {success && <p className="coming-soon-success" role="status">{success}</p>}

          <div className="coming-soon-actions">
            <button type="button" className="secondary-action" onClick={onClose} disabled={submitting}>
              Close
            </button>
            <button type="submit" className="primary-action" disabled={submitting}>
              {submitting ? 'Joining...' : 'Notify Me'}
            </button>
          </div>
        </form>
      </section>
    </>
  );
};

export default ComingSoonCheckoutModal;
