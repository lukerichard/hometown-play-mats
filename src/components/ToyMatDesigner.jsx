import { useState } from 'react';
import MatSidebar from './MatSidebar';
import MatMapView from './MatMapView';
import MatPreview from './MatPreview';

const ToyMatDesigner = () => {
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

  // Mat sizes in meters
  const matSizes = {
    small: { width: 1, height: 2, name: 'Small', dimensions: '39" × 79" (1m × 2m)' },
    medium: { width: 1.5, height: 2, name: 'Medium', dimensions: '59" × 79" (1.5m × 2m)' },
    large: { width: 2, height: 3, name: 'Large', dimensions: '79" × 118" (2m × 3m)' }
  };

  // Color schemes
  const colorSchemes = {
    classic: { color: '#10b981', name: 'Classic' },
    muted: { color: '#64748b', name: 'Muted' },
    neon: { color: '#ec4899', name: 'Neon Vibrant' }
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

      console.log('Canvas dimensions:', canvas.width, canvas.height);

      const selectionBox = getSelectionBoxDimensions();
      console.log('Selection box dimensions:', selectionBox.width, selectionBox.height);

      // Calculate center of canvas
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Calculate crop area (selection box area)
      const cropX = centerX - (selectionBox.width / 2);
      const cropY = centerY - (selectionBox.height / 2);

      console.log('Crop position:', cropX, cropY);

      // Create a new canvas to hold the cropped image
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = selectionBox.width;
      croppedCanvas.height = selectionBox.height;
      const ctx = croppedCanvas.getContext('2d');

      if (!ctx) {
        console.error('Could not get canvas context');
        alert('Error creating preview. Please try again.');
        return;
      }

      // Draw the cropped area onto the new canvas
      ctx.drawImage(
        canvas,
        cropX, cropY, selectionBox.width, selectionBox.height,
        0, 0, selectionBox.width, selectionBox.height
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

  // Handle back to edit
  const handleBackToEdit = () => {
    setShowPreview(false);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    alert('Add to cart functionality coming soon! Your mat configuration has been saved.');
    // TODO: Implement actual cart functionality
  };

  return (
    <>
    <div style={{
      height: '100vh',
      background: '#f8fafb',
      overflow: 'hidden'
    }}>
      {/* Title Bar */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(16, 185, 129, 0.15)',
        padding: '24px 40px',
        position: 'relative',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #10b981, #059669, #047857, #10b981)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s linear infinite'
        }} />
        <h1 style={{
          margin: 0,
          fontSize: '32px',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.5px'
        }}>
          🎨 Toy Play Mat Designer
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
          colorScheme={colorScheme}
          setColorScheme={setColorScheme}
          matSizes={matSizes}
          colorSchemes={colorSchemes}
          onGenerate={handleGenerateMat}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0', position: 'relative', zIndex: 10 }}>
          {/* Search Bar */}
          <div style={{
            background: '#f8fafb',
            padding: '20px',
            position: 'relative',
            zIndex: 10000
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  value={address}
                  onChange={handleAddressChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchAddress()}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Enter your address (e.g., 1600 Pennsylvania Avenue, Washington, DC)"
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: '#f8fafb',
                    border: '2px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#1e293b',
                    outline: 'none',
                    fontFamily: 'Inter, sans-serif'
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
                    border: '2px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                    zIndex: 99999,
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}>
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.id || index}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        style={{
                          padding: '14px 20px',
                          cursor: 'pointer',
                          borderBottom: index < suggestions.length - 1 ? '1px solid rgba(16, 185, 129, 0.1)' : 'none',
                          transition: 'background 0.2s',
                          fontSize: '15px',
                          color: '#1e293b',
                          fontWeight: '500'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                          {suggestion.text}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
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
                  padding: '16px 32px',
                  background: isSearching ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: isSearching ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
                  letterSpacing: '0.3px'
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

      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
        }

        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
        }
      `}</style>
    </div>

    {/* Modal Overlay */}
    {showPreview && (
      <MatPreview
        previewImage={previewImage}
        matSize={matSize}
        colorScheme={colorScheme}
        matSizes={matSizes}
        colorSchemes={colorSchemes}
        onBackToEdit={handleBackToEdit}
        onAddToCart={handleAddToCart}
      />
    )}
    </>
  );
};

export default ToyMatDesigner;
