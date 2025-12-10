import { useState } from 'react';
import MatSidebar from './MatSidebar';
import MatMapView from './MatMapView';

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

  // Handle generate mat - capture map and prepare for AI
  const handleGenerateMat = () => {
    if (!mapInstance) {
      alert('Map is still loading. Please wait a moment and try again.');
      return;
    }

    const size = matSizes[matSize];
    const color = colorSchemes[colorScheme];

    // Create configuration object for AI
    const config = {
      mat: {
        size: matSize,
        dimensions: size.dimensions,
        widthMeters: size.width,
        heightMeters: size.height,
        rotation: rotation
      },
      colorScheme: {
        name: color.name,
        primary: color.color
      },
      location: {
        latitude: mapCenter[1],
        longitude: mapCenter[0],
        zoom: mapZoom,
        address: address || 'Not specified'
      },
      timestamp: new Date().toISOString()
    };

    // Capture map as image
    const canvas = mapInstance.getCanvas();
    const imageDataUrl = canvas.toDataURL('image/png');

    // Download configuration as JSON
    const configBlob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const configUrl = URL.createObjectURL(configBlob);
    const configLink = document.createElement('a');
    configLink.href = configUrl;
    configLink.download = `toymat-config-${Date.now()}.json`;
    configLink.click();
    URL.revokeObjectURL(configUrl);

    // Download map image
    const imageLink = document.createElement('a');
    imageLink.href = imageDataUrl;
    imageLink.download = `toymat-map-${Date.now()}.png`;
    imageLink.click();

    alert(
      `Mat configuration and map image downloaded!\n\n` +
      `Size: ${size.name} - ${size.dimensions}\n` +
      `Rotation: ${rotation}°\n` +
      `Color Scheme: ${color.name}\n` +
      `Location: ${mapCenter[1].toFixed(4)}, ${mapCenter[0].toFixed(4)}\n\n` +
      `You can now use these files with your AI tool to generate the toy map version.`
    );
  };

  return (
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

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0' }}>
          {/* Search Bar */}
          <div style={{
            background: '#f8fafb',
            padding: '20px',
            position: 'relative',
            zIndex: 100
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
                    zIndex: 10000,
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
  );
};

export default ToyMatDesigner;
