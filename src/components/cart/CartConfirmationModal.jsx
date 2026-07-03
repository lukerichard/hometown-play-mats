import { useState } from 'react';
import { getMatAspectRatio } from '../../utils/matDimensions';
import ZoomableImage from '../ZoomableImage';

const PRODUCT_DETAIL_IMAGE = '/images/play-mat-product-detail.png';
const HOT_WHEELS_CAR_IMAGE = '/images/hot-wheels-car.png';

const MAT_DIMENSIONS = {
  small: { width: 36, height: 24 },
  medium: { width: 48, height: 36 },
  large: { width: 60, height: 48 }
};

const CART_ITEM_TITLE = 'Your Hometown Play Mat';

const MatScaleDiagram = ({ previewImage, name, matSize }) => {
  const dimensions = MAT_DIMENSIONS[matSize] || MAT_DIMENSIONS.medium;
  const carWidthPercent = (1.5 / dimensions.width) * 100;
  const carLengthPercent = (3 / dimensions.width) * 100;

  return (
  <div
    className="mat-scale-diagram"
    style={{
      '--mat-ratio': `${dimensions.width} / ${dimensions.height}`,
      '--car-width': `${carWidthPercent}%`,
      '--car-length': `${carLengthPercent}%`
    }}
  >
    <div className="mat-scale-stage">
      <div className="mat-scale-height" aria-hidden="true">
        <span>{dimensions.height} inches</span>
      </div>
      <div className="mat-scale-customer-frame">
        <img
          className="mat-scale-customer-image"
          src={previewImage}
          alt={`${name} shown at medium mat dimensions`}
        />
      </div>
      <div className="mat-scale-width" aria-hidden="true">
        <span>{dimensions.width} inches</span>
      </div>
      <div className="mat-scale-car-reference">
        <strong>Scale Hot Wheels car</strong>
        <img
          className="mat-scale-car"
          src={HOT_WHEELS_CAR_IMAGE}
          alt="Hot Wheels car shown at scale"
        />
      </div>
    </div>
  </div>
  );
};

const CartConfirmationModal = ({
  item,
  onClose,
  onCheckout,
  checkoutLoading
}) => {
  const [activeImage, setActiveImage] = useState('design');

  if (!item) return null;
  const previewAspectRatio = getMatAspectRatio(item.matSize);
  const hasScaleImage = Boolean(MAT_DIMENSIONS[item.matSize]);
  const showingDesign = activeImage === 'design' && item.previewImage;
  const displayedImage = showingDesign
    ? item.previewImage
    : PRODUCT_DETAIL_IMAGE;
  const displayedAlt = showingDesign
    ? `${CART_ITEM_TITLE} custom map preview`
    : 'Physical play mat showing its printed surface and non-slip backing';
  const customPinCount = item.customPins?.length || (item.customPin ? 1 : 0);

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
            <h2 id="cart-confirmation-title">{CART_ITEM_TITLE}</h2>
          </div>
          <button type="button" className="cart-confirmation-close" onClick={onClose} aria-label="Close cart summary">
            X
          </button>
        </div>

        <div className="cart-confirmation-body">
          <div className="cart-confirmation-gallery">
            <div
              className={`cart-confirmation-image ${
                activeImage === 'scale' ? 'is-scale-diagram' : showingDesign ? '' : 'is-product-image'
              }`}
              style={{ aspectRatio: showingDesign ? previewAspectRatio : undefined }}
            >
              {activeImage === 'scale' && hasScaleImage && item.previewImage ? (
                <MatScaleDiagram previewImage={item.previewImage} name={CART_ITEM_TITLE} matSize={item.matSize} />
              ) : (
                <ZoomableImage src={displayedImage} alt={displayedAlt} />
              )}
            </div>

            <div className="cart-image-options" aria-label="Product images">
              {item.previewImage && (
                <button
                  type="button"
                  className={activeImage === 'design' ? 'is-active' : ''}
                  onClick={() => setActiveImage('design')}
                  aria-pressed={activeImage === 'design'}
                >
                  <img src={item.previewImage} alt="" />
                  <span>Your map</span>
                </button>
              )}
              <button
                type="button"
                className={activeImage === 'product' || (!item.previewImage && activeImage !== 'scale') ? 'is-active' : ''}
                onClick={() => setActiveImage('product')}
                aria-pressed={activeImage === 'product' || (!item.previewImage && activeImage !== 'scale')}
              >
                <img src={PRODUCT_DETAIL_IMAGE} alt="" />
                <span>Mat details</span>
              </button>
              {hasScaleImage && (
                <button
                  type="button"
                  className={activeImage === 'scale' ? 'is-active' : ''}
                  onClick={() => setActiveImage('scale')}
                  aria-pressed={activeImage === 'scale'}
                >
                  <span className="cart-scale-thumbnail" aria-hidden="true">
                    <img src={item.previewImage || PRODUCT_DETAIL_IMAGE} alt="" />
                  </span>
                  <span>Size &amp; scale</span>
                </button>
              )}
            </div>
          </div>

          <div className="cart-confirmation-details">
            <div className="cart-confirmation-row">
              <span>Size</span>
              <strong>{item.sizeName}</strong>
              <small>{item.dimensions}</small>
            </div>

            <div className="cart-confirmation-row">
              <span>Street Names</span>
              <strong>{item.showStreetNames ? 'Included' : 'Hidden'}</strong>
            </div>

            <div className="cart-confirmation-row">
              <span>Landmarks</span>
              <strong>{item.showLandmarks ? 'Included' : 'Hidden'}</strong>
              {item.showLandmarks && (
                <small>
                  Names {item.showLandmarkNames ? 'included' : 'hidden'}
                </small>
              )}
            </div>

            <div className="cart-confirmation-row">
              <span>Custom Pins</span>
              <strong>{customPinCount ? `${customPinCount} added` : 'Not added'}</strong>
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
