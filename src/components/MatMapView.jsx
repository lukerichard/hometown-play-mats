import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MatMapView = ({ center, zoom, matSize, rotation, colorScheme, onMapReady }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  // Convert mat size (in meters) to fixed pixel dimensions on screen
  // Assuming 96 DPI: 1 inch = 96 pixels, doubled for better visibility
  // Rotated 90 degrees: width and height are swapped
  const getSelectionBoxDimensions = () => {
    const DPI = 96;
    const SCALE = 2; // Double the size for better UI visibility
    const dimensions = {
      small: { widthInches: 2, heightInches: 1 },      // 2' × 1' ratio (rotated)
      medium: { widthInches: 2, heightInches: 1.5 },   // 2' × 1.5' ratio (rotated)
      large: { widthInches: 3, heightInches: 2 }       // 3' × 2' ratio (rotated)
    };

    const sizeKey = matSize.name.toLowerCase();
    const size = dimensions[sizeKey] || dimensions.small;

    return {
      width: size.widthInches * DPI * SCALE,
      height: size.heightInches * DPI * SCALE
    };
  };

  const selectionBoxSize = getSelectionBoxDimensions();

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
        bearing: 0,
        preserveDrawingBuffer: true // Required for canvas image capture
      });

      mapRef.current.on('load', () => {
        console.log('Mat map loaded successfully!');
        if (onMapReady) {
          onMapReady(mapRef.current);
        }
      });
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

  return (
    <div style={{
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
      zIndex: 1
    }}>
      {/* Map Container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      />

      {/* Selection Box with Gray Overlay Effect */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${selectionBoxSize.width}px`,
          height: `${selectionBoxSize.height}px`,
          border: `4px solid ${colorScheme}`,
          borderRadius: '16px',
          pointerEvents: 'none',
          zIndex: 1000,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: `
            0 0 0 9999px rgba(0, 0, 0, 0.65),
            0 0 40px ${colorScheme}CC,
            inset 0 0 0 2px rgba(255, 255, 255, 0.5)
          `
        }}
      />

      {/* Selection Box Label */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, calc(-50% + ${selectionBoxSize.height / 2 + 30}px))`,
          background: colorScheme,
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '700',
          pointerEvents: 'none',
          zIndex: 1001,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}
      >
        Print Area: {matSize.name} ({matSize.dimensions})
      </div>
    </div>
  );
};

export default MatMapView;
