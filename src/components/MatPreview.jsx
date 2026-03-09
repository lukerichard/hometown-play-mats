import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onBackToEdit}
        className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[1200px] max-h-[90vh] bg-white rounded-2xl z-[10000] overflow-hidden flex flex-col border-2 border-border animate-fade-in"
        style={{ boxShadow: '0 16px 48px rgba(0, 0, 0, 0.16)' }}
      >
        {/* Modal Header */}
        <div
          className="px-8 py-5 text-white relative"
          style={{ background: '#3B3B3B' }}
        >
          <h2
            className="m-0 text-2xl font-bold tracking-tight"
            style={{ fontFamily: "'Poppins', 'DM Sans', sans-serif" }}
          >
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
          <div className="flex-1 flex items-center justify-center p-10 bg-surface-alt overflow-y-auto">
            <div className="max-w-[600px] w-full">
              <img
                src={previewImage}
                alt="Play Mat Preview"
                className="w-full h-auto rounded-xl block"
                style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)' }}
              />
            </div>
          </div>

          {/* Settings Panel */}
          <div
            className="w-[340px] bg-white p-7 overflow-y-auto border-l-2 border-border"
            style={{ fontFamily: "'DM Sans', 'Poppins', sans-serif" }}
          >
            <h2 className="text-xl font-bold text-text mb-5 tracking-tight"
              style={{ fontFamily: "'Poppins', 'DM Sans', sans-serif" }}>
              Your Configuration
            </h2>

            {/* Mat Size */}
            <div className="mb-5">
              <div className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">
                Mat Size
              </div>
              <div className="p-4 bg-white border-2 border-border rounded-xl">
                <div className="text-sm font-bold text-text mb-0.5">
                  {matSizes[matSize].name}
                </div>
                <div className="text-xs text-text-light font-medium">
                  {matSizes[matSize].dimensions}
                </div>
              </div>
            </div>

            {/* Color Scheme */}
            <div className="mb-7">
              <div className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">
                Color Scheme
              </div>
              <div className="p-4 bg-white border-2 border-border rounded-xl flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full shrink-0"
                  style={{ background: colorSchemes[colorScheme].color }}
                />
                <div className="text-sm font-bold text-text">
                  {colorSchemes[colorScheme].name}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {/* Cart Controls */}
              {cartItem ? (
                <div className="border-2 rounded-xl p-4"
                  style={{ background: '#D6EFFF40', borderColor: 'rgba(61, 174, 245, 0.3)' }}>
                  <div className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5"
                    style={{ color: '#5EC269' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    In Cart
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-text">Quantity:</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onUpdateQuantity(cartItem.quantity - 1)}
                        className="w-8 h-8 bg-white border-2 border-border rounded-lg text-lg font-bold text-text cursor-pointer transition-all duration-150 hover:border-primary"
                      >-</button>
                      <span className="text-lg font-bold min-w-[32px] text-center" style={{ color: '#3DAEF5' }}>
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(cartItem.quantity + 1)}
                        className="w-8 h-8 bg-white border-2 border-border rounded-lg text-lg font-bold text-text cursor-pointer transition-all duration-150 hover:border-primary"
                      >+</button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={async () => { setIsAdding(true); await onAddToCart(); setIsAdding(false); }}
                  disabled={isAdding}
                  className="w-full py-4 text-white border-none rounded-full text-base font-bold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    background: isAdding ? '#B0A999' : '#3DAEF5',
                    boxShadow: isAdding ? 'none' : '0 0 0 4px rgba(61, 174, 245, 0.25)',
                  }}
                >
                  {isAdding ? 'Added!' : 'Add to Cart'}
                </button>
              )}

              {/* Save for Later / Rename */}
              {!savedMatId && (
                <button onClick={onSave}
                  className="w-full py-3 bg-white border-2 border-border rounded-full text-sm font-bold cursor-pointer transition-all duration-200 hover:border-primary"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#3DAEF5' }}>
                  Save for Later
                </button>
              )}
              {savedMatId && (
                <button onClick={onSave}
                  className="w-full py-3 bg-white border-2 border-border rounded-full text-sm font-bold cursor-pointer transition-all duration-200 hover:border-primary"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#3DAEF5' }}>
                  Rename Mat
                </button>
              )}

              {/* View Cart */}
              <button onClick={() => navigate('/cart')}
                className="w-full py-3 bg-white text-text-light border-2 border-border rounded-full text-sm font-bold cursor-pointer transition-all duration-200 hover:border-primary hover:text-primary"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                View Cart
              </button>

              {/* Back to Edit */}
              <button onClick={onBackToEdit}
                className="w-full py-3 bg-white text-text-muted border-2 border-border/60 rounded-full text-sm font-bold cursor-pointer transition-all duration-200 hover:border-border-dark hover:text-text-light"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                ← Back to Edit
              </button>
            </div>

            {/* Info box */}
            <div className="mt-5 p-4 border rounded-xl text-xs text-text-light font-medium leading-relaxed"
              style={{ background: '#D6EFFF40', borderColor: '#E0DDD5' }}>
              <strong className="text-text">Ready to order?</strong><br />
              Add to cart to proceed to checkout, or save for later to come back and order anytime.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MatPreview;
