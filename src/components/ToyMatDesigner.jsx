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
  const [mapCenter, setMapCenter] = useState([-79.7990, 43.3255]);
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

  // Cart state
  const { data: cartItems } = useFirestore(
    currentUser?.uid ? 'cart' : null,
    currentUser?.uid ? [where('userId', '==', currentUser.uid)] : []
  );

  const currentCartItem = savedMatId ? cartItems.find(item => item.matId === savedMatId) : null;

  const matSizes = {
    small: { width: 1, height: 2, name: 'Small', dimensions: '39" × 79" (1m × 2m)' },
    medium: { width: 1.5, height: 2, name: 'Medium', dimensions: '59" × 79" (1.5m × 2m)' },
    large: { width: 2, height: 3, name: 'Large', dimensions: '79" × 118" (2m × 3m)' }
  };

  const colorSchemes = {
    classic: { color: '#5B8C5A', name: 'Forest Green' },
    muted: { color: '#5A8C8C', name: 'Ocean Teal' },
    neon: { color: '#8C5A8C', name: 'Berry Purple' }
  };

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

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => fetchSuggestions(value), 300);
    setSearchTimeout(timeout);
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
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
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

  const rotateLeft = () => {
    setRotation((prev) => {
      const newRotation = (prev - 45) % 360;
      return newRotation < 0 ? newRotation + 360 : newRotation;
    });
  };

  const rotateRight = () => {
    setRotation((prev) => (prev + 45) % 360);
  };

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

  const handleGenerateMat = () => {
    if (!mapInstance) {
      alert('Map is still loading. Please wait a moment and try again.');
      return;
    }
    try {
      const canvas = mapInstance.getCanvas();
      if (!canvas) {
        alert('Error capturing map. Please try again.');
        return;
      }
      const pixelRatio = window.devicePixelRatio || 1;
      const selectionBox = getSelectionBoxDimensions();
      const scaledWidth = selectionBox.width * pixelRatio;
      const scaledHeight = selectionBox.height * pixelRatio;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const cropX = centerX - (scaledWidth / 2);
      const cropY = centerY - (scaledHeight / 2);
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = scaledWidth;
      croppedCanvas.height = scaledHeight;
      const ctx = croppedCanvas.getContext('2d');
      if (!ctx) {
        alert('Error creating preview. Please try again.');
        return;
      }
      ctx.drawImage(canvas, cropX, cropY, scaledWidth, scaledHeight, 0, 0, scaledWidth, scaledHeight);
      const croppedImageUrl = croppedCanvas.toDataURL('image/png');
      setPreviewImage(croppedImageUrl);
      setShowPreview(true);
    } catch (error) {
      console.error('Error capturing map:', error);
      alert('Error capturing map. Please try again.');
    }
  };

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
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSaveMat = async () => {
    if (!currentUser) {
      const shouldSignup = confirm('You need an account to save mats. Create an account now?');
      if (shouldSignup) navigate('/signup');
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
        name: matName.trim(), matSize, colorScheme, rotation,
        mapCenter, mapZoom, address, previewImageUrl: previewImage
      };
      if (savedMatId) {
        await updateMat(savedMatId, matData);
        alert('Mat updated successfully!');
      } else {
        const newMatId = await saveMat(currentUser.uid, matData);
        setSavedMatId(newMatId);
        alert('Mat saved successfully!');
      }
      setShowSaveDialog(false);
      setMatName('');
    } catch (error) {
      console.error('Error saving mat:', error);
      alert('Failed to save mat. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBackToEdit = () => setShowPreview(false);

  const handleAddToCart = async () => {
    if (!currentUser) {
      const shouldSignup = confirm('You need an account to add items to cart. Create an account now?');
      if (shouldSignup) navigate('/signup');
      return;
    }
    if (!previewImage) {
      alert('Please generate a preview first');
      return;
    }
    try {
      let matIdToAdd = savedMatId;
      if (!matIdToAdd) {
        const defaultName = `Mat - ${address.substring(0, 30)}${address.length > 30 ? '...' : ''}`;
        const matData = {
          name: defaultName, matSize, colorScheme, rotation,
          mapCenter, mapZoom, address, previewImageUrl: previewImage
        };
        matIdToAdd = await saveMat(currentUser.uid, matData);
        setSavedMatId(matIdToAdd);
      }
      const pricePerUnit = matSize === 'small' ? 29.99 : matSize === 'medium' ? 39.99 : 49.99;
      await addToCart(currentUser.uid, matIdToAdd, 1, pricePerUnit);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    }
  };

  const handleUpdateQuantity = async (newQuantity) => {
    if (!currentCartItem) return;
    try {
      if (newQuantity <= 0) {
        await removeFromCart(currentCartItem.id);
      } else {
        await updateCartQuantity(currentCartItem.id, newQuantity);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity. Please try again.');
    }
  };

  return (
    <>
      <div className="h-screen overflow-hidden" style={{ background: 'linear-gradient(180deg, #FFFDF7 0%, #F7FAF7 100%)' }}>

        {/* Title Bar */}
        <div className="border-b-2 border-border px-6 py-4 bg-white/80 backdrop-blur-md relative"
          style={{ boxShadow: '0 1px 8px rgba(91, 140, 90, 0.06)' }}>
          <div className="absolute top-0 left-0 right-0 h-[3px]"
            style={{
              background: 'linear-gradient(90deg, #5B8C5A, #FFD666, #E8945A, #C5DDE8, #5B8C5A)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 4s linear infinite'
            }}
          />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #E8F0E4, #CDD5C6)' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="4" y="2" width="12" height="16" rx="2" fill="#5C6366" />
                <line x1="10" y1="4" x2="10" y2="16" stroke="#FFD666" strokeWidth="1.5" strokeDasharray="2 2" />
                <circle cx="7" cy="8" r="1.5" fill="#E8945A" />
                <circle cx="13" cy="13" r="1.5" fill="#5B8C5A" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-text m-0"
                style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>
                Play Mat Designer
              </h1>
              <p className="text-xs text-text-light m-0 mt-0.5 font-medium">
                Turn your neighborhood into a toy car adventure
              </p>
            </div>
          </div>
        </div>

        {/* Main Container */}
        <div className="flex" style={{ height: 'calc(100vh - 82px)' }}>
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

          <div className="flex-1 flex flex-col relative z-10">
            {/* Search Bar */}
            <div className="px-5 py-4 bg-white/60 backdrop-blur-sm border-b border-border relative z-[10000]">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9BA3A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={address}
                    onChange={handleAddressChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchAddress()}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Search for your address..."
                    className="w-full py-3 pl-11 pr-5 bg-white border-2 border-border rounded-xl text-sm font-medium text-text outline-none transition-all duration-200 focus:border-primary focus:shadow-md"
                    style={{ fontFamily: "'Geist', system-ui, sans-serif" }}
                  />

                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-border rounded-xl overflow-hidden z-[99999] max-h-[280px] overflow-y-auto animate-fade-in"
                      style={{ boxShadow: '0 8px 24px rgba(91, 140, 90, 0.12)' }}>
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={suggestion.id || index}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectSuggestion(suggestion);
                          }}
                          className="px-4 py-3 cursor-pointer border-b border-border/50 last:border-b-0 transition-colors duration-150 hover:bg-grass/40"
                        >
                          <div className="text-sm font-semibold text-text mb-0.5">
                            {suggestion.text}
                          </div>
                          <div className="text-xs text-text-light">
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
                  className="px-6 py-3 text-white border-none rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    fontFamily: "'Geist', system-ui, sans-serif",
                    background: isSearching ? '#9BA3A8' : 'linear-gradient(135deg, #5B8C5A, #7BAF7A)',
                    boxShadow: isSearching ? 'none' : '0 2px 8px rgba(91, 140, 90, 0.3)',
                  }}
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
            onClick={() => { setShowSaveDialog(false); setMatName(''); }}
            className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm"
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 max-w-md w-[90%] z-[10000] border-2 border-border animate-fade-in"
            style={{ boxShadow: '0 16px 48px rgba(91, 140, 90, 0.16)' }}>
            <h3 className="text-2xl font-bold text-text mb-2 tracking-tight"
              style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>
              {savedMatId ? 'Update Mat' : 'Save Your Mat'}
            </h3>
            <p className="text-sm text-text-light mb-6 leading-relaxed font-medium">
              {savedMatId ? 'Update the name for your mat.' : 'Give your custom play mat a name so you can find it later.'}
            </p>

            <div className="mb-5">
              <label className="block text-xs font-bold text-text-light uppercase tracking-wider mb-2">
                Mat Name
              </label>
              <input
                type="text"
                value={matName}
                onChange={(e) => setMatName(e.target.value)}
                placeholder="e.g., My Neighborhood"
                autoFocus
                className="w-full py-3 px-4 border-2 border-border rounded-xl text-sm font-medium outline-none transition-all duration-200 focus:border-primary focus:shadow-md"
                style={{ fontFamily: "'Geist', system-ui, sans-serif", boxSizing: 'border-box' }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowSaveDialog(false); setMatName(''); }}
                disabled={saving}
                className="flex-1 py-3 bg-white border-2 border-border rounded-xl text-sm font-semibold text-text-light cursor-pointer transition-all duration-200 hover:border-primary disabled:cursor-not-allowed"
                style={{ fontFamily: "'Geist', system-ui, sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMat}
                disabled={saving}
                className="flex-1 py-3 text-white border-none rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  fontFamily: "'Geist', system-ui, sans-serif",
                  background: saving ? '#9BA3A8' : 'linear-gradient(135deg, #5B8C5A, #7BAF7A)',
                  boxShadow: saving ? 'none' : '0 2px 8px rgba(91, 140, 90, 0.3)',
                }}
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
