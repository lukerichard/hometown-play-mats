import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MatMapView = ({ center, zoom, matSize, rotation, colorScheme, onMapReady }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [overlayDimensions, setOverlayDimensions] = useState({ width: 0, height: 0 });

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
        style: 'mapbox://styles/mapbox/streets-v12', // Classic map style
        center: center,
        zoom: zoom,
        pitch: 0,
        bearing: 0
      });

      mapRef.current.on('load', () => {
        console.log('Mat map loaded successfully!');
        updateOverlay();
        if (onMapReady) {
          onMapReady(mapRef.current);
        }
      });

      mapRef.current.on('zoom', updateOverlay);
      mapRef.current.on('move', updateOverlay);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map center and zoom when they change
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      mapRef.current.flyTo({
        center: center,
        zoom: zoom,
        essential: true
      });
    }
  }, [center, zoom]);

  // Update map rotation when rotation changes
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      mapRef.current.rotateTo(rotation, {
        duration: 300
      });
    }
  }, [rotation]);

  // Calculate overlay dimensions based on mat size and map zoom
  const updateOverlay = () => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;

    const map = mapRef.current;
    const mapCenter = map.getCenter();
    const currentZoom = map.getZoom();

    // Convert meters to pixels at current zoom level
    const metersPerPixel =
      156543.03392 * Math.cos((mapCenter.lat * Math.PI) / 180) / Math.pow(2, currentZoom);

    const widthPx = matSize.width / metersPerPixel;
    const heightPx = matSize.height / metersPerPixel;

    setOverlayDimensions({ width: widthPx, height: heightPx });
  };

  // Update overlay when mat size changes
  useEffect(() => {
    updateOverlay();
  }, [matSize]);

  return (
    <div style={{
      flex: 1,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(16, 185, 129, 0.15)',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      position: 'relative'
    }}>
      {/* Map Container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '20px'
        }}
      />

      {/* Mat Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          border: `4px dashed ${colorScheme}`,
          pointerEvents: 'none',
          zIndex: 1000,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: `
            0 0 40px ${colorScheme}4D,
            inset 0 0 40px ${colorScheme}1A
          `,
          background: `${colorScheme}0D`,
          width: `${overlayDimensions.width}px`,
          height: `${overlayDimensions.height}px`
        }}
      />
    </div>
  );
};

export default MatMapView;
