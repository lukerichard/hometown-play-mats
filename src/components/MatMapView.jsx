import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Physical mat dimensions in inches per size name
const MAT_INCHES = {
  Small:  { w: 24, h: 36 },
  Medium: { w: 36, h: 48 },
  Large:  { w: 48, h: 60 },
};

const MAP_PALETTE = {
  roads: '#B0B3B8',
  sidewalks: '#EAE6E1',
  parks: '#C2D5C4',
  forests: '#9EAD95',
  water: '#A8CEDB',
  forestOutline: '#84947E',
  waterOutline: '#7FB4C4',
  buildingRose: '#E5B8B7',
  buildingYellow: '#F9E79F',
  buildingLavender: '#D2C5E3',
  buildingBlue: '#B3C6E6',
};

const classIn = (...classes) => ['in', ['get', 'class'], ['literal', classes]];
const typeIn = (...types) => ['in', ['get', 'type'], ['literal', types]];
const typeIs = (type) => ['==', ['get', 'type'], type];

const MatMapView = ({
  center,
  zoom,
  matSize,
  rotation,
  colorScheme,
  showStreetNames = true,
  onMapReady,
  onFrameChange,
}) => {
  const wrapperRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapUnavailable, setMapUnavailable] = useState(false);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  // Track container size so the overlay panels stay accurate
  useEffect(() => {
    if (!wrapperRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setContainerSize({ w: width, h: height });
    });
    ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  // Compute mat frame pixel dimensions at a consistent physical scale.
  // Reference: the large mat (60" tall) occupies 72% of the container height.
  const getFrame = () => {
    const { w: cw, h: ch } = containerSize;
    if (cw === 0 || ch === 0) return null;

    const spec = MAT_INCHES[matSize.name] || MAT_INCHES.Medium;
    const ppi = (ch * 0.72) / 60;

    let fw = spec.w * ppi;
    let fh = spec.h * ppi;

    // Scale down if the frame would overflow the container
    const scale = Math.min(1, (cw * 0.90) / fw, (ch * 0.90) / fh);
    fw *= scale;
    fh *= scale;

    const fl = (cw - fw) / 2;
    const ft = (ch - fh) / 2;

    return { fw, fh, fl, ft, fr: fl + fw, fb: ft + fh };
  };

  const frame = getFrame();

  // Notify parent of frame pixel dimensions so crop logic stays in sync
  useEffect(() => {
    if (!onFrameChange || !frame) return;
    onFrameChange({ width: frame.fw, height: frame.fh });
  }, [frame?.fw, frame?.fh]); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate road width based on physical mat size
  const getRoadWidth = () => {
    const { w: cw } = containerSize;
    if (cw === 0) return { base: 20, highway: 30, street: 20 };

    const spec = MAT_INCHES[matSize.name] || MAT_INCHES.Medium;
    const ppi = (containerSize.h * 0.72) / 60;
    const matPixelWidth = spec.w * ppi;
    const pixelsPerMeter = matPixelWidth / matSize.width;
    const roadWidthPixels = 0.0508 * pixelsPerMeter; // 2 inches in meters

    return {
      base: roadWidthPixels,
      highway: roadWidthPixels * 1.5,
      street: roadWidthPixels,
    };
  };

  useEffect(() => {
    if (!mapRef.current) {
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      if (token) mapboxgl.accessToken = token;

      try {
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: token ? 'mapbox://styles/mapbox/streets-v12' : {
            version: 8,
            sources: {
              osm: {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '(c) OpenStreetMap contributors',
              },
            },
            layers: [
              {
                id: 'osm-tiles',
                type: 'raster',
                source: 'osm',
                minzoom: 0,
                maxzoom: 19,
              },
            ],
          },
          center,
          zoom,
          pitch: 0,
          bearing: 0,
          preserveDrawingBuffer: true,
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapUnavailable(true);
        return;
      }

      mapRef.current.addControl(
        new mapboxgl.NavigationControl({ showCompass: true, showZoom: true }),
        'bottom-left'
      );

      mapRef.current.on('load', () => {
        applyPastelMatStyle();
        if (onMapReady) onMapReady(mapRef.current);
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const removePastelLayers = () => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const layerIds = [
      'pastel-background',
      'pastel-park',
      'pastel-forest',
      'pastel-forest-outline',
      'pastel-water',
      'pastel-water-outline',
      'pastel-buildings',
      'pastel-sidewalks',
      'pastel-road-casing',
      'pastel-road-base',
      'pastel-road-centerline',
      'pastel-crosswalks',
      'pastel-road-labels',
    ];

    layerIds.forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
  };

  const applyPastelMatStyle = () => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getSource('composite')) return;

    removePastelLayers();

    const style = map.getStyle();
    if (style?.layers) {
      style.layers.forEach((layer) => map.setLayoutProperty(layer.id, 'visibility', 'none'));
    }

    map.addLayer({
      id: 'pastel-background',
      type: 'background',
      paint: { 'background-color': MAP_PALETTE.parks },
    });

    map.addLayer({
      id: 'pastel-park',
      type: 'fill',
      source: 'composite',
      'source-layer': 'landuse',
      filter: classIn('park', 'grass', 'pitch', 'cemetery', 'recreation_ground'),
      paint: {
        'fill-color': MAP_PALETTE.parks,
        'fill-opacity': 1,
      },
    });

    map.addLayer({
      id: 'pastel-forest',
      type: 'fill',
      source: 'composite',
      'source-layer': 'landuse',
      filter: classIn('wood', 'forest', 'scrub'),
      paint: {
        'fill-color': MAP_PALETTE.forests,
        'fill-opacity': 0.95,
      },
    });

    map.addLayer({
      id: 'pastel-forest-outline',
      type: 'line',
      source: 'composite',
      'source-layer': 'landuse',
      filter: classIn('wood', 'forest', 'scrub'),
      paint: {
        'line-color': MAP_PALETTE.forestOutline,
        'line-width': 1,
        'line-opacity': 0.45,
      },
    });

    map.addLayer({
      id: 'pastel-water',
      type: 'fill',
      source: 'composite',
      'source-layer': 'water',
      paint: {
        'fill-color': MAP_PALETTE.water,
        'fill-opacity': 1,
      },
    });

    map.addLayer({
      id: 'pastel-water-outline',
      type: 'line',
      source: 'composite',
      'source-layer': 'water',
      paint: {
        'line-color': MAP_PALETTE.waterOutline,
        'line-width': 1,
        'line-opacity': 0.4,
      },
    });

    map.addLayer({
      id: 'pastel-buildings',
      type: 'fill',
      source: 'composite',
      'source-layer': 'building',
      minzoom: 13,
      paint: {
        'fill-color': [
          'match',
          ['get', 'type'],
          'house', MAP_PALETTE.buildingRose,
          'residential', MAP_PALETTE.buildingBlue,
          'apartments', MAP_PALETTE.buildingLavender,
          'school', MAP_PALETTE.buildingYellow,
          'commercial', MAP_PALETTE.buildingLavender,
          MAP_PALETTE.buildingRose,
        ],
        'fill-opacity': 0.78,
        'fill-outline-color': '#CFAAA9',
      },
    });

    const roadWidth = getRoadWidth();

    const lineString = ['==', ['geometry-type'], 'LineString'];
    const roadFilter = ['all', lineString, ['!', classIn('path', 'pedestrian')], ['!', typeIs('sidewalk')]];
    const linePaintFilter = [
      'all',
      lineString,
      classIn('motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'street', 'street_limited'),
      ['!', typeIn('service', 'link', 'turning_loop', 'turning_circle')],
    ];
    const sidewalkFilter = [
      'any',
      typeIn('sidewalk', 'footway'),
      ['all', classIn('path'), ['!', typeIs('crossing')]],
      ['all', classIn('pedestrian'), ['!', typeIs('crossing')]],
    ];

    map.addLayer({ id: 'pastel-sidewalks', type: 'line', source: 'composite', 'source-layer': 'road', filter: sidewalkFilter, paint: { 'line-color': MAP_PALETTE.sidewalks, 'line-width': roadWidth.street * 0.32, 'line-opacity': 0.95 }, layout: { 'line-join': 'round', 'line-cap': 'round' } });
    map.addLayer({ id: 'pastel-road-casing', type: 'line', source: 'composite', 'source-layer': 'road', filter: roadFilter, paint: { 'line-color': MAP_PALETTE.sidewalks, 'line-width': roadWidth.street + Math.max(roadWidth.street * 0.38, 5), 'line-opacity': 1 }, layout: { 'line-join': 'round', 'line-cap': 'round' } });
    map.addLayer({ id: 'pastel-road-base', type: 'line', source: 'composite', 'source-layer': 'road', filter: roadFilter, paint: { 'line-color': MAP_PALETTE.roads, 'line-width': roadWidth.street, 'line-opacity': 1 }, layout: { 'line-join': 'round', 'line-cap': 'round' } });
    map.addLayer({ id: 'pastel-road-centerline', type: 'line', source: 'composite', 'source-layer': 'road', filter: linePaintFilter, paint: { 'line-color': MAP_PALETTE.sidewalks, 'line-width': Math.max(roadWidth.street * 0.12, 1), 'line-dasharray': [3, 2], 'line-opacity': 0.9 }, layout: { 'line-join': 'miter', 'line-cap': 'butt' } });
    map.addLayer({ id: 'pastel-crosswalks', type: 'line', source: 'composite', 'source-layer': 'road', filter: ['all', classIn('pedestrian'), typeIs('crossing')], paint: { 'line-color': MAP_PALETTE.sidewalks, 'line-width': roadWidth.street * 0.6, 'line-dasharray': [0.3, 0.3], 'line-opacity': 0.9 }, layout: { 'line-join': 'miter', 'line-cap': 'butt' } });

    if (showStreetNames) {
      map.addLayer({
        id: 'pastel-road-labels',
        type: 'symbol',
        source: 'composite',
        'source-layer': 'road',
        filter: ['all', lineString, ['has', 'name'], classIn('motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'street', 'street_limited')],
        layout: {
          'symbol-placement': 'line',
          'symbol-spacing': 280,
          'text-field': ['get', 'name'],
          'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            13, 10,
            16, 12,
            18, 14,
          ],
          'text-letter-spacing': 0.02,
          'text-rotation-alignment': 'map',
          'text-pitch-alignment': 'viewport',
          'text-keep-upright': true,
          'text-max-angle': 35,
          'text-padding': 2,
          'text-allow-overlap': false,
          'text-ignore-placement': false,
        },
        paint: {
          'text-color': '#4F555C',
          'text-halo-color': MAP_PALETTE.sidewalks,
          'text-halo-width': 1.25,
          'text-halo-blur': 0.35,
          'text-opacity': 0.82,
        },
      });
    }

  };

  useEffect(() => {
    if (mapRef.current?.isStyleLoaded()) {
      mapRef.current.flyTo({ center, zoom, essential: true });
    }
  }, [center, zoom]);

  useEffect(() => {
    if (mapRef.current?.isStyleLoaded()) {
      mapRef.current.rotateTo(rotation, { duration: 300 });
    }
  }, [rotation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded() || !map.getLayer('pastel-background')) return;
    applyPastelMatStyle();
  }, [matSize, showStreetNames]); // eslint-disable-line react-hooks/exhaustive-deps

  const OVERLAY = 'rgba(20, 27, 41, 0.46)';

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
    >
      {/* Map canvas */}
      {!mapUnavailable ? (
        <div ref={mapContainerRef} style={{ position: 'absolute', inset: 0 }} />
      ) : (
        <div className="map-fallback" aria-label="Map preview placeholder">
          <div className="fallback-water" />
          <div className="fallback-park" />
          <span className="fallback-road road-one" />
          <span className="fallback-road road-two" />
          <span className="fallback-road road-three" />
          <span className="fallback-pin pin-one" />
          <span className="fallback-pin pin-two" />
          <span className="fallback-pin pin-three" />
        </div>
      )}

      {/* Mat frame overlay: 4 panels darken everything outside the mat area */}
      {frame && (
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: frame.ft, background: OVERLAY, pointerEvents: 'none', zIndex: 5 }} />
          <div style={{ position: 'absolute', top: frame.fb, left: 0, right: 0, bottom: 0, background: OVERLAY, pointerEvents: 'none', zIndex: 5 }} />
          <div style={{ position: 'absolute', top: frame.ft, left: 0, width: frame.fl, height: frame.fh, background: OVERLAY, pointerEvents: 'none', zIndex: 5 }} />
          <div style={{ position: 'absolute', top: frame.ft, left: frame.fr, right: 0, height: frame.fh, background: OVERLAY, pointerEvents: 'none', zIndex: 5 }} />

          {/* Mat frame border */}
          <div
            style={{
              position: 'absolute',
              top: frame.ft,
              left: frame.fl,
              width: frame.fw,
              height: frame.fh,
              border: '2px solid rgba(255, 255, 255, 0.88)',
              borderRadius: '3px',
              boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.30), inset 0 0 0 1px rgba(0,0,0,0.12)',
              pointerEvents: 'none',
              zIndex: 6,
            }}
          />

          {/* Size label below the frame */}
          <div
            style={{
              position: 'absolute',
              top: frame.fb + 10,
              left: frame.fl,
              width: frame.fw,
              textAlign: 'center',
              color: 'rgba(255,255,255,0.82)',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              pointerEvents: 'none',
              zIndex: 6,
            }}
          >
            {matSize.dimensions}
          </div>
        </>
      )}
    </div>
  );
};

export default MatMapView;
