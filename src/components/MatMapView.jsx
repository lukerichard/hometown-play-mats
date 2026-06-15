import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Physical mat dimensions in inches per size name
const MAT_INCHES = {
  Small:  { w: 36, h: 24 },
  Medium: { w: 48, h: 36 },
  Large:  { w: 60, h: 48 },
};

const MAT_FRAME_FILL = 0.8;

const MAP_PALETTE = {
  roads: '#B0B3B8',
  roadDetail: '#EAE6E1',
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

// Reference scale for road detail. Higher numbers make a feature appear later
// when zooming in, so they disappear earlier when zooming out.
const ROAD_ZOOM_SCALE = {
  major: 9,
  medium: 12,
  local: 14,
  service: 15.5,
  majorLabels: 10,
  mediumLabels: 12,
  localLabels: 14,
  serviceLabels: 15,
};

const ROAD_CASING_SCALE = 1.34;

const classIn = (...classes) => ['in', ['get', 'class'], ['literal', classes]];
const typeIn = (...types) => ['in', ['get', 'type'], ['literal', types]];

const MatMapView = ({
  center,
  zoom,
  matSize,
  rotation,
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

  // Compute mat frame pixel dimensions using the available map viewport.
  const getFrame = () => {
    const { w: cw, h: ch } = containerSize;
    if (cw === 0 || ch === 0) return null;

    const spec = MAT_INCHES[matSize.name] || MAT_INCHES.Medium;
    const largeSpec = MAT_INCHES.Large;
    const ppi = Math.min((cw * MAT_FRAME_FILL) / largeSpec.w, (ch * MAT_FRAME_FILL) / largeSpec.h);

    const fw = spec.w * ppi;
    const fh = spec.h * ppi;

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

  useEffect(() => {
    if (!mapRef.current || !containerSize.w || !containerSize.h) return;
    mapRef.current.resize();
  }, [containerSize.w, containerSize.h]);

  // Calculate road width based on physical mat size
  const getRoadWidth = () => {
    if (!frame) return null;
    const spec = MAT_INCHES[matSize.name] || MAT_INCHES.Medium;
    const physicalWidthMeters = spec.w * 0.0254;
    const pixelsPerMeter = frame.fw / physicalWidthMeters;
    const totalRoadWidthPixels = 0.0508 * pixelsPerMeter; // 2 inches including sidewalk/casing
    const roadBaseWidthPixels = totalRoadWidthPixels / ROAD_CASING_SCALE;

    return {
      base: roadBaseWidthPixels,
      highway: roadBaseWidthPixels,
      street: roadBaseWidthPixels,
    };
  };

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
      'pastel-road-major-casing',
      'pastel-road-major-base',
      'pastel-road-major-centerline',
      'pastel-road-medium-casing',
      'pastel-road-medium-base',
      'pastel-road-medium-centerline',
      'pastel-road-local-casing',
      'pastel-road-local-base',
      'pastel-road-service-casing',
      'pastel-road-service-base',
      'pastel-road-major-labels',
      'pastel-road-medium-labels',
      'pastel-road-local-labels',
      'pastel-road-service-labels',
    ];

    layerIds.forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
  };

  function applyPastelMatStyle() {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getSource('composite')) return;

    const roadWidth = getRoadWidth();
    if (!roadWidth) return;

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

    const lineString = ['==', ['geometry-type'], 'LineString'];
    const majorRoadFilter = ['all', lineString, classIn('motorway', 'trunk', 'primary')];
    const mediumRoadFilter = ['all', lineString, classIn('secondary', 'tertiary')];
    const localRoadFilter = ['all', lineString, classIn('street', 'street_limited', 'residential')];
    const serviceRoadFilter = [
      'all',
      lineString,
      ['any', classIn('service'), typeIn('service', 'driveway', 'parking_aisle')],
    ];

    const addRoadCasing = ({ id, filter, minzoom, width }) => {
      map.addLayer({
        id: `pastel-road-${id}-casing`,
        type: 'line',
        source: 'composite',
        'source-layer': 'road',
        filter,
        minzoom,
        paint: {
          'line-color': MAP_PALETTE.roadDetail,
          'line-width': width * ROAD_CASING_SCALE,
          'line-opacity': 1,
        },
        layout: { 'line-join': 'round', 'line-cap': 'round' },
      });
    };

    const addRoadBase = ({ id, filter, minzoom, width }) => {
      map.addLayer({
        id: `pastel-road-${id}-base`,
        type: 'line',
        source: 'composite',
        'source-layer': 'road',
        filter,
        minzoom,
        paint: {
          'line-color': MAP_PALETTE.roads,
          'line-width': width,
          'line-opacity': 1,
        },
        layout: { 'line-join': 'round', 'line-cap': 'round' },
      });
    };

    const addCenterline = ({ id, filter, minzoom, width }) => {
      map.addLayer({
        id: `pastel-road-${id}-centerline`,
        type: 'line',
        source: 'composite',
        'source-layer': 'road',
        filter,
        minzoom,
        paint: {
          'line-color': MAP_PALETTE.roadDetail,
          'line-width': Math.max(width * 0.12, 1),
          'line-dasharray': [3, 2],
          'line-opacity': 0.9,
        },
        layout: { 'line-join': 'miter', 'line-cap': 'butt' },
      });
    };

    const roadGroups = [
      { id: 'major', filter: majorRoadFilter, minzoom: ROAD_ZOOM_SCALE.major, width: roadWidth.highway },
      { id: 'medium', filter: mediumRoadFilter, minzoom: ROAD_ZOOM_SCALE.medium, width: roadWidth.street },
      { id: 'local', filter: localRoadFilter, minzoom: ROAD_ZOOM_SCALE.local, width: roadWidth.street },
      { id: 'service', filter: serviceRoadFilter, minzoom: ROAD_ZOOM_SCALE.service, width: roadWidth.street },
    ];

    roadGroups.forEach(addRoadCasing);
    roadGroups.forEach(addRoadBase);

    addCenterline({ id: 'major', filter: majorRoadFilter, minzoom: ROAD_ZOOM_SCALE.major, width: roadWidth.highway });
    addCenterline({ id: 'medium', filter: mediumRoadFilter, minzoom: ROAD_ZOOM_SCALE.medium, width: roadWidth.street });

    if (showStreetNames) {
      const addRoadLabels = ({ id, filter, minzoom, width, spacing = 160 }) => {
        const textSize = Math.min(Math.max(width * ROAD_CASING_SCALE * 0.42, 12), 22);
        const textMaskWidth = Math.max(textSize * 0.22, 3);

        map.addLayer({
          id: `pastel-road-${id}-labels`,
          type: 'symbol',
          source: 'composite',
          'source-layer': 'road',
          filter: ['all', filter, ['has', 'name']],
          minzoom,
          layout: {
            'symbol-placement': 'line',
            'symbol-spacing': spacing,
            'text-field': ['get', 'name'],
            'text-font': ['DIN Pro Regular', 'Arial Unicode MS Regular'],
            'text-size': textSize,
            'text-letter-spacing': 0.02,
            'text-rotation-alignment': 'map',
            'text-pitch-alignment': 'viewport',
            'text-keep-upright': true,
            'text-max-angle': 35,
            'text-padding': 1,
            'text-allow-overlap': false,
            'text-ignore-placement': false,
          },
          paint: {
            'text-color': '#FFFFFF',
            'text-halo-color': MAP_PALETTE.roads,
            'text-halo-width': textMaskWidth,
            'text-halo-blur': 0.15,
            'text-opacity': 0.82,
          },
        });
      };

      addRoadLabels({ id: 'major', filter: majorRoadFilter, minzoom: ROAD_ZOOM_SCALE.majorLabels, width: roadWidth.highway });
      addRoadLabels({ id: 'medium', filter: mediumRoadFilter, minzoom: ROAD_ZOOM_SCALE.mediumLabels, width: roadWidth.street });
      addRoadLabels({ id: 'local', filter: localRoadFilter, minzoom: ROAD_ZOOM_SCALE.localLabels, width: roadWidth.street, spacing: 130 });
      addRoadLabels({ id: 'service', filter: serviceRoadFilter, minzoom: ROAD_ZOOM_SCALE.serviceLabels, width: roadWidth.street, spacing: 120 });
    }

  }

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
          minPitch: 0,
          maxPitch: 0,
          pitchWithRotate: false,
          touchPitch: false,
          bearing: 0,
          dragRotate: true,
          preserveDrawingBuffer: true,
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapUnavailable(true); // eslint-disable-line react-hooks/set-state-in-effect
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
    if (!map?.isStyleLoaded() || !map.getSource('composite')) return;
    applyPastelMatStyle();
  }, [containerSize.w, containerSize.h, matSize, showStreetNames]); // eslint-disable-line react-hooks/exhaustive-deps

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
