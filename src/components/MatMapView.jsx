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

  // Calculate road width in pixels based on mat size
  // Goal: 2 inches wide on the physical mat
  const getRoadWidth = () => {
    const matPhysicalWidthMeters = matSize.width; // Physical width in meters
    const selectionBoxPixels = selectionBoxSize.width; // Pixels on screen

    // Calculate pixels per meter
    const pixelsPerMeter = selectionBoxPixels / matPhysicalWidthMeters;

    // 2 inches = 0.0508 meters
    const roadWidthMeters = 0.0508;
    const roadWidthPixels = roadWidthMeters * pixelsPerMeter;

    // Return width expression for different road types
    return {
      base: roadWidthPixels,
      highway: roadWidthPixels * 1.5, // Highways are 50% wider
      street: roadWidthPixels
    };
  };

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
        style: 'mapbox://styles/mapbox/streets-v11', // Use streets-v11 style
        center: center,
        zoom: zoom,
        pitch: 0,
        bearing: 0,
        preserveDrawingBuffer: true // Required for canvas image capture
      });

      mapRef.current.on('load', () => {
        console.log('Mat map loaded successfully!');

        // Apply Toy Car Mat styling
        applyToyCarMatStyle();

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

  // Apply custom Toy Car Mat styling
  const applyToyCarMatStyle = () => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // Hide all default layers
    const style = map.getStyle();
    if (style && style.layers) {
      style.layers.forEach(layer => {
        map.setLayoutProperty(layer.id, 'visibility', 'none');
      });
    }

    // Add bright green background
    map.addLayer({
      id: 'toy-background',
      type: 'background',
      paint: {
        'background-color': '#7CFC00' // Bright green (Lawn Green)
      }
    });

    const roadWidth = getRoadWidth();
    console.log('Road width values:', roadWidth);
    console.log('Mat size:', matSize);
    console.log('Selection box size:', selectionBoxSize);

    // Filter for actual roads (exclude pedestrian paths, sidewalks, etc.)
    const roadFilter = [
      'all',
      ['==', '$type', 'LineString'],
      ['!=', 'class', 'path'],
      ['!=', 'class', 'pedestrian'],
      ['!=', 'type', 'sidewalk']
    ];

    // Filter for roads that should have center lines and edge lines
    // Exclude link roads, service roads, and short connecting segments to reduce clutter at intersections
    const linePaintFilter = [
      'all',
      ['==', '$type', 'LineString'],
      ['in', 'class', 'motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'street', 'street_limited'],
      ['!=', 'type', 'service'],
      ['!=', 'type', 'link'],
      ['!=', 'type', 'turning_loop'],
      ['!=', 'type', 'turning_circle']
    ];

    // Add sidewalks - light gray concrete paths
    // Filter for sidewalks and footpaths
    const sidewalkFilter = [
      'any',
      ['==', 'type', 'sidewalk'],
      ['==', 'type', 'footway'],
      ['all', ['==', 'class', 'path'], ['!=', 'type', 'crossing']],
      ['all', ['==', 'class', 'pedestrian'], ['!=', 'type', 'crossing']]
    ];

    map.addLayer({
      id: 'toy-sidewalks',
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      filter: sidewalkFilter,
      paint: {
        'line-color': '#C0C0C0', // Light gray (concrete color)
        'line-width': roadWidth.street * 0.25 // Sidewalks are narrower than roads
      },
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      }
    });

    // Add white road casing FIRST (underneath) - this creates the edge lines
    // By drawing casing underneath and road on top, intersections are naturally clean
    map.addLayer({
      id: 'toy-roads-casing',
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      filter: linePaintFilter,
      paint: {
        'line-color': '#FFFFFF', // White casing (edge lines)
        'line-width': roadWidth.street + Math.max(roadWidth.street * 0.16, 4) // Road width + edge thickness on both sides
      },
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      }
    });

    // Add black road layer (base) ON TOP - covers the casing at intersections
    map.addLayer({
      id: 'toy-roads-base',
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      filter: roadFilter,
      paint: {
        'line-color': '#000000', // Black road surface
        'line-width': roadWidth.street
      },
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      }
    });

    // Add white dashed center line - only on main roads
    map.addLayer({
      id: 'toy-roads-centerline',
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      filter: linePaintFilter,
      paint: {
        'line-color': '#FFFFFF', // White
        'line-width': Math.max(roadWidth.street * 0.15, 1), // Thinner center line, minimum 1px
        'line-dasharray': [3, 2] // Longer dashes with gaps - helps break at intersections naturally
      },
      layout: {
        'line-join': 'miter', // Use miter instead of round to avoid line overlap at intersections
        'line-cap': 'butt' // Square ends to prevent overlap
      }
    });

    // Add crosswalks at intersections
    map.addLayer({
      id: 'toy-crosswalks',
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      filter: ['all', ['==', 'class', 'pedestrian'], ['==', 'type', 'crossing']],
      paint: {
        'line-color': '#FFFFFF',
        'line-width': roadWidth.street * 0.6,
        'line-dasharray': [0.3, 0.3], // Very short dashes for crosswalk stripe effect
        'line-opacity': 0.9
      },
      layout: {
        'line-join': 'miter',
        'line-cap': 'butt'
      }
    });
  };

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

  // Re-apply styling when mat size changes (affects road width)
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      // Remove existing custom layers
      const layersToRemove = ['toy-background', 'toy-sidewalks', 'toy-roads-casing', 'toy-roads-base', 'toy-roads-centerline', 'toy-crosswalks'];
      layersToRemove.forEach(layerId => {
        if (mapRef.current.getLayer(layerId)) {
          mapRef.current.removeLayer(layerId);
        }
      });

      // Re-apply with new dimensions
      applyToyCarMatStyle();
    }
  }, [matSize]);

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
