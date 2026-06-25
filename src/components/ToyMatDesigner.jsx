import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { saveMat, updateMat } from '../utils/matStorage';
import { addToCart, updateCartQuantity, removeFromCart } from '../utils/cartUtils';
import { isVerifiedAccount } from '../utils/authStatus';
import { getShopifyVariantId } from '../config/shopify';
import { joinLaunchWaitlistIfContactAvailable } from '../utils/waitlist';
import MatSidebar from './MatSidebar';
import MatMapView from './MatMapView';
import MatPreview from './MatPreview';
import CartConfirmationModal from './cart/CartConfirmationModal';
import ComingSoonCheckoutModal from './cart/ComingSoonCheckoutModal';

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
  const [savedMatName, setSavedMatName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showStreetNames, setShowStreetNames] = useState(true);
  const [framePixels, setFramePixels] = useState(null);
  const [isMobileCustomizeOpen, setIsMobileCustomizeOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartConfirmation, setCartConfirmation] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
  const [safeInsets, setSafeInsets] = useState({ top: 94, right: 310 });
  const isSignedIn = isVerifiedAccount(currentUser);

  useEffect(() => {
    const update = () => setSafeInsets(
      window.innerWidth <= 720
        ? { top: 94, right: 0 }
        : { top: 94, right: 310 }
    );
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const matSizes = {
    large: {
      width: 3,
      height: 2,
      name: 'Large',
      label: 'Large Mat',
      dimensions: '60" x 48"',
      description: '60" x 48" - Best for playrooms',
      price: 189,
      shopifyVariantId: getShopifyVariantId('large')
    },
    medium: {
      width: 2,
      height: 1.5,
      name: 'Medium',
      label: 'Medium Mat',
      dimensions: '48" x 36"',
      description: '48" x 36" - Perfect for bedroom',
      price: 149,
      shopifyVariantId: getShopifyVariantId('medium')
    },
    small: {
      width: 1.5,
      height: 1,
      name: 'Small',
      label: 'Small Mat',
      dimensions: '36" x 24"',
      description: '36" x 24" - Cozy reading nook',
      price: 89,
      shopifyVariantId: getShopifyVariantId('small')
    }
  };

  const colorSchemes = {
    pastel: { color: '#2f7a36', name: 'Pastel Park', preview: '#b8ef9f' },
    modern: { color: '#6f8fcf', name: 'Modern Mini', preview: '#a9c0ee' },
    classic: { color: '#111827', name: 'Classic City', preview: '#3d4048' }
  };

  const normalizeMapCenter = (value) => {
    if (!Array.isArray(value) || value.length < 2) {
      return [-79.7990, 43.3255];
    }

    const lng = Number(value[0]);
    const lat = Number(value[1]);
    return Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : [-79.7990, 43.3255];
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

  const getCurrentMapCamera = () => {
    if (!mapInstance) {
      return { mapCenter, mapZoom, rotation };
    }

    const center = mapInstance.getCenter();
    return {
      mapCenter: [center.lng, center.lat],
      mapZoom: mapInstance.getZoom(),
      rotation: mapInstance.getBearing(),
    };
  };

  const handleMapCameraChange = ({ center, zoom, rotation: nextRotation }) => {
    setMapCenter(center);
    setMapZoom(zoom);
    setRotation(nextRotation);
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

  const geocodeAddress = async (query, showErrors = true) => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) {
      if (showErrors) {
        alert('Mapbox token is missing. Add VITE_MAPBOX_TOKEN to .env to enable address search.');
      }
      return false;
    }

    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}`);
    const data = await response.json();

    if (data.features?.length > 0) {
      const [lng, lat] = data.features[0].center;
      setMapCenter([lng, lat]);
      setMapZoom(17);
      return true;
    }

    if (showErrors) {
      alert('Address not found. Please try a different address.');
    }
    return false;
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
      await geocodeAddress(address);
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
    const dims = framePixels || { width: 384, height: 512, x: null, y: null };
    const scaledWidth = dims.width * pixelRatio;
    const scaledHeight = dims.height * pixelRatio;
    // Use the frame's actual pixel position if available, otherwise fall back to center
    const cropX = dims.x != null ? dims.x * pixelRatio : (canvas.width - scaledWidth) / 2;
    const cropY = dims.y != null ? dims.y * pixelRatio : (canvas.height - scaledHeight) / 2;
    const outputWidth = Math.round(scaledWidth);
    const outputHeight = Math.round(scaledHeight);
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = outputWidth;
    croppedCanvas.height = outputHeight;
    const ctx = croppedCanvas.getContext('2d');

    if (!ctx) {
      throw new Error('Error creating preview. Please try again.');
    }

    // Preserve the map canvas' backing-pixel resolution for saved previews.
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, cropX, cropY, scaledWidth, scaledHeight, 0, 0, outputWidth, outputHeight);
    return croppedCanvas.toDataURL('image/jpeg', 0.92);
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
      setRotation(Number(mat.rotation) || 0);
      setColorScheme(mat.colorScheme || 'pastel');
      setMapCenter(normalizeMapCenter(mat.mapCenter));
      setMapZoom(Number(mat.mapZoom) || 15);
      setAddress(mat.address || '');
      setShowStreetNames(mat.showStreetNames ?? true);
      setPreviewImage(mat.previewImageUrl || null);
      setSavedMatId(mat.id || null);
      setMatName(mat.name || '');
      setSavedMatName(mat.name || '');
      window.history.replaceState({}, document.title);
      return;
    }

    const prefillAddress = location.state?.prefillAddress?.trim();
    if (prefillAddress) {
      const center = location.state?.prefillCenter;
      const lng = Number(center?.[0]);
      const lat = Number(center?.[1]);

      setAddress(prefillAddress);
      setSavedMatId(null);
      setSavedMatName('');

      if (Number.isFinite(lng) && Number.isFinite(lat)) {
        setMapCenter([lng, lat]);
        setMapZoom(17);
      } else {
        geocodeAddress(prefillAddress, false).catch((error) => {
          console.error('Prefill geocoding error:', error);
        });
      }

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

      const currentCamera = getCurrentMapCamera();
      const matData = {
        name: matName.trim(),
        matSize,
        colorScheme,
        rotation: currentCamera.rotation,
        mapCenter: currentCamera.mapCenter,
        mapZoom: currentCamera.mapZoom,
        address,
        showStreetNames,
        previewImageUrl
      };

      const normalizedName = matName.trim();
      const shouldUpdateExistingMat = savedMatId && normalizedName === savedMatName;

      if (shouldUpdateExistingMat) {
        await updateMat(currentUser.uid, savedMatId, matData);
        setSavedMatName(normalizedName);
        alert('Mat updated successfully!');
      } else {
        const newMatId = await saveMat(currentUser.uid, matData, 'saved');
        setSavedMatId(newMatId);
        setSavedMatName(normalizedName);
        alert(savedMatId ? 'Saved as a new mat.' : 'Mat saved successfully!');
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

      const user = currentUser || await withTimeout(
        ensureGuestSession(),
        'Guest checkout is taking too long. Please check your connection and try again.'
      );
      let matIdToAdd = savedMatId;
      const normalizedName = matName.trim() || 'Custom Play Mat';
      const currentCamera = getCurrentMapCamera();
      const matData = {
        name: normalizedName,
        matSize,
        colorScheme,
        rotation: currentCamera.rotation,
        mapCenter: currentCamera.mapCenter,
        mapZoom: currentCamera.mapZoom,
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
          shopifyVariantId: selectedSize.shopifyVariantId,
          existingCartItemId: existingCartItem?.id
        }),
        'Adding this mat to your cart is taking too long. Please try again.'
      );

      const confirmationItem = {
        userId: user.uid,
        designId: matIdToAdd,
        name: normalizedName,
        previewImage: capturedPreview,
        sizeName: selectedSize.name,
        matSize,
        dimensions: selectedSize.dimensions,
        themeName: selectedTheme.name,
        address,
        showStreetNames,
        price: selectedSize.price,
        quantity: (existingCartItem?.quantity || 0) + 1
      };

      joinLaunchWaitlistIfContactAvailable({
        user,
        source: 'add-to-cart',
        selectedItem: confirmationItem
      }).catch((waitlistError) => {
        console.warn('Automatic launch lead capture failed.', waitlistError);
      });

      setPreviewImage(capturedPreview);
      setCartConfirmation(confirmationItem);
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
    setIsComingSoonOpen(true);
    setCheckoutLoading(false);
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
            onCameraChange={handleMapCameraChange}
            safeInsets={safeInsets}
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
        key={cartConfirmation?.designId || 'empty-cart-confirmation'}
        item={cartConfirmation}
        onClose={() => {
          if (!checkoutLoading) {
            setCartConfirmation(null);
          }
        }}
        onCheckout={handleCheckoutFromConfirmation}
        checkoutLoading={checkoutLoading}
      />

      <ComingSoonCheckoutModal
        open={isComingSoonOpen}
        onClose={() => setIsComingSoonOpen(false)}
        userId={cartConfirmation?.userId || currentUser?.uid || ''}
        defaultEmail={currentUser?.email || ''}
        source="designer-checkout"
        selectedItem={cartConfirmation}
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
