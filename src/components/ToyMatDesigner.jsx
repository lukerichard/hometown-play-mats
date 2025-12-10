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

  // Handle address search
  const handleSearchAddress = async () => {
    if (!address.trim()) {
      alert('Please enter an address');
      return;
    }

    setIsSearching(true);

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
      backgroundImage: `
        radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.08) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(5, 150, 105, 0.08) 0px, transparent 50%)
      `,
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
        padding: '24px',
        gap: '24px'
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

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Search Bar */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchAddress()}
                placeholder="Enter your address (e.g., 1600 Pennsylvania Avenue, Washington, DC)"
                style={{
                  flex: 1,
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
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
        }
      `}</style>
    </div>
  );
};

export default ToyMatDesigner;
