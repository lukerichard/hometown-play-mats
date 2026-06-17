import { useState } from 'react';

const MatSidebar = ({
  matSize,
  setMatSize,
  matName,
  setMatName,
  matSizes,
  selectedSize,
  showStreetNames,
  setShowStreetNames,
  onSaveForLater,
  onAddToCart,
  isAddingToCart = false,
  onClose,
  idPrefix = 'mat'
}) => {
  const sizeOptions = Object.entries(matSizes);
  const matTitleId = `${idPrefix}-title`;
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection((current) => (current === section ? null : section));
  };

  return (
    <aside className={`shopping-card ${expandedSection ? 'has-expanded-section' : ''}`}>
      <div className="shopping-card-head">
        <div>
          <span className="shopping-card-kicker">Custom Play Mat</span>
          <h2>{matName || 'Custom Play Mat'}</h2>
        </div>
        {onClose && (
          <button type="button" className="shopping-card-close" onClick={onClose} aria-label="Close customization panel">
            Close
          </button>
        )}
      </div>

      <section className={`shopping-card-section personalize-section ${expandedSection === 'personalize' ? 'is-expanded' : ''}`}>
        <button
          type="button"
          className="shopping-section-toggle"
          onClick={() => toggleSection('personalize')}
          aria-expanded={expandedSection === 'personalize'}
        >
          <span className="builder-card-title">
            <span className="builder-card-icon icon-edit" aria-hidden="true" />
            Personalize
          </span>
          <span className="section-expand-indicator" aria-hidden="true">+</span>
        </button>

        <div className="shopping-section-body">
          <label className="builder-label" htmlFor={matTitleId}>
            Child's Name or Title
          </label>
          <input
            id={matTitleId}
            type="text"
            value={matName}
            onChange={(event) => setMatName(event.target.value)}
            placeholder="Leo's Little London"
            className="builder-input"
          />

          <label className="street-toggle">
            <span>
              <strong>Show Street Names</strong>
              <small>Recommended for discovery play</small>
            </span>
            <input
              type="checkbox"
              checked={showStreetNames}
              onChange={(event) => setShowStreetNames(event.target.checked)}
            />
          </label>
        </div>
      </section>

      <section className={`shopping-card-section size-section ${expandedSection === 'size' ? 'is-expanded' : ''}`}>
        <button
          type="button"
          className="shopping-section-toggle"
          onClick={() => toggleSection('size')}
          aria-expanded={expandedSection === 'size'}
        >
          <span className="builder-card-title">
            <span className="builder-card-icon icon-size" aria-hidden="true" />
            Select Size
          </span>
          <span className="section-expand-indicator" aria-hidden="true">+</span>
        </button>

        <div className="shopping-section-body flex flex-col gap-2">
          {sizeOptions.map(([key, size]) => {
            const isActive = matSize === key;

            return (
              <button
                key={key}
                type="button"
                className={`size-row ${isActive ? 'is-active' : ''}`}
                onClick={() => setMatSize(key)}
              >
                <span className="size-row-name">
                  <strong>{size.name}</strong>
                  <small>{size.dimensions}</small>
                </span>
                <strong>${size.price.toFixed(2)}</strong>
              </button>
            );
          })}
        </div>
      </section>

      <section className="shopping-card-purchase">
        <div className="checkout-summary">
          <div>
            <span>TOTAL PRICE</span>
            <strong>${selectedSize.price.toFixed(2)}</strong>
          </div>
          <div className="delivery-estimate">
            <span>Delivery Estimate</span>
            <strong>Oct 24 - Oct 28</strong>
          </div>
        </div>
        <div className="shopping-card-actions">
          <button type="button" className="primary-action" onClick={onAddToCart} disabled={isAddingToCart}>
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
          <button type="button" className="secondary-action" onClick={onSaveForLater}>
            Save for Later
          </button>
        </div>
      </section>
    </aside>
  );
};

export default MatSidebar;
