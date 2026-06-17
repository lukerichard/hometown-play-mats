const CartConfirmationModal = ({
  item,
  onClose,
  onCheckout,
  checkoutLoading
}) => {
  if (!item) return null;

  return (
    <>
      <div className="cart-confirmation-scrim" onClick={onClose} />
      <section
        className="cart-confirmation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-confirmation-title"
      >
        <div className="cart-confirmation-header">
          <div>
            <span>Added to Cart</span>
            <h2 id="cart-confirmation-title">{item.name}</h2>
          </div>
          <button type="button" className="cart-confirmation-close" onClick={onClose} aria-label="Close cart summary">
            X
          </button>
        </div>

        <div className="cart-confirmation-body">
          <div className="cart-confirmation-image">
            {item.previewImage ? (
              <img src={item.previewImage} alt={`${item.name} preview`} />
            ) : (
              <div>No preview available</div>
            )}
          </div>

          <div className="cart-confirmation-details">
            <div className="cart-confirmation-row">
              <span>Size</span>
              <strong>{item.sizeName}</strong>
              <small>{item.dimensions}</small>
            </div>

            <div className="cart-confirmation-row">
              <span>Customization</span>
              <strong>{item.themeName}</strong>
              <small>{item.address}</small>
            </div>

            <div className="cart-confirmation-row">
              <span>Street Names</span>
              <strong>{item.showStreetNames ? 'Included' : 'Hidden'}</strong>
            </div>

            <div className="cart-confirmation-total">
              <div>
                <span>Quantity</span>
                <strong>{item.quantity}</strong>
              </div>
              <div>
                <span>Unit Price</span>
                <strong>${item.price.toFixed(2)}</strong>
              </div>
            </div>

            <p className="cart-confirmation-note">
              Checkout is opening soon. Join the launch list and we will email you when orders go live.
            </p>
          </div>
        </div>

        <div className="cart-confirmation-actions">
          <button type="button" className="secondary-action" onClick={onClose} disabled={checkoutLoading}>
            Close
          </button>
          <button type="button" className="primary-action" onClick={onCheckout} disabled={checkoutLoading}>
            {checkoutLoading ? 'Opening...' : 'Notify Me'}
          </button>
        </div>
      </section>
    </>
  );
};

export default CartConfirmationModal;
