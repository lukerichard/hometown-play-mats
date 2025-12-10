import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapEditor = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Map state (center, zoom, pitch for future export)
  const [mapState, setMapState] = useState({
    center: [-122.4194, 37.7749], // San Francisco default
    zoom: 12,
    pitch: 0,
    bearing: 0
  });

  const [address, setAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Initialize map only once
    if (mapRef.current) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN;

    if (!token) {
      console.error('Mapbox token is missing! Check your .env file.');
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-v9', // Hardcoded for now, swappable later
      center: mapState.center,
      zoom: mapState.zoom,
      pitch: mapState.pitch,
      bearing: mapState.bearing
    });

    // Store map instance
    mapRef.current = map;

    // Log when map is loaded
    map.on('load', () => {
      console.log('Map loaded successfully!');
    });

    // Update state when map moves
    map.on('move', () => {
      setMapState({
        center: [map.getCenter().lng, map.getCenter().lat],
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing()
      });
    });

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleSearch = async () => {
    if (!address.trim()) return;

    setIsSearching(true);

    try {
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}`
      );

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;

        // Remove existing marker if any
        if (markerRef.current) {
          markerRef.current.remove();
        }

        // Add new marker
        markerRef.current = new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .addTo(mapRef.current);

        // Fly to location
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: 17,
          essential: true
        });

        console.log('Location found:', data.features[0].place_name);
      } else {
        console.warn('No results found for:', address);
        alert('Address not found. Please try a different search.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Error searching for address. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRotation = (bearing) => {
    if (mapRef.current) {
      mapRef.current.rotateTo(bearing, { duration: 500 });
    }
  };

  const rotateLeft = () => {
    const newBearing = (mapState.bearing - 15 + 360) % 360;
    handleRotation(newBearing);
  };

  const rotateRight = () => {
    const newBearing = (mapState.bearing + 15) % 360;
    handleRotation(newBearing);
  };

  const resetRotation = () => {
    handleRotation(0);
  };

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Floating Sidebar */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          zIndex: 1000,
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          padding: '1rem',
          width: '320px'
        }}
      >
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
          Map Editor
        </h2>

        <div style={{ marginBottom: '1rem' }}>
          <label
            htmlFor="address"
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}
          >
            Address
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter an address..."
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              outline: 'none'
            }}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            style={{
              width: '100%',
              marginTop: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: isSearching ? '#9ca3af' : '#3b82f6',
              color: 'white',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: isSearching ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Rotation Controls */}
        <div style={{ marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}
          >
            Rotation: {mapState.bearing.toFixed(0)}°
          </label>

          {/* Rotation Slider */}
          <input
            type="range"
            min="0"
            max="360"
            value={mapState.bearing}
            onChange={(e) => handleRotation(Number(e.target.value))}
            style={{
              width: '100%',
              marginBottom: '0.5rem'
            }}
          />

          {/* Rotation Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={rotateLeft}
              style={{
                flex: 1,
                padding: '0.5rem',
                backgroundColor: '#6b7280',
                color: 'white',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.875rem'
              }}
            >
              ← 15°
            </button>
            <button
              onClick={resetRotation}
              style={{
                flex: 1,
                padding: '0.5rem',
                backgroundColor: '#6b7280',
                color: 'white',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.875rem'
              }}
            >
              Reset
            </button>
            <button
              onClick={rotateRight}
              style={{
                flex: 1,
                padding: '0.5rem',
                backgroundColor: '#6b7280',
                color: 'white',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.875rem'
              }}
            >
              15° →
            </button>
          </div>
        </div>

        {/* Map State Display (for debugging) */}
        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '1rem' }}>
          <div>Lat: {mapState.center[1].toFixed(4)}</div>
          <div>Lng: {mapState.center[0].toFixed(4)}</div>
          <div>Zoom: {mapState.zoom.toFixed(2)}</div>
          <div>Bearing: {mapState.bearing.toFixed(0)}°</div>
        </div>
      </div>
    </div>
  );
};

export default MapEditor;
