import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { saveMat, updateMat } from '../utils/matStorage';
import { addToCart, updateCartQuantity, removeFromCart, createShopifyCartFromFirebaseCart } from '../utils/cartUtils';
import { isVerifiedAccount } from '../utils/authStatus';
import MatSidebar from './MatSidebar';
import MatMapView from './MatMapView';
import MatPreview from './MatPreview';
import CartConfirmationModal from './cart/CartConfirmationModal';

const ToyMatDesigner = () => {
  const { currentUser, ensureGuestSession } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [matSize, setMatSize] = useState('medium');
  const [rotation, setRotation] = useState(0);
  const [colorScheme, setColorScheme] = useState('pastel');
  const [mapCenter, setMapCenter] = useState([-79.7990, 43.3255]);
  const [mapZoom, setMapZoom] = useState(15);
  const [address, setAddress] = useState('123 Maple Avenue, Lincoln Park, Chicago');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [matName, setMatName] = useState("Leo's Little London");
  const [savedMatId, setSavedMatId] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showStreetNames, setShowStreetNames] = useState(true);
  const [framePixels, setFramePixels] = useState(null);
  const [isMobileCustomizeOpen, setIsMobileCustomizeOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartConfirmation, setCartConfirmation] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const isSignedIn = isVerifiedAccount(currentUser);

  const matSizes = {
    large: {
      width: 3,
      height: 2,
      name: 'Large',
      label: 'Large Mat',
      dimensions: '60" x 48"',
      description: '60" x 48" - Best for playrooms',
      price: 189,
      shopifyVariantId: import.meta.env.VITE_SHOPIFY_LARGE_VARIANT_ID || ''
    },
    medium: {
      width: 2,
      height: 1.5,
      name: 'Medium',
      label: 'Medium Mat',
      dimensions: '48" x 36"',
      description: '48" x 36" - Perfect for bedroom',
      price: 149,
      shopifyVariantId: import.meta.env.VITE_SHOPIFY_MEDIUM_VARIANT_ID || ''
    },
    small: {
      width: 1.5,
      height: 1,
      name: 'Small',
      label: 'Small Mat',
      dimensions: '36" x 24"',
      description: '36" x 24" - Cozy reading nook',
      price: 89,
      shopifyVariantId: import.meta.env.VITE_SHOPIFY_SMALL_VARIANT_ID || ''
    }
  };

  const colorSchemes = {
    pastel: { color: '#2f7a36', name: 'Pastel Park', preview: '#b8ef9f' },
    modern: { color: '#6f8fcf', name: 'Modern Mini', preview: '#a9c0ee' },
    classic: { color: '#111827', name: 'Classic City', preview: '#3d4048' }
  };

  const canReadCart = Boolean(currentUser?.uid && (isSignedIn || currentUser.isAnonymous));

  const { data: cartItems } = useFirestore(
    canReadCart ? `users/${currentUser.uid}/cart` : null
  );

  const currentCartItem = savedMatId ? cartItems.find((item) => item.designId === savedMatId || item.matId === savedMatId) : null;
  const selectedSize = matSizes[matSize];
  const selectedTheme = colorSchemes[colorScheme];

  const withTimeout = (promise, message, timeoutMs = 15000) => {
    let timeoutId;
    const timeout = new Promise((_, reject) => {
      timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs);
    });

    return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timeoutId));
  };

  const fetchSuggestions = async (query) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      if (!token) return;
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&autocomplete=true&limit=5`);
      const data = await response.json();
      setSuggestions(data.features || []);
      setShowSuggestions((data.features || []).length > 0);
    } catch (error) {
      console.error('Autocomplete error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleAddressChange = (event) => {
    const value = event.target.value;
    setAddress(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => fetchSuggestions(value), 300));
  };

  const handleSelectSuggestion = (suggestion) => {
    const [lng, lat] = suggestion.center;
    setAddress(suggestion.place_name);
    setMapCenter([lng, lat]);
    setMapZoom(17);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSearchAddress = async () => {
    if (!address.trim()) {
      alert('Please enter an address');
      return;
    }
    setIsSearching(true);
    setShowSuggestions(false);
    try {
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      if (!token) {
        alert('Mapbox token is missing. Add VITE_MAPBOX_TOKEN to .env to enable address search.');
        return;
      }
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}`);
      const data = await response.json();
      if (data.features?.length > 0) {
        const [lng, lat] = data.features[0].center;
        setMapCenter([lng, lat]);
        setMapZoom(17);
      } else {
        alert('Address not found. Please try a different address.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Error searching for address. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const captureMatPreview = () => {
    if (!mapInstance) {
      throw new Error('Map is still loading. Please wait a moment and try again.');
    }

    const canvas = mapInstance.getCanvas();
    const pixelRatio = window.devicePixelRatio || 1;
    const dims = framePixels || { width: 384, height: 512 };
    const scaledWidth = dims.width * pixelRatio;
    const scaledHeight = dims.height * pixelRatio;
    const cropX = (canvas.width - scaledWidth) / 2;
    const cropY = (canvas.height - scaledHeight) / 2;
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = scaledWidth;
    croppedCanvas.height = scaledHeight;
    const ctx = croppedCanvas.getContext('2d');

    if (!ctx) {
      throw new Error('Error creating preview. Please try again.');
    }

    ctx.drawImage(canvas, cropX, cropY, scaledWidth, scaledHeight, 0, 0, scaledWidth, scaledHeight);
    return croppedCanvas.toDataURL('image/png');
  };

  const _handleGenerateMat = () => {
    try {
      const capturedPreview = captureMatPreview();
      setPreviewImage(capturedPreview);
      setShowPreview(true);
    } catch (error) {
      console.error('Error capturing map:', error);
      alert(error.message || 'Error capturing map. Please try again.');
    }
  };

  useEffect(() => {
    if (location.state?.loadMat) {
      const mat = location.state.loadMat;
      setMatSize(mat.matSize || 'medium');
      setRotation(mat.rotation || 0);
      setColorScheme(mat.colorScheme || 'pastel');
      setMapCenter(mat.mapCenter || [-79.7990, 43.3255]);
      setMapZoom(mat.mapZoom || 15);
      setAddress(mat.address || '');
      setPreviewImage(mat.previewImageUrl || null);
      setSavedMatId(mat.id || null);
      setMatName(mat.name || '');
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSaveMat = async () => {
    if (!isSignedIn) {
      const shouldSignup = confirm('You need a verified account to save mats. Create or verify an account now?');
      if (shouldSignup) navigate('/signup');
      return;
    }
    if (!matName.trim()) { alert('Please enter a name for your mat'); return; }
    setSaving(true);
    try {
      let previewImageUrl = previewImage;

      if (!previewImageUrl) {
        try {
          previewImageUrl = captureMatPreview();
          setPreviewImage(previewImageUrl);
        } catch (previewError) {
          console.warn('Preview capture failed; saving mat without preview image.', previewError);
          previewImageUrl = '';
        }
      }

      const matData = {
        name: matName.trim(),
        matSize,
        colorScheme,
        rotation,
        mapCenter,
        mapZoom,
        address,
        showStreetNames,
        previewImageUrl
      };

      if (savedMatId) {
        await updateMat(currentUser.uid, savedMatId, matData);
        alert('Mat updated successfully!');
      } else {
        const newMatId = await saveMat(currentUser.uid, matData, 'saved');
        setSavedMatId(newMatId);
        alert('Mat saved successfully!');
      }
      setShowSaveDialog(false);
    } catch (error) {
      console.error('Error saving mat:', error);
      alert('Failed to save mat. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddToCart = async () => {
    if (isAddingToCart) return;

    try {
      if (currentUser && !isSignedIn && !currentUser.isAnonymous) {
        alert('Please verify your email before adding this mat to your cart.');
        navigate('/login');
        return;
      }

      const capturedPreview = captureMatPreview();
      setIsAddingToCart(true);
      setCheckoutError('');

      const user = currentUser || await withTimeout(
        ensureGuestSession(),
        'Guest checkout is taking too long. Please check your connection and try again.'
      );
      let matIdToAdd = savedMatId;
      const normalizedName = matName.trim() || 'Custom Play Mat';
      const matData = {
        name: normalizedName,
        matSize,
        colorScheme,
        rotation,
        mapCenter,
        mapZoom,
        address,
        showStreetNames,
        previewImageUrl: capturedPreview,
        status: 'in_cart'
      };

      if (!matIdToAdd) {
        matIdToAdd = await withTimeout(
          saveMat(user.uid, matData, 'in_cart'),
          'Saving your mat is taking too long. Please try again.'
        );
        setSavedMatId(matIdToAdd);
      } else {
        await withTimeout(
          updateMat(user.uid, matIdToAdd, matData),
          'Updating your mat is taking too long. Please try again.'
        );
      }

      const existingCartItem = cartItems.find((item) => item.designId === matIdToAdd || item.matId === matIdToAdd);
      await withTimeout(
        addToCart(user.uid, matIdToAdd, 1, selectedSize.price, {
          matSize,
          theme: colorScheme,
          nameSnapshot: normalizedName,
          previewImageUrlSnapshot: capturedPreview,
          shopifyVariantId: selectedSize.shopifyVariantId
        }),
        'Adding this mat to your cart is taking too long. Please try again.'
      );

      setPreviewImage(capturedPreview);
      setCartConfirmation({
        userId: user.uid,
        designId: matIdToAdd,
        name: normalizedName,
        previewImage: capturedPreview,
        sizeName: selectedSize.name,
        dimensions: selectedSize.dimensions,
        themeName: selectedTheme.name,
        address,
        showStreetNames,
        price: selectedSize.price,
        quantity: (existingCartItem?.quantity || 0) + 1
      });
      setIsMobileCustomizeOpen(false);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.message || 'Failed to add to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleCheckoutFromConfirmation = async () => {
    if (!cartConfirmation?.userId || checkoutLoading) return;
    setCheckoutLoading(true);
    setCheckoutError('');

    try {
      const checkoutUrl = await createShopifyCartFromFirebaseCart(cartConfirmation.userId);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutError(error.message || 'Checkout is unavailable. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleUpdateQuantity = async (newQuantity) => {
    if (!currentUser || !currentCartItem) return;
    try {
      if (newQuantity <= 0) await removeFromCart(currentUser.uid, currentCartItem.id);
      else await updateCartQuantity(currentUser.uid, currentCartItem.id, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity. Please try again.');
    }
  };

  return (
    <>
      {/* Full-screen editor — sits below the fixed 72px header */}
      <div className="editor-fullscreen">

        {/* Map fills the area left of the sidebar */}
        <div className="editor-map-area">
          <MatMapView
            center={mapCenter}
            zoom={mapZoom}
            matSize={selectedSize}
            rotation={rotation}
            colorScheme={selectedTheme.color}
            showStreetNames={showStreetNames}
            onMapReady={setMapInstance}
            onFrameChange={setFramePixels}
          />
        </div>

        {/* Floating address bar */}
        <div className="editor-top-bar">
          <div className="address-search">
            <span className="address-icon" aria-hidden="true" />
            <div className="relative flex-1">
              <input
                type="text"
                value={address}
                onChange={handleAddressChange}
                onKeyDown={(event) => event.key === 'Enter' && handleSearchAddress()}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                aria-label="Address"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="address-suggestions">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.id || index}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        handleSelectSuggestion(suggestion);
                      }}
                    >
                      <strong>{suggestion.text}</strong>
                      <small>{suggestion.place_name}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="button" className="ready-pill" onClick={handleSearchAddress} disabled={isSearching}>
              {isSearching ? 'SEARCHING' : 'READY'}
            </button>
          </div>

        </div>

        {/* Floating right sidebar */}
        <div className="editor-sidebar-float">
          <MatSidebar
            matSize={matSize}
            setMatSize={setMatSize}
            matName={matName}
            setMatName={setMatName}
            matSizes={matSizes}
            selectedSize={selectedSize}
            idPrefix="desktop-mat"
            showStreetNames={showStreetNames}
            setShowStreetNames={setShowStreetNames}
            onSaveForLater={() => setShowSaveDialog(true)}
            onAddToCart={handleAddToCart}
            isAddingToCart={isAddingToCart}
          />
        </div>
      </div>

      {/* Checkout bar — already position: fixed z-index: 900 */}
      {isMobileCustomizeOpen && (
        <>
          <div className="mobile-customize-scrim" onClick={() => setIsMobileCustomizeOpen(false)} />
          <div className="mobile-customize-sheet">
            <MatSidebar
              matSize={matSize}
              setMatSize={setMatSize}
              matName={matName}
              setMatName={setMatName}
              matSizes={matSizes}
              selectedSize={selectedSize}
              idPrefix="mobile-mat"
              showStreetNames={showStreetNames}
              setShowStreetNames={setShowStreetNames}
              onSaveForLater={() => setShowSaveDialog(true)}
              onAddToCart={handleAddToCart}
              isAddingToCart={isAddingToCart}
              onClose={() => setIsMobileCustomizeOpen(false)}
            />
          </div>
        </>
      )}

      <div className={`mobile-cart-bar ${isMobileCustomizeOpen ? 'is-menu-open' : ''}`}>
        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setIsMobileCustomizeOpen((isOpen) => !isOpen)}
          aria-label={isMobileCustomizeOpen ? 'Close customization menu' : 'Open customization menu'}
          aria-expanded={isMobileCustomizeOpen}
        >
          <span />
          <span />
          <span />
        </button>
        <div className="mobile-cart-summary">
          <span>TOTAL PRICE</span>
          <strong>${selectedSize.price.toFixed(2)}</strong>
        </div>
        <div className="mobile-cart-actions">
          <button type="button" className="primary-action" onClick={handleAddToCart} disabled={isAddingToCart}>
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {showPreview && (
        <MatPreview
          previewImage={previewImage}
          matSize={matSize}
          colorScheme={colorScheme}
          matSizes={matSizes}
          colorSchemes={colorSchemes}
          savedMatId={savedMatId}
          matName={matName}
          cartItem={currentCartItem}
          onBackToEdit={() => setShowPreview(false)}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateQuantity}
          onSave={() => setShowSaveDialog(true)}
        />
      )}

      <CartConfirmationModal
        item={cartConfirmation}
        onClose={() => {
          if (!checkoutLoading) {
            setCartConfirmation(null);
            setCheckoutError('');
          }
        }}
        onCheckout={handleCheckoutFromConfirmation}
        checkoutLoading={checkoutLoading}
        checkoutError={checkoutError}
      />

      {showSaveDialog && (
        <>
          <div onClick={() => setShowSaveDialog(false)} className="fixed inset-0 z-[9999] bg-[#191c1e]/50 backdrop-blur-sm" />
          <div
            className="fixed left-1/2 top-1/2 z-[10000] w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#c5c6cc] bg-white p-8 shadow-2xl"
            style={{ fontFamily: "'Quicksand', 'DM Sans', sans-serif" }}
          >
            <h3 className="mb-2 text-2xl font-bold text-[#212b3a]">{savedMatId ? 'Update Mat' : 'Save Your Mat'}</h3>
            <p className="mb-6 text-sm" style={{ color: 'var(--builder-muted)' }}>Give your custom play mat a name so you can find it later.</p>
            <label className="builder-label" htmlFor="save-name">Mat Name</label>
            <input
              id="save-name"
              type="text"
              value={matName}
              onChange={(event) => setMatName(event.target.value)}
              autoFocus
              className="builder-input mb-6"
            />
            <div className="flex gap-3">
              <button type="button" className="secondary-action flex-1" onClick={() => setShowSaveDialog(false)} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="primary-action flex-1" onClick={handleSaveMat} disabled={saving}>
                {saving ? 'Saving...' : savedMatId ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ToyMatDesigner;
