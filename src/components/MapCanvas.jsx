import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapCanvas = ({ center = [-122.4194, 37.7749], zoom = 17, bearing = 0 }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // Initialize map
    if (!mapRef.current) {
      const token = import.meta.env.VITE_MAPBOX_TOKEN;

      if (!token) {
        console.error('Mapbox token is missing! Check your .env file.');
        return;
      }

      mapboxgl.accessToken = token;

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: center,
        zoom: zoom,
        bearing: bearing
      });

      mapRef.current.on('load', () => {
        console.log('MapCanvas loaded successfully!');
      });
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map when center changes
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      mapRef.current.flyTo({
        center: center,
        zoom: zoom,
        bearing: bearing,
        essential: true
      });
    }
  }, [center, zoom, bearing]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '500px',
        height: '500px',
        border: '2px solid #ddd',
        borderRadius: '8px'
      }}
    />
  );
};

export default MapCanvas;
