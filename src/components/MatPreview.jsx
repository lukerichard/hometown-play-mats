import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ZoomableImage from './ZoomableImage';

const QUICKSAND = "'Quicksand', 'DM Sans', sans-serif";
const PRODUCT_DETAIL_IMAGE = '/images/play-mat-product-detail.png';

const MatPreview = ({
  previewImage,
  matSize,
  colorScheme,
  matSizes,
  colorSchemes,
  savedMatId,
  cartItem,
  onBackToEdit,
  onAddToCart,
  onUpdateQuantity,
  onSave
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [activeImage, setActiveImage] = useState('design');
  const navigate = useNavigate();
  const displayedImage = activeImage === 'design' ? previewImage : PRODUCT_DETAIL_IMAGE;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onBackToEdit}
        className="fixed inset-0 z-[9999] bg-[#191c1e]/50 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[1200px] max-h-[90vh] bg-white rounded-2xl z-[10000] overflow-hidden flex flex-col border border-[#c5c6cc] animate-fade-in"
        style={{ boxShadow: '0 24px 60px rgba(33, 43, 58, 0.22)', fontFamily: QUICKSAND }}
      >
        {/* Modal Header */}
        <div className="px-8 py-5 text-white relative" style={{ background: '#374151' }}>
          <h2 className="m-0 text-2xl font-bold tracking-tight" style={{ fontFamily: QUICKSAND }}>
            Preview Your Play Mat
          </h2>
          <button
            onClick={onBackToEdit}
            className="absolute top-4 right-4 w-9 h-9 border-none bg-white/20 text-white rounded-full cursor-pointer text-xl flex items-center justify-center transition-colors duration-200 hover:bg-white/30 font-bold"
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Preview Image */}
          <div className="flex-1 flex items-center justify-center p-10 overflow-y-auto" style={{ background: '#f7f9fb' }}>
            <div className="max-w-[600px] w-full">
              <div className="relative">
                <ZoomableImage
                  src={displayedImage}
                  alt={activeImage === 'design'
                    ? 'Your custom play mat design'
                    : 'Physical play mat showing its printed surface and non-slip backing'}
                  className="w-full h-auto max-h-[58vh] object-contain rounded-xl block bg-white"
                  style={{ boxShadow: '0 12px 32px rgba(33, 43, 58, 0.16)' }}
                />
                <span
                  className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
                  style={{ background: 'rgba(255, 255, 255, 0.92)', color: '#212b3a' }}
                >
                  {activeImage === 'design' ? 'Your design' : 'Product details'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4" aria-label="Product images">
                <button
                  type="button"
                  onClick={() => setActiveImage('design')}
                  aria-pressed={activeImage === 'design'}
                  className="flex items-center gap-3 p-2.5 rounded-xl text-left cursor-pointer bg-white transition-colors"
                  style={{
                    border: activeImage === 'design' ? '2px solid #212b3a' : '1px solid #c5c6cc',
                    color: '#212b3a'
                  }}
                >
                  <img src={previewImage} alt="" className="w-14 h-12 rounded-lg object-cover bg-[#f7f9fb]" />
                  <span className="text-xs font-bold">Your map</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImage('product')}
                  aria-pressed={activeImage === 'product'}
                  className="flex items-center gap-3 p-2.5 rounded-xl text-left cursor-pointer bg-white transition-colors"
                  style={{
                    border: activeImage === 'product' ? '2px solid #212b3a' : '1px solid #c5c6cc',
                    color: '#212b3a'
                  }}
                >
                  <img src={PRODUCT_DETAIL_IMAGE} alt="" className="w-14 h-12 rounded-lg object-cover bg-[#f7f9fb]" />
                  <span className="text-xs font-bold">Mat details</span>
                </button>
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          <div
            className="w-[340px] bg-white p-7 overflow-y-auto border-l border-[#c5c6cc]"
            style={{ fontFamily: QUICKSAND }}
          >
            <h2 className="text-xl font-bold mb-5 tracking-tight" style={{ color: '#212b3a' }}>
              Your Configuration
            </h2>

            {/* Mat Size */}
            <div className="mb-5">
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: '#44474c' }}>
                Mat Size
              </div>
              <div className="p-4 bg-white border border-[#c5c6cc] rounded-2xl">
                <div className="text-sm font-bold mb-0.5" style={{ color: '#212b3a' }}>
                  {matSizes[matSize].name}
                </div>
                <div className="text-xs font-medium" style={{ color: '#44474c' }}>
                  {matSizes[matSize].dimensions}
                </div>
              </div>
            </div>

            {/* Color Scheme */}
            <div className="mb-7">
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: '#44474c' }}>
                Color Scheme
              </div>
              <div className="p-4 bg-white border border-[#c5c6cc] rounded-2xl flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full shrink-0"
                  style={{ background: colorSchemes[colorScheme].color }}
                />
                <div className="text-sm font-bold" style={{ color: '#212b3a' }}>
                  {colorSchemes[colorScheme].name}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {/* Cart Controls */}
              {cartItem ? (
                <div
                  className="border rounded-2xl p-4"
                  style={{ background: '#e7f8ee', borderColor: 'rgba(34, 197, 94, 0.35)' }}
                >
                  <div
                    className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5"
                    style={{ color: '#15803d' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    In Cart
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: '#212b3a' }}>Quantity:</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onUpdateQuantity(cartItem.quantity - 1)}
                        className="w-8 h-8 bg-white border border-[#c5c6cc] rounded-lg text-lg font-bold cursor-pointer transition-all duration-150 hover:border-[#212b3a]"
                        style={{ color: '#212b3a' }}
                      >-</button>
                      <span className="text-lg font-bold min-w-[32px] text-center" style={{ color: '#16a34a' }}>
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(cartItem.quantity + 1)}
                        className="w-8 h-8 bg-white border border-[#c5c6cc] rounded-lg text-lg font-bold cursor-pointer transition-all duration-150 hover:border-[#212b3a]"
                        style={{ color: '#212b3a' }}
                      >+</button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={async () => { setIsAdding(true); await onAddToCart(); setIsAdding(false); }}
                  disabled={isAdding}
                  className="w-full py-4 border-none rounded-full text-base font-bold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    fontFamily: QUICKSAND,
                    background: isAdding ? '#B0A999' : '#facc15',
                    color: isAdding ? '#ffffff' : '#212b3a',
                    boxShadow: isAdding ? 'none' : '0 3px 0 #d9a800',
                  }}
                >
                  {isAdding ? 'Added!' : 'Add to Cart'}
                </button>
              )}

              {/* Save for Later / Rename */}
              <button
                onClick={onSave}
                className="w-full py-3 bg-white border-2 border-[#c5c6cc] rounded-full text-sm font-bold cursor-pointer transition-all duration-200 hover:border-[#212b3a]"
                style={{ fontFamily: QUICKSAND, color: '#374151' }}
              >
                {savedMatId ? 'Rename Mat' : 'Save for Later'}
              </button>

              {/* View Cart */}
              <button
                onClick={() => navigate('/cart')}
                className="w-full py-3 bg-white border-2 border-[#c5c6cc] rounded-full text-sm font-bold cursor-pointer transition-all duration-200 hover:border-[#212b3a]"
                style={{ fontFamily: QUICKSAND, color: '#374151' }}
              >
                View Cart
              </button>

              {/* Back to Edit */}
              <button
                onClick={onBackToEdit}
                className="w-full py-3 bg-white border-2 border-[#e0e3e5] rounded-full text-sm font-bold cursor-pointer transition-all duration-200 hover:border-[#c5c6cc]"
                style={{ fontFamily: QUICKSAND, color: '#75777d' }}
              >
                ← Back to Edit
              </button>
            </div>

            {/* Info box */}
            <div
              className="mt-5 p-4 border rounded-2xl text-xs font-medium leading-relaxed"
              style={{ background: '#e7f8ee', borderColor: '#c5c6cc', color: '#44474c' }}
            >
              <strong style={{ color: '#212b3a' }}>Ready to order?</strong><br />
              Add to cart to proceed to checkout, or save for later to come back and order anytime.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MatPreview;
