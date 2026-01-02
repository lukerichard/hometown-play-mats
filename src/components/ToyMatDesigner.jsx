import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { where } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { saveMat, updateMat } from '../utils/matStorage';
import { addToCart, updateCartQuantity, removeFromCart } from '../utils/cartUtils';
import MatSidebar from './MatSidebar';
import MatMapView from './MatMapView';
import MatPreview from './MatPreview';

const ToyMatDesigner = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Mat configuration state
  const [matSize, setMatSize] = useState('small');
  const [rotation, setRotation] = useState(0);
  const [colorScheme, setColorScheme] = useState('classic');
  const [mapCenter, setMapCenter] = useState([-79.7990, 43.3255]); // Burlington, ON default
  const [mapZoom, setMapZoom] = useState(15);

  // Address search state
  const [address, setAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Map reference for image capture
  const [mapInstance, setMapInstance] = useState(null);

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Save state
  const [matName, setMatName] = useState('');
  const [savedMatId, setSavedMatId] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  // Cart state - fetch user's cart items
  const { data: cartItems } = useFirestore(
    currentUser?.uid ? 'cart' : null,
    currentUser?.uid ? [
      where('userId', '==', currentUser.uid)
    ] : []
  );

  // Find cart item for current mat
  const currentCartItem = savedMatId ? cartItems.find(item => item.matId === savedMatId) : null;

  // Mat sizes in meters
  const matSizes = {
    small: { width: 1, height: 2, name: 'Small', dimensions: '39" × 79" (1m × 2m)' },
    medium: { width: 1.5, height: 2, name: 'Medium', dimensions: '59" × 79" (1.5m × 2m)' },
    large: { width: 2, height: 3, name: 'Large', dimensions: '79" × 118" (2m × 3m)' }
  };

  // Color schemes
  const colorSchemes = {
    classic: { color: '#FF6B6B', name: 'Coral Fun' },
    muted: { color: '#4ECDC4', name: 'Ocean Blue' },
    neon: { color: '#6C5CE7', name: 'Purple Magic' }
  };

  // Fetch address suggestions as user types
  const fetchSuggestions = async (query) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&autocomplete=true&limit=5`
      );

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        setSuggestions(data.features);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Autocomplete error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle address input change with debouncing
  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debouncing
    const timeout = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);

    setSearchTimeout(timeout);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion) => {
    const [lng, lat] = suggestion.center;
    setAddress(suggestion.place_name);
    setMapCenter([lng, lat]);
    setMapZoom(17);
    setSuggestions([]);
    setShowSuggestions(false);
    console.log('Location selected:', suggestion.place_name);
  };

  // Handle address search
  const handleSearchAddress = async () => {
    if (!address.trim()) {
      alert('Please enter an address');
      return;
    }

    setIsSearching(true);
    setShowSuggestions(false);

    try {
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}`
      );

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        setMapCenter([lng, lat]);
        setMapZoom(17);
        console.log('Location found:', data.features[0].place_name);
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

  // Handle rotation
  const rotateLeft = () => {
    setRotation((prev) => {
      const newRotation = (prev - 45) % 360;
      return newRotation < 0 ? newRotation + 360 : newRotation;
    });
  };

  const rotateRight = () => {
    setRotation((prev) => (prev + 45) % 360);
  };

  // Calculate selection box dimensions (same as in MatMapView)
  const getSelectionBoxDimensions = () => {
    const DPI = 96;
    const SCALE = 2;
    const dimensions = {
      small: { widthInches: 2, heightInches: 1 },
      medium: { widthInches: 2, heightInches: 1.5 },
      large: { widthInches: 3, heightInches: 2 }
    };

    const sizeKey = matSizes[matSize].name.toLowerCase();
    const size = dimensions[sizeKey] || dimensions.small;

    return {
      width: size.widthInches * DPI * SCALE,
      height: size.heightInches * DPI * SCALE
    };
  };

  // Handle generate mat - capture selection box area and show preview
  const handleGenerateMat = () => {
    if (!mapInstance) {
      alert('Map is still loading. Please wait a moment and try again.');
      return;
    }

    try {
      // Get the full map canvas
      const canvas = mapInstance.getCanvas();

      if (!canvas) {
        console.error('Could not get map canvas');
        alert('Error capturing map. Please try again.');
        return;
      }

      // Get the device pixel ratio - Mapbox renders canvas at this scale
      const pixelRatio = window.devicePixelRatio || 1;

      console.log('Canvas dimensions:', canvas.width, canvas.height);
      console.log('Pixel ratio:', pixelRatio);

      const selectionBox = getSelectionBoxDimensions();

      // Scale selection box dimensions by pixel ratio to match canvas resolution
      const scaledWidth = selectionBox.width * pixelRatio;
      const scaledHeight = selectionBox.height * pixelRatio;

      console.log('Selection box dimensions (CSS):', selectionBox.width, selectionBox.height);
      console.log('Selection box dimensions (scaled):', scaledWidth, scaledHeight);

      // Calculate center of canvas
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Calculate crop area (selection box area) - using scaled dimensions
      const cropX = centerX - (scaledWidth / 2);
      const cropY = centerY - (scaledHeight / 2);

      console.log('Crop position:', cropX, cropY);

      // Create a new canvas to hold the cropped image at the scaled resolution
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = scaledWidth;
      croppedCanvas.height = scaledHeight;
      const ctx = croppedCanvas.getContext('2d');

      if (!ctx) {
        console.error('Could not get canvas context');
        alert('Error creating preview. Please try again.');
        return;
      }

      // Draw the cropped area onto the new canvas
      ctx.drawImage(
        canvas,
        cropX, cropY, scaledWidth, scaledHeight,
        0, 0, scaledWidth, scaledHeight
      );

      // Convert to data URL
      const croppedImageUrl = croppedCanvas.toDataURL('image/png');

      console.log('Image captured, length:', croppedImageUrl.length);

      // Set preview image and show preview
      setPreviewImage(croppedImageUrl);
      setShowPreview(true);
    } catch (error) {
      console.error('Error capturing map:', error);
      alert('Error capturing map. Please try again.');
    }
  };

  // Load mat from navigation state (when coming from SavedMats)
  useEffect(() => {
    if (location.state?.loadMat) {
      const mat = location.state.loadMat;
      setMatSize(mat.matSize || 'small');
      setRotation(mat.rotation || 0);
      setColorScheme(mat.colorScheme || 'classic');
      setMapCenter(mat.mapCenter || [-79.7990, 43.3255]);
      setMapZoom(mat.mapZoom || 15);
      setAddress(mat.address || '');
      setPreviewImage(mat.previewImageUrl || null);
      setSavedMatId(mat.id || null);
      setMatName(mat.name || '');

      // Clear the navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Handle save mat
  const handleSaveMat = async () => {
    // Check if user is logged in
    if (!currentUser) {
      const shouldSignup = confirm('You need an account to save mats. Create an account now?');
      if (shouldSignup) {
        navigate('/signup');
      }
      return;
    }

    if (!matName.trim()) {
      alert('Please enter a name for your mat');
      return;
    }

    if (!previewImage) {
      alert('Please generate a preview first');
      return;
    }

    setSaving(true);

    try {
      const matData = {
        name: matName.trim(),
        matSize,
        colorScheme,
        rotation,
        mapCenter,
        mapZoom,
        address,
        previewImageUrl: previewImage
      };

      if (savedMatId) {
        // Update existing mat
        await updateMat(savedMatId, matData);
        alert('Mat updated successfully!');
      } else {
        // Save new mat
        const newMatId = await saveMat(currentUser.uid, matData);
        setSavedMatId(newMatId);
        alert('Mat saved successfully!');
      }

      setShowSaveDialog(false);
      setMatName(''); // Clear for next save
    } catch (error) {
      console.error('Error saving mat:', error);
      alert('Failed to save mat. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle back to edit
  const handleBackToEdit = () => {
    setShowPreview(false);
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    // Check if user is logged in
    if (!currentUser) {
      const shouldSignup = confirm('You need an account to add items to cart. Create an account now?');
      if (shouldSignup) {
        navigate('/signup');
      }
      return;
    }

    // Check if preview exists
    if (!previewImage) {
      alert('Please generate a preview first');
      return;
    }

    try {
      let matIdToAdd = savedMatId;

      // Auto-save mat if not already saved
      if (!matIdToAdd) {
        const defaultName = `Mat - ${address.substring(0, 30)}${address.length > 30 ? '...' : ''}`;

        const matData = {
          name: defaultName,
          matSize,
          colorScheme,
          rotation,
          mapCenter,
          mapZoom,
          address,
          previewImageUrl: previewImage
        };

        matIdToAdd = await saveMat(currentUser.uid, matData);
        setSavedMatId(matIdToAdd);
      }

      // Calculate price based on mat size
      const pricePerUnit = matSize === 'small' ? 29.99 : matSize === 'medium' ? 39.99 : 49.99;

      // Add to cart (will update quantity if already exists)
      await addToCart(currentUser.uid, matIdToAdd, 1, pricePerUnit);

      // No dialog - clean UX, user can see it in cart badge
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    }
  };

  // Handle updating cart quantity
  const handleUpdateQuantity = async (newQuantity) => {
    if (!currentCartItem) return;

    try {
      if (newQuantity <= 0) {
        // Remove item from cart when quantity reaches 0
        await removeFromCart(currentCartItem.id);
      } else {
        // Update quantity
        await updateCartQuantity(currentCartItem.id, newQuantity);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity. Please try again.');
    }
  };

  return (
    <>
    <div style={{
      height: '100vh',
      background: '#FFFFFF',
      overflow: 'hidden'
    }}>
      {/* Title Bar */}
      <div style={{
        background: 'white',
        borderBottom: '2px solid #E5E7EB',
        padding: '24px 40px',
        position: 'relative',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '32px',
          fontWeight: '800',
          color: '#7A8A6E',
          letterSpacing: '-0.5px'
        }}>
          Toy Play Mat Designer
        </h1>
      </div>

      {/* Main Container */}
      <div style={{
        display: 'flex',
        height: 'calc(100vh - 82px)',
        padding: '0',
        gap: '0'
      }}>
        <MatSidebar
          matSize={matSize}
          setMatSize={setMatSize}
          rotation={rotation}
          setRotation={setRotation}
          rotateLeft={rotateLeft}
          rotateRight={rotateRight}
          matSizes={matSizes}
          onGenerate={handleGenerateMat}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0', position: 'relative', zIndex: 10 }}>
          {/* Search Bar */}
          <div style={{
            background: '#F5F0E8',
            padding: '20px',
            position: 'relative',
            zIndex: 10000,
            borderBottom: '1px solid #E5E7EB'
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  value={address}
                  onChange={handleAddressChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchAddress()}
                  onFocus={(e) => {
                    suggestions.length > 0 && setShowSuggestions(true);
                    e.currentTarget.style.borderColor = '#7A8A6E';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(122, 138, 110, 0.1)';
                  }}
                  onBlur={(e) => {
                    setTimeout(() => setShowSuggestions(false), 200);
                    e.currentTarget.style.borderColor = '#D4C4AA';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="Enter your address (e.g., 1600 Pennsylvania Avenue, Washington, DC)"
                  style={{
                    width: '100%',
                    padding: '18px 24px',
                    background: 'white',
                    border: '2px solid #D4C4AA',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#2D3436',
                    outline: 'none',
                    fontFamily: 'Inter, sans-serif',
                    boxShadow: 'none',
                    transition: 'all 0.3s'
                  }}
                />

                {/* Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '8px',
                    background: 'white',
                    border: '2px solid #D4C4AA',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    zIndex: 99999,
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}>
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.id || index}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectSuggestion(suggestion);
                        }}
                        style={{
                          padding: '16px 24px',
                          cursor: 'pointer',
                          borderBottom: index < suggestions.length - 1 ? '1px solid #F5F0E8' : 'none',
                          transition: 'background 0.2s',
                          fontSize: '15px',
                          color: '#2D3436',
                          fontWeight: '500'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F5F0E8'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ fontWeight: '700', marginBottom: '4px' }}>
                          {suggestion.text}
                        </div>
                        <div style={{ fontSize: '13px', color: '#636E72' }}>
                          {suggestion.place_name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleSearchAddress}
                disabled={isSearching}
                style={{
                  padding: '18px 36px',
                  background: isSearching ? '#B2BEC3' : '#7A8A6E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: isSearching ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: '0.3px',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => !isSearching && (e.currentTarget.style.background = '#5C6E54')}
                onMouseLeave={(e) => !isSearching && (e.currentTarget.style.background = '#7A8A6E')}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Map View */}
          <MatMapView
            center={mapCenter}
            zoom={mapZoom}
            matSize={matSizes[matSize]}
            rotation={rotation}
            colorScheme={colorSchemes[colorScheme].color}
            onMapReady={setMapInstance}
          />
        </div>
      </div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #7A8A6E;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(122, 138, 110, 0.3);
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #7A8A6E;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(122, 138, 110, 0.3);
        }
      `}</style>
    </div>

    {/* Preview Modal */}
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
        onBackToEdit={handleBackToEdit}
        onAddToCart={handleAddToCart}
        onUpdateQuantity={handleUpdateQuantity}
        onSave={() => {
          // Autofill mat name with address if available, otherwise use default
          if (!matName) {
            if (address) {
              setMatName(address);
            } else {
              const timestamp = new Date().toLocaleDateString();
              setMatName(`My Mat - ${timestamp}`);
            }
          }
          setShowSaveDialog(true);
        }}
      />
    )}

    {/* Save Dialog Modal */}
    {showSaveDialog && (
      <>
        <div
          onClick={() => {
            setShowSaveDialog(false);
            setMatName(''); // Clear for next save
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 9999,
            backdropFilter: 'blur(4px)'
          }}
        />
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '500px',
          width: '90%',
          zIndex: 10000,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          border: '2px solid #D4C4AA'
        }}>
          <h3 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#7A8A6E',
            marginBottom: '12px'
          }}>
            {savedMatId ? 'Update Mat' : 'Save Your Mat'}
          </h3>
          <p style={{
            fontSize: '15px',
            color: '#636E72',
            marginBottom: '28px',
            lineHeight: '1.6',
            fontWeight: '500'
          }}>
            {savedMatId ? 'Update the name for your mat.' : 'Give your custom play mat a name so you can find it later.'}
          </p>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '800',
              color: '#2D3436',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Mat Name
            </label>
            <input
              type="text"
              value={matName}
              onChange={(e) => setMatName(e.target.value)}
              placeholder="e.g., My Neighborhood"
              autoFocus
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #D4C4AA',
                borderRadius: '12px',
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#7A8A6E';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(122, 138, 110, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#D4C4AA';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                setShowSaveDialog(false);
                setMatName(''); // Clear for next save
              }}
              disabled={saving}
              style={{
                flex: 1,
                padding: '16px',
                background: 'white',
                border: '2px solid #D4C4AA',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif',
                color: '#636E72',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => !saving && (e.currentTarget.style.background = '#F5F0E8')}
              onMouseLeave={(e) => !saving && (e.currentTarget.style.background = 'white')}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveMat}
              disabled={saving}
              style={{
                flex: 1,
                padding: '16px',
                background: saving ? '#B2BEC3' : '#7A8A6E',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => !saving && (e.currentTarget.style.background = '#5C6E54')}
              onMouseLeave={(e) => !saving && (e.currentTarget.style.background = '#7A8A6E')}
            >
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
