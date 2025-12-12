import { useState } from 'react';
import MapCanvas from './MapCanvas';

const LandingPage = () => {
  const [address, setAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState([-122.4194, 37.7749]); // San Francisco default
  const [mapZoom, setMapZoom] = useState(17);
  const [mapBearing, setMapBearing] = useState(0);

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
        setMapCenter([lng, lat]);
        setMapZoom(17);
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

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2D3436' }}>
        Hometown Play Mats - Custom Street Play Mats
      </h1>

      {/* Address Search */}
      <div style={{ width: '500px' }}>
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
          Enter an Address
        </label>
        <input
          id="address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g., Times Square, New York"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #d1d5db',
            borderRadius: '0.5rem',
            outline: 'none',
            fontSize: '1rem'
          }}
        />
        <button
          onClick={handleSearch}
          disabled={isSearching}
          style={{
            width: '100%',
            marginTop: '0.75rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: isSearching ? '#9ca3af' : '#3b82f6',
            color: 'white',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: isSearching ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '1rem'
          }}
        >
          {isSearching ? 'Searching...' : 'Search Location'}
        </button>
      </div>

      {/* Map Canvas */}
      <MapCanvas center={mapCenter} zoom={mapZoom} bearing={mapBearing} />

      {/* Rotation Controls */}
      <div style={{ width: '500px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}
        >
          Rotation: {mapBearing}°
        </label>
        <input
          type="range"
          min="0"
          max="360"
          value={mapBearing}
          onChange={(e) => setMapBearing(Number(e.target.value))}
          style={{
            width: '100%',
            marginBottom: '0.5rem'
          }}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setMapBearing((prev) => (prev - 15 + 360) % 360)}
            style={{
              flex: 1,
              padding: '0.5rem',
              backgroundColor: '#6b7280',
              color: 'white',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            ← 15°
          </button>
          <button
            onClick={() => setMapBearing(0)}
            style={{
              flex: 1,
              padding: '0.5rem',
              backgroundColor: '#6b7280',
              color: 'white',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Reset
          </button>
          <button
            onClick={() => setMapBearing((prev) => (prev + 15) % 360)}
            style={{
              flex: 1,
              padding: '0.5rem',
              backgroundColor: '#6b7280',
              color: 'white',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            15° →
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
