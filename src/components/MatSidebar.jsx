import { useState } from 'react';
import schoolPinIconUrl from '../../icons/school.png';
import parkPinIconUrl from '../../icons/park.png';
import playgroundPinIconUrl from '../../icons/playground.png';
import grandparentsPinIconUrl from '../../icons/grandparents.png';
import homePinIconUrl from '../../icons/home.png';
import customPinIconUrl from '../../icons/custom.png';

const CUSTOM_PIN_ICON_OPTIONS = [
  { id: 'custom', label: 'Custom', src: customPinIconUrl },
  { id: 'school', label: 'School', src: schoolPinIconUrl },
  { id: 'park', label: 'Park', src: parkPinIconUrl },
  { id: 'playground', label: 'Playground', src: playgroundPinIconUrl },
  { id: 'grandparents', label: 'Family', src: grandparentsPinIconUrl },
  { id: 'home', label: 'Home', src: homePinIconUrl },
];

const MatSidebar = ({
  matSize,
  setMatSize,
  matSizes,
  selectedSize,
  showStreetNames,
  setShowStreetNames,
  showLandmarks,
  setShowLandmarks,
  showLandmarkNames,
  setShowLandmarkNames,
  customPins = [],
  customPinAddress,
  onCustomPinAddressChange,
  customPinSuggestions = [],
  showCustomPinSuggestions,
  setShowCustomPinSuggestions,
  onSelectCustomPinSuggestion,
  customPinDescription,
  setCustomPinDescription,
  customPinIconId = 'custom',
  setCustomPinIconId,
  customPinDraft,
  onPlaceCustomPin,
  onDropCustomPinAtCenter,
  onSaveCustomPin,
  onUpdateCustomPin,
  onClearCustomPin,
  isPlacingCustomPin = false,
  onSaveForLater,
  onAddToCart,
  isAddingToCart = false,
  onClose,
  idPrefix = 'mat'
}) => {
  const sizeOptions = Object.entries(matSizes);
  const [expandedSection, setExpandedSection] = useState(null);
  const [isCustomPinOpen, setIsCustomPinOpen] = useState(false);
  const [customPinMode, setCustomPinMode] = useState('address');

  const toggleSection = (section) => {
    setExpandedSection((current) => (current === section ? null : section));
  };

  return (
    <aside className={`shopping-card ${expandedSection ? 'has-expanded-section' : ''}`}>
      <div className="shopping-card-head">
        <div>
          <span className="shopping-card-kicker">Custom Play Mat</span>
          <h2>Map Builder</h2>
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
            Map Customization
          </span>
          <span className="section-expand-indicator" aria-hidden="true">+</span>
        </button>

        <div className="shopping-section-body">
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

          <label className="street-toggle">
            <span>
              <strong>Show Landmarks</strong>
              <small>Schools, parks, and playgrounds</small>
            </span>
            <input
              type="checkbox"
              checked={showLandmarks}
              onChange={(event) => setShowLandmarks(event.target.checked)}
            />
          </label>

          <label className="street-toggle">
            <span>
              <strong>Show Landmark Names</strong>
              <small>Print full landmark names beside the badges</small>
            </span>
            <input
              type="checkbox"
              checked={showLandmarkNames}
              onChange={(event) => setShowLandmarkNames(event.target.checked)}
              disabled={!showLandmarks}
            />
          </label>
        </div>
      </section>

      <section className={`shopping-card-section custom-pins-section ${expandedSection === 'custom-pins' ? 'is-expanded' : ''}`}>
        <button
          type="button"
          className="shopping-section-toggle"
          onClick={() => toggleSection('custom-pins')}
          aria-expanded={expandedSection === 'custom-pins'}
        >
          <span className="builder-card-title">
            <span className="builder-card-icon icon-pin" aria-hidden="true" />
            Custom Pins
          </span>
          <span className="section-expand-indicator" aria-hidden="true">+</span>
        </button>

        <div className="shopping-section-body">
          {!isCustomPinOpen ? (
            <button type="button" className="secondary-action custom-pin-add" onClick={() => setIsCustomPinOpen(true)}>
              Add Custom Pin
            </button>
          ) : (
            <div className="custom-pin-control">
              <div className="custom-pin-head">
                <strong>Add Custom Pin</strong>
                <button type="button" onClick={() => setIsCustomPinOpen(false)}>
                  Hide
                </button>
              </div>

              <div className="custom-pin-mode-toggle" role="tablist" aria-label="Custom pin placement method">
                <button
                  type="button"
                  className={customPinMode === 'address' ? 'is-active' : ''}
                  onClick={() => setCustomPinMode('address')}
                  role="tab"
                  aria-selected={customPinMode === 'address'}
                >
                  Enter address
                </button>
                <button
                  type="button"
                  className={customPinMode === 'drop' ? 'is-active' : ''}
                  onClick={() => setCustomPinMode('drop')}
                  role="tab"
                  aria-selected={customPinMode === 'drop'}
                >
                  Drag and drop
                </button>
              </div>

              {customPinMode === 'address' ? (
                <>
                  <label className="builder-label" htmlFor={`${idPrefix}-custom-pin-address`}>
                    Enter address
                  </label>
                  <input
                    id={`${idPrefix}-custom-pin-address`}
                    className="builder-input"
                    type="text"
                    value={customPinAddress}
                    onChange={onCustomPinAddressChange}
                    onKeyDown={(event) => event.key === 'Enter' && onPlaceCustomPin()}
                    onFocus={() => customPinSuggestions.length > 0 && setShowCustomPinSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowCustomPinSuggestions(false), 200)}
                    placeholder="Enter an address"
                  />
                  {showCustomPinSuggestions && customPinSuggestions.length > 0 && (
                    <div className="custom-pin-suggestions">
                      {customPinSuggestions.map((suggestion, index) => (
                        <button
                          key={suggestion.id || index}
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            onSelectCustomPinSuggestion(suggestion);
                          }}
                        >
                          <strong>{suggestion.text}</strong>
                          <small>{suggestion.place_name}</small>
                        </button>
                      ))}
                    </div>
                  )}
                  <button type="button" className="secondary-action custom-pin-place-button" onClick={onPlaceCustomPin} disabled={isPlacingCustomPin}>
                    {isPlacingCustomPin ? 'Finding...' : 'Place Pin'}
                  </button>
                </>
              ) : (
                <button type="button" className="secondary-action custom-pin-place-button" onClick={onDropCustomPinAtCenter}>
                  Drop Pin
                </button>
              )}

              <label className="builder-label" htmlFor={`${idPrefix}-custom-pin-description`}>
                Description
              </label>
              <textarea
                id={`${idPrefix}-custom-pin-description`}
                className="builder-input custom-pin-description"
                value={customPinDescription}
                onChange={(event) => setCustomPinDescription(event.target.value)}
                placeholder="Text shown under the pin"
              />
              <fieldset className="custom-pin-icon-picker">
                <legend className="builder-label">Pin icon</legend>
                <div className="custom-pin-icon-options">
                  {CUSTOM_PIN_ICON_OPTIONS.map((icon) => (
                    <label key={icon.id} className={customPinIconId === icon.id ? 'is-active' : ''}>
                      <input
                        type="radio"
                        name={`${idPrefix}-custom-pin-icon`}
                        value={icon.id}
                        checked={customPinIconId === icon.id}
                        onChange={() => setCustomPinIconId(icon.id)}
                      />
                      <img src={icon.src} alt="" aria-hidden="true" />
                      <span>{icon.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              {customPinDraft && (
                <p className="custom-pin-draft-note">
                  Pin placed. Drag it on the map if needed, then save.
                </p>
              )}
              <button type="button" className="primary-action custom-pin-save" onClick={onSaveCustomPin} disabled={!customPinDraft}>
                Save Pin
              </button>
            </div>
          )}

          <div className="custom-pin-stack">
            {customPins.length === 0 ? (
              <p className="custom-pin-empty">No custom pins added.</p>
            ) : customPins.map((pin, index) => (
              <div className="custom-pin-item" key={pin.id}>
                <div className="custom-pin-item-head">
                  <strong>Pin {index + 1}</strong>
                  <button type="button" onClick={() => onClearCustomPin(pin.id)}>Clear</button>
                </div>
                <small>{pin.address || 'Dropped at map center'}</small>
                <label className="builder-label" htmlFor={`${idPrefix}-custom-pin-${pin.id}-description`}>
                  Description
                </label>
                <input
                  id={`${idPrefix}-custom-pin-${pin.id}-description`}
                  className="builder-input"
                  type="text"
                  value={pin.description || ''}
                  onChange={(event) => onUpdateCustomPin(pin.id, { description: event.target.value })}
                  placeholder="Text shown under the pin"
                />
                <fieldset className="custom-pin-icon-picker">
                  <legend className="builder-label">Pin icon</legend>
                  <div className="custom-pin-icon-options">
                    {CUSTOM_PIN_ICON_OPTIONS.map((icon) => (
                      <label key={icon.id} className={(pin.iconId || 'custom') === icon.id ? 'is-active' : ''}>
                        <input
                          type="radio"
                          name={`${idPrefix}-custom-pin-${pin.id}-icon`}
                          value={icon.id}
                          checked={(pin.iconId || 'custom') === icon.id}
                          onChange={() => onUpdateCustomPin(pin.id, { iconId: icon.id })}
                        />
                        <img src={icon.src} alt="" aria-hidden="true" />
                        <span>{icon.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            ))}
          </div>
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

        <div className="shopping-section-body size-options">
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
