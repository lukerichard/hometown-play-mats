import { useState } from 'react';
import MapCanvas from './MapCanvas';

const LandingPage = () => {
  const [address, setAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState([-122.4194, 37.7749]);
  const [mapZoom, setMapZoom] = useState(17);
  const [mapBearing, setMapBearing] = useState(0);

  const font = "'DM Sans', 'Poppins', sans-serif";
  const fontDisplay = "'Poppins', 'DM Sans', sans-serif";

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
      } else {
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
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div style={{
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2rem',
      background: '#FDF8F0',
      minHeight: '100vh',
      fontFamily: font
    }}>
      <h1 style={{
        fontSize: '2.8rem',
        fontWeight: '900',
        color: '#3B3B3B',
        fontFamily: fontDisplay,
        lineHeight: 1.2,
        textAlign: 'center'
      }}>
        Your Neighborhood,<br />Your Adventure!
      </h1>

      {/* Address Search */}
      <div style={{ width: '500px', maxWidth: '100%' }}>
        <label htmlFor="address" style={{
          display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#2D2D2D', marginBottom: '0.5rem',
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
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
            padding: '12px 18px',
            border: '2.5px solid #E0DDD5',
            borderRadius: '12px',
            outline: 'none',
            fontSize: '1rem',
            fontFamily: font,
            color: '#2D2D2D',
            transition: 'border-color 0.2s, box-shadow 0.2s'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#3DAEF5';
            e.currentTarget.style.boxShadow = '0 0 0 4px rgba(61, 174, 245, 0.25)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#E0DDD5';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        <button
          onClick={handleSearch}
          disabled={isSearching}
          style={{
            width: '100%',
            marginTop: '0.75rem',
            padding: '14px 28px',
            backgroundColor: isSearching ? '#B0A999' : '#3DAEF5',
            color: 'white',
            borderRadius: '999px',
            border: 'none',
            cursor: isSearching ? 'not-allowed' : 'pointer',
            fontWeight: '700',
            fontSize: '1rem',
            fontFamily: font,
            boxShadow: isSearching ? 'none' : '0 0 0 4px rgba(61, 174, 245, 0.25)',
            transition: 'all 0.2s'
          }}
        >
          {isSearching ? 'Searching...' : 'Search Location'}
        </button>
      </div>

      {/* Map Canvas */}
      <MapCanvas center={mapCenter} zoom={mapZoom} bearing={mapBearing} />

      {/* Rotation Controls */}
      <div style={{ width: '500px', maxWidth: '100%' }}>
        <label style={{
          display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#2D2D2D', marginBottom: '0.5rem',
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          Rotation: {mapBearing}°
        </label>
        <input
          type="range"
          min="0"
          max="360"
          value={mapBearing}
          onChange={(e) => setMapBearing(Number(e.target.value))}
          style={{ width: '100%', marginBottom: '0.5rem' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { label: '← 15°', action: () => setMapBearing((prev) => (prev - 15 + 360) % 360) },
            { label: 'Reset', action: () => setMapBearing(0) },
            { label: '15° →', action: () => setMapBearing((prev) => (prev + 15) % 360) },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={btn.action}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#3B3B3B',
                color: 'white',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700',
                fontFamily: font,
                fontSize: '0.875rem',
                transition: 'all 0.2s'
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
