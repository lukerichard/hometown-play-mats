import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import homePinIconUrl from '../../icons/home.png';
import schoolPinIconUrl from '../../icons/school.png';
import parkPinIconUrl from '../../icons/park.png';
import playgroundPinIconUrl from '../../icons/playground.png';
import grandparentsPinIconUrl from '../../icons/grandparents.png';
import treatPinIconUrl from '../../icons/treat.png';
import customPinIconUrl from '../../icons/custom.png';

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
const HOME_PIN_SOURCE_ID = 'pastel-home-pin';
const HOME_PIN_LAYER_ID = 'pastel-home-pin-symbol';
const LANDMARK_SOURCE_ID = 'pastel-landmarks';
const LANDMARK_LAYER_ID = 'pastel-landmark-symbols';
const CUSTOM_PIN_SOURCE_ID = 'pastel-custom-pin';
const CUSTOM_PIN_LAYER_ID = 'pastel-custom-pin-symbol';
const PIN_ICON_IMAGE_HEIGHT = 512;
const PIN_ICON_URLS = {
  home: homePinIconUrl,
  school: schoolPinIconUrl,
  park: parkPinIconUrl,
  playground: playgroundPinIconUrl,
  grandparents: grandparentsPinIconUrl,
  treat: treatPinIconUrl,
  custom: customPinIconUrl,
};
const PIN_ICON_IDS = Object.keys(PIN_ICON_URLS);
const LANDMARK_ICON_TYPES = {
  school: 'school',
  playground: 'playground',
  park: 'park',
};
const LANDMARK_TYPES = [
  {
    type: 'school',
    priority: 10,
    tests: ['school', 'kindergarten', 'preschool', 'college', 'university', 'academy'],
  },
  { type: 'playground', priority: 9, tests: ['playground'] },
  { type: 'park', priority: 8, tests: ['park', 'garden', 'recreation ground', 'recreation_ground'] },
];
const mapImageLoadState = new WeakMap();

const classIn = (...classes) => ['in', ['get', 'class'], ['literal', classes]];
const typeIn = (...types) => ['in', ['get', 'type'], ['literal', types]];
const nearlyEqual = (a, b, epsilon = 0.000001) => Math.abs(a - b) < epsilon;
const emptyHomePinCollection = () => ({ type: 'FeatureCollection', features: [] });
const emptyLandmarkCollection = () => ({ type: 'FeatureCollection', features: [] });
const emptyCustomPinCollection = () => ({ type: 'FeatureCollection', features: [] });
const getPinImageId = (iconId) => `pin-${iconId}`;
const normalizePinIconId = (iconId) => (PIN_ICON_URLS[iconId] ? iconId : 'custom');

const pointDistance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

const distanceToSegment = (point, start, end) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSq = dx * dx + dy * dy;

  if (!lengthSq) return pointDistance(point, start);

  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSq));
  return pointDistance(point, { x: start.x + t * dx, y: start.y + t * dy });
};

const flattenLineCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length === 0) return [];
  if (typeof coordinates[0]?.[0] === 'number') return [coordinates];
  return coordinates.flatMap(flattenLineCoordinates);
};

const classifyLandmark = (properties = {}) => {
  const searchable = Object.values(properties)
    .filter((value) => typeof value === 'string' || typeof value === 'number')
    .join(' ')
    .toLowerCase();

  if (!searchable || searchable.includes('parking')) return null;

  const match = LANDMARK_TYPES.find(({ tests }) => tests.some((test) => searchable.includes(test)));
  if (!match) return null;

  return {
    type: match.type,
    priority: match.priority,
    name: properties.name_en || properties.name || properties.name_script || properties.name_local || '',
  };
};

const ensurePinImages = (map, iconIds, onLoad) => {
  if (!map) return;

  let loadingImages = mapImageLoadState.get(map);
  if (!loadingImages) {
    loadingImages = new Set();
    mapImageLoadState.set(map, loadingImages);
  }

  iconIds.forEach((iconId) => {
    const normalizedIconId = normalizePinIconId(iconId);
    const imageId = getPinImageId(normalizedIconId);
    if (map.hasImage(imageId) || loadingImages.has(imageId)) return;

    loadingImages.add(imageId);
    map.loadImage(PIN_ICON_URLS[normalizedIconId], (error, image) => {
      loadingImages.delete(imageId);
      if (error || !image) {
        console.warn(`Failed to load map pin icon: ${normalizedIconId}`, error);
        return;
      }
      if (!map.hasImage(imageId)) map.addImage(imageId, image);
      onLoad?.();
    });
  });
};

const MatMapView = ({
  center,
  zoom,
  matSize,
  rotation,
  showStreetNames = true,
  showLandmarks = true,
  showLandmarkNames = true,
  homePinCoordinates,
  customPins = [],
  onCustomPinChange,
  onMapReady,
  onFrameChange,
  onCameraChange,
  safeInsets = { top: 0, right: 0 },
}) => {
  const wrapperRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const customPinMarkersRef = useRef(new Map());
  const customPinsRef = useRef(customPins);
  const latestViewRef = useRef({ center, zoom, rotation });
  const onCameraChangeRef = useRef(onCameraChange);
  const onCustomPinChangeRef = useRef(onCustomPinChange);
  const landmarkUpdateTimeoutRef = useRef(null);
  const customPinSyncTimeoutRef = useRef(null);
  const [mapUnavailable, setMapUnavailable] = useState(false);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [customPinScreenPositions, setCustomPinScreenPositions] = useState([]);

  useLayoutEffect(() => {
    latestViewRef.current = { center, zoom, rotation };
  }, [center, zoom, rotation]);

  useLayoutEffect(() => {
    onCameraChangeRef.current = onCameraChange;
  }, [onCameraChange]);

  useLayoutEffect(() => {
    onCustomPinChangeRef.current = onCustomPinChange;
  }, [onCustomPinChange]);

  useLayoutEffect(() => {
    customPinsRef.current = customPins;
  }, [customPins]);

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

  // Compute mat frame pixel dimensions centered within the UI-safe zone.
  const getFrame = () => {
    const { w: cw, h: ch } = containerSize;
    if (cw === 0 || ch === 0) return null;

    const spec = MAT_INCHES[matSize.name] || MAT_INCHES.Medium;
    const largeSpec = MAT_INCHES.Large;

    // Available viewport after subtracting address bar (top) and sidebar (right)
    const safeW = cw - safeInsets.right;
    const safeH = ch - safeInsets.top;

    const ppi = Math.min((safeW * MAT_FRAME_FILL) / largeSpec.w, (safeH * MAT_FRAME_FILL) / largeSpec.h);

    const fw = spec.w * ppi;
    const fh = spec.h * ppi;

    // Center within the safe zone
    const fl = (safeW - fw) / 2;
    const ft = safeInsets.top + (safeH - fh) / 2;

    return { fw, fh, fl, ft, fr: fl + fw, fb: ft + fh };
  };

  const frame = getFrame();

  // Notify parent of frame pixel dimensions + position so crop logic stays in sync
  useEffect(() => {
    if (!onFrameChange || !frame) return;
    onFrameChange({ width: frame.fw, height: frame.fh, x: frame.fl, y: frame.ft });
  }, [frame?.fw, frame?.fh, frame?.fl, frame?.ft]); // eslint-disable-line react-hooks/exhaustive-deps

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
      'pastel-road-local-centerline',
      'pastel-road-service-casing',
      'pastel-road-service-base',
      'pastel-road-service-centerline',
      'pastel-road-major-labels',
      'pastel-road-medium-labels',
      'pastel-road-local-labels',
      'pastel-road-service-labels',
      HOME_PIN_LAYER_ID,
      LANDMARK_LAYER_ID,
      CUSTOM_PIN_LAYER_ID,
    ];

    layerIds.forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
  };

  const getPinIconScale = () => {
    if (!frame) return 38 / PIN_ICON_IMAGE_HEIGHT;
    const spec = MAT_INCHES[matSize.name] || MAT_INCHES.Medium;
    const pixelsPerInch = frame.fw / spec.w;
    const targetHeight = Math.min(Math.max(pixelsPerInch * 2.2, 34), 58);
    return targetHeight / PIN_ICON_IMAGE_HEIGHT;
  };

  const getRoadLayerIds = () => [
    'pastel-road-major-casing',
    'pastel-road-major-base',
    'pastel-road-medium-casing',
    'pastel-road-medium-base',
    'pastel-road-local-casing',
    'pastel-road-local-base',
    'pastel-road-service-casing',
    'pastel-road-service-base',
  ].filter((id) => mapRef.current?.getLayer(id));

  const updateHomePinSource = () => {
    const source = mapRef.current?.getSource(HOME_PIN_SOURCE_ID);
    if (!source?.setData) return;

    if (!Array.isArray(homePinCoordinates)) {
      source.setData(emptyHomePinCollection());
      return;
    }

    source.setData({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: homePinCoordinates,
          },
          properties: {},
        },
      ],
    });
  };

  const ensureHomePinLayer = () => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    ensurePinImages(map, ['home'], updateHomePinSource);

    if (!map.getSource(HOME_PIN_SOURCE_ID)) {
      map.addSource(HOME_PIN_SOURCE_ID, {
        type: 'geojson',
        data: emptyHomePinCollection(),
      });
    }

    if (!map.getLayer(HOME_PIN_LAYER_ID)) {
      map.addLayer({
        id: HOME_PIN_LAYER_ID,
        type: 'symbol',
        source: HOME_PIN_SOURCE_ID,
        layout: {
          'symbol-placement': 'point',
          'icon-image': getPinImageId('home'),
          'icon-size': getPinIconScale(),
          'icon-anchor': 'bottom',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      });
    } else {
      map.setLayoutProperty(HOME_PIN_LAYER_ID, 'icon-size', getPinIconScale());
    }
  };

  const ensureLandmarkLayer = () => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    ensurePinImages(map, Object.values(LANDMARK_ICON_TYPES), () => scheduleLandmarkUpdate(0));

    if (!map.getSource(LANDMARK_SOURCE_ID)) {
      map.addSource(LANDMARK_SOURCE_ID, {
        type: 'geojson',
        data: emptyLandmarkCollection(),
      });
    }

    if (!map.getLayer(LANDMARK_LAYER_ID)) {
      map.addLayer({
        id: LANDMARK_LAYER_ID,
        type: 'symbol',
        source: LANDMARK_SOURCE_ID,
        layout: {
          'symbol-placement': 'point',
          'symbol-sort-key': ['get', 'sortKey'],
          'icon-image': ['concat', 'pin-', ['get', 'iconId']],
          'icon-size': getPinIconScale(),
          'icon-anchor': 'bottom',
          'icon-allow-overlap': false,
          'icon-ignore-placement': false,
          'icon-padding': 12,
          'text-field': showLandmarkNames ? ['get', 'label'] : '',
          'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
          'text-size': 11,
          'text-offset': [0, 0.45],
          'text-anchor': 'top',
          'text-max-width': 14,
          'text-allow-overlap': false,
          'text-ignore-placement': false,
          'text-padding': 4,
        },
        paint: {
          'text-color': '#212b3a',
          'text-halo-color': '#FFFFFF',
          'text-halo-width': 1.8,
          'text-halo-blur': 0.2,
        },
      });
    } else {
      map.setLayoutProperty(LANDMARK_LAYER_ID, 'icon-size', getPinIconScale());
      map.setLayoutProperty(LANDMARK_LAYER_ID, 'text-field', showLandmarkNames ? ['get', 'label'] : '');
      map.setLayoutProperty(LANDMARK_LAYER_ID, 'text-max-width', 14);
    }
  };

  const clearLandmarks = () => {
    const source = mapRef.current?.getSource(LANDMARK_SOURCE_ID);
    if (source?.setData) source.setData(emptyLandmarkCollection());
  };

  const ensureCustomPinLayer = () => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    ensurePinImages(map, PIN_ICON_IDS, updateCustomPinSource);

    if (!map.getSource(CUSTOM_PIN_SOURCE_ID)) {
      map.addSource(CUSTOM_PIN_SOURCE_ID, {
        type: 'geojson',
        data: emptyCustomPinCollection(),
      });
    }

    if (!map.getLayer(CUSTOM_PIN_LAYER_ID)) {
      map.addLayer({
        id: CUSTOM_PIN_LAYER_ID,
        type: 'symbol',
        source: CUSTOM_PIN_SOURCE_ID,
        layout: {
          'visibility': 'none',
          'icon-image': ['concat', 'pin-', ['get', 'iconId']],
          'icon-size': getPinIconScale(),
          'icon-anchor': 'bottom',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          'text-field': ['get', 'label'],
          'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
          'text-size': 11,
          'text-anchor': 'top',
          'text-offset': [0, 0.45],
          'text-max-width': 14,
          'text-allow-overlap': false,
          'text-ignore-placement': false,
          'text-padding': 4,
        },
        paint: {
          'text-color': '#212b3a',
          'text-halo-color': '#FFFFFF',
          'text-halo-width': 1.8,
          'text-halo-blur': 0.2,
        },
      });
    }

    if (map.getLayer(CUSTOM_PIN_LAYER_ID)) {
      map.moveLayer(CUSTOM_PIN_LAYER_ID);
      map.setLayoutProperty(CUSTOM_PIN_LAYER_ID, 'icon-size', getPinIconScale());
      map.setLayoutProperty(CUSTOM_PIN_LAYER_ID, 'visibility', 'none');
    }
  };

  const updateCustomPinSource = () => {
    const source = mapRef.current?.getSource(CUSTOM_PIN_SOURCE_ID);
    if (!source?.setData) return;
    const pins = customPinsRef.current;

    source.setData({
      type: 'FeatureCollection',
      features: pins
        .filter((pin) => Array.isArray(pin.coordinates))
        .map((pin) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: pin.coordinates,
          },
          properties: {
            label: pin.description || '',
            iconId: normalizePinIconId(pin.iconId),
          },
        })),
    });
  };

  const updateCustomPinScreenPositions = () => {
    const map = mapRef.current;
    if (!map) return;
    const pins = customPinsRef.current;

    setCustomPinScreenPositions(
      pins
        .filter((pin) => Array.isArray(pin.coordinates))
        .map((pin, index) => {
          const point = map.project(pin.coordinates);
          return {
            id: pin.id || `pin-${index}`,
            x: point.x,
            y: point.y,
            description: pin.description || '',
            iconId: normalizePinIconId(pin.iconId),
          };
        })
    );
  };

  const syncCustomPinMarker = (attempt = 0) => {
    const map = mapRef.current;
    if (!map) return;

    if (!map.isStyleLoaded()) {
      if (attempt < 30) {
        window.clearTimeout(customPinSyncTimeoutRef.current);
        customPinSyncTimeoutRef.current = window.setTimeout(() => syncCustomPinMarker(attempt + 1), 100);
      }
      return;
    }

    ensureCustomPinLayer();
    updateCustomPinSource();
    updateCustomPinScreenPositions();

    customPinMarkersRef.current.forEach((marker) => marker.remove());
    customPinMarkersRef.current.clear();
  };

  const beginCustomPinDrag = (pinId, event) => {
    const map = mapRef.current;
    const wrapper = wrapperRef.current;
    if (!map || !wrapper) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    map.dragPan.disable();

    const markerElement = event.currentTarget;
    let latestPoint = { x: event.clientX, y: event.clientY };
    let animationFrame = null;

    markerElement.classList.add('is-dragging');

    const renderDragPosition = () => {
      const rect = wrapper.getBoundingClientRect();
      markerElement.style.left = `${latestPoint.x - rect.left}px`;
      markerElement.style.top = `${latestPoint.y - rect.top}px`;
      animationFrame = null;
    };

    const movePin = (pointerEvent) => {
      latestPoint = { x: pointerEvent.clientX, y: pointerEvent.clientY };
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(renderDragPosition);
      }
    };

    const stopDrag = () => {
      window.removeEventListener('pointermove', movePin);
      window.removeEventListener('pointerup', stopDrag);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      markerElement.classList.remove('is-dragging');
      map.dragPan.enable();

      const rect = wrapper.getBoundingClientRect();
      const point = {
        x: latestPoint.x - rect.left,
        y: latestPoint.y - rect.top,
      };
      const lngLat = map.unproject(point);
      setCustomPinScreenPositions((pins) => pins.map((pin) => (
        pin.id === pinId ? { ...pin, x: point.x, y: point.y } : pin
      )));
      onCustomPinChangeRef.current?.(pinId, {
        coordinates: [lngLat.lng, lngLat.lat],
      });
    };

    window.addEventListener('pointermove', movePin);
    window.addEventListener('pointerup', stopDrag, { once: true });
  };

  const isInsideFrame = ({ x, y }, padding = 0) => (
    frame &&
    x >= frame.fl + padding &&
    x <= frame.fr - padding &&
    y >= frame.ft + padding &&
    y <= frame.fb - padding
  );

  const isAwayFromRoads = (point, roadLines, roadBuffer) => roadLines.every((line) => {
    for (let index = 1; index < line.length; index += 1) {
      if (distanceToSegment(point, line[index - 1], line[index]) <= roadBuffer) return false;
    }
    return true;
  });

  const getRoadLines = () => {
    const map = mapRef.current;
    if (!map || !frame) return [];

    const roadFeatures = map.queryRenderedFeatures(
      [[frame.fl, frame.ft], [frame.fr, frame.fb]],
      { layers: getRoadLayerIds() }
    );

    return roadFeatures.flatMap((feature) => (
      flattenLineCoordinates(feature.geometry?.coordinates)
        .map((line) => line.map((coordinate) => {
          const projected = map.project(coordinate);
          return { x: projected.x, y: projected.y };
        }))
        .filter((line) => line.length > 1)
    ));
  };

  const findSafeLandmarkPoint = (coordinate, roadLines, roadBuffer, iconPadding) => {
    const map = mapRef.current;
    if (!map || !frame) return null;

    const origin = map.project(coordinate);
    const step = Math.max(iconPadding * 1.05, roadBuffer * 0.85);
    const offsets = [
      [0, 0],
      [0, -step],
      [step, 0],
      [0, step],
      [-step, 0],
      [step * 0.78, -step * 0.78],
      [step * 0.78, step * 0.78],
      [-step * 0.78, step * 0.78],
      [-step * 0.78, -step * 0.78],
      [0, -step * 1.7],
      [step * 1.7, 0],
      [0, step * 1.7],
      [-step * 1.7, 0],
    ];

    for (const [offsetX, offsetY] of offsets) {
      const candidate = { x: origin.x + offsetX, y: origin.y + offsetY };
      if (!isInsideFrame(candidate, iconPadding)) continue;
      if (!isAwayFromRoads(candidate, roadLines, roadBuffer)) continue;
      const lngLat = map.unproject(candidate);
      return [lngLat.lng, lngLat.lat];
    }

    return null;
  };

  const updateLandmarks = () => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getSource('composite') || !frame) return;

    ensureLandmarkLayer();

    if (!showLandmarks) {
      clearLandmarks();
      return;
    }

    const roadWidth = getRoadWidth();
    if (!roadWidth) return;

    let sourceFeatures = [];
    try {
      sourceFeatures = map.querySourceFeatures('composite', { sourceLayer: 'poi_label' });
    } catch (error) {
      console.warn('Landmark discovery failed.', error);
      clearLandmarks();
      return;
    }

    const iconPixelSize = PIN_ICON_IMAGE_HEIGHT * getPinIconScale();
    const iconPadding = Math.max(iconPixelSize * 0.52, 18);
    const roadBuffer = Math.max(roadWidth.street * ROAD_CASING_SCALE * 0.5 + iconPadding * 0.7, 22);
    const roadLines = getRoadLines();
    const mapCenterPoint = map.project(center);
    const seen = new Set();
    const candidates = sourceFeatures
      .map((feature) => {
        const classification = classifyLandmark(feature.properties);
        const coordinate = feature.geometry?.type === 'Point' ? feature.geometry.coordinates : null;
        if (!classification || !Array.isArray(coordinate)) return null;

        const projected = map.project(coordinate);
        if (!isInsideFrame(projected, 0)) return null;

        const name = String(classification.name || classification.type).trim();
        const key = `${classification.type}:${name.toLowerCase()}:${coordinate.map((value) => Number(value).toFixed(4)).join(',')}`;
        if (seen.has(key)) return null;
        seen.add(key);

        return {
          coordinate,
          label: name,
          type: classification.type,
          priority: classification.priority,
          distance: pointDistance(projected, mapCenterPoint),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.priority - a.priority || a.distance - b.distance);

    const placed = [];

    for (const candidate of candidates) {
      const displayCoordinate = findSafeLandmarkPoint(candidate.coordinate, roadLines, roadBuffer, iconPadding);
      if (!displayCoordinate) continue;

      const displayPoint = map.project(displayCoordinate);
      const collidesWithPlaced = placed.some((feature) => pointDistance(displayPoint, feature.properties.screenPoint) < iconPadding * 1.45);
      if (collidesWithPlaced) continue;

      placed.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: displayCoordinate,
        },
        properties: {
          landmarkType: candidate.type,
          iconId: LANDMARK_ICON_TYPES[candidate.type],
          label: candidate.label,
          sortKey: 100 - candidate.priority,
          screenPoint: displayPoint,
        },
      });
    }

    const publicFeatures = placed.map(({ properties, ...feature }) => ({
      ...feature,
      properties: {
        landmarkType: properties.landmarkType,
        iconId: properties.iconId,
        label: properties.label,
        sortKey: properties.sortKey,
      },
    }));

    map.getSource(LANDMARK_SOURCE_ID)?.setData({
      type: 'FeatureCollection',
      features: publicFeatures,
    });
  };

  const scheduleLandmarkUpdate = (delay = 120) => {
    window.clearTimeout(landmarkUpdateTimeoutRef.current);
    landmarkUpdateTimeoutRef.current = window.setTimeout(updateLandmarks, delay);
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
    roadGroups.forEach(addCenterline);

    if (showStreetNames) {
      const addRoadLabels = ({ id, filter, minzoom, width, spacing = 160 }) => {
        const textSize = Math.min(Math.max(width * ROAD_CASING_SCALE * 0.42, 5), 22);
        const textMaskWidth = Math.max(textSize * 0.18, 0.8);

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

    ensureHomePinLayer();
    updateHomePinSource();
    ensureLandmarkLayer();
    ensureCustomPinLayer();
    updateCustomPinSource();
    syncCustomPinMarker();
    scheduleLandmarkUpdate();
  }

  const applyPastelMatStyleWhenReady = (attempt = 0) => {
    const map = mapRef.current;
    if (!map) return;

    if (map.isStyleLoaded() && map.getSource('composite')) {
      applyPastelMatStyle();
      return;
    }

    if (attempt < 30) {
      window.setTimeout(() => applyPastelMatStyleWhenReady(attempt + 1), 100);
    }
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
          minPitch: 0,
          maxPitch: 0,
          pitchWithRotate: false,
          touchPitch: false,
          bearing: 0,
          dragPan: true,
          dragRotate: true,
          touchZoomRotate: true,
          cooperativeGestures: false,
          preserveDrawingBuffer: true,
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        queueMicrotask(() => setMapUnavailable(true));
        return;
      }

      mapRef.current.addControl(
        new mapboxgl.NavigationControl({ showCompass: true, showZoom: true }),
        'bottom-left'
      );

      mapRef.current.on('load', () => {
        mapRef.current.setCooperativeGestures(false);
        mapRef.current.dragPan.enable();
        mapRef.current.touchZoomRotate.enable();
        mapRef.current.touchZoomRotate.enableRotation();
        mapRef.current.getCanvas().style.touchAction = 'none';
        mapRef.current.getCanvasContainer().style.touchAction = 'none';

        const latestView = latestViewRef.current;
        mapRef.current.jumpTo({
          center: latestView.center,
          zoom: latestView.zoom,
          bearing: latestView.rotation || 0,
        });
        applyPastelMatStyleWhenReady();
        syncCustomPinMarker();
        mapRef.current.once('idle', () => {
          scheduleLandmarkUpdate(0);
          syncCustomPinMarker();
        });
        if (onMapReady) onMapReady(mapRef.current);
      });

      mapRef.current.on('moveend', () => {
        const map = mapRef.current;
        const handleCameraChange = onCameraChangeRef.current;
        if (!map || !handleCameraChange) return;

        const center = map.getCenter();
        handleCameraChange({
          center: [center.lng, center.lat],
          zoom: map.getZoom(),
          rotation: map.getBearing(),
        });
        scheduleLandmarkUpdate(180);
        map.once('idle', () => {
          scheduleLandmarkUpdate(0);
          syncCustomPinMarker();
        });
      });

      let customPinMoveFrame = null;
      mapRef.current.on('move', () => {
        if (customPinMoveFrame) return;
        customPinMoveFrame = window.requestAnimationFrame(() => {
          customPinMoveFrame = null;
          updateCustomPinScreenPositions();
        });
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
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;

    const currentCenter = map.getCenter();
    const isAlreadyAtCamera =
      nearlyEqual(currentCenter.lng, center[0]) &&
      nearlyEqual(currentCenter.lat, center[1]) &&
      nearlyEqual(map.getZoom(), zoom, 0.0001);

    if (isAlreadyAtCamera) return;

    map.flyTo({ center, zoom, essential: true });
  }, [center, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    if (nearlyEqual(map.getBearing(), rotation, 0.01)) return;

    map.rotateTo(rotation, { duration: 300 });
  }, [rotation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    applyPastelMatStyleWhenReady();
  }, [containerSize.w, containerSize.h, matSize, showStreetNames, showLandmarks, showLandmarkNames, homePinCoordinates]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    ensureHomePinLayer();
    updateHomePinSource();
  }, [homePinCoordinates]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    syncCustomPinMarker();
  }, [customPins]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => {
    window.clearTimeout(landmarkUpdateTimeoutRef.current);
    window.clearTimeout(customPinSyncTimeoutRef.current);
    customPinMarkersRef.current.forEach((marker) => marker.remove());
    customPinMarkersRef.current.clear();
  }, []);

  const OVERLAY = 'rgba(20, 27, 41, 0.46)';
  return (
    <div
      ref={wrapperRef}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
    >
      {/* Map canvas */}
      {!mapUnavailable ? (
        <div
          ref={mapContainerRef}
          style={{
            position: 'absolute',
            inset: 0,
            touchAction: 'none',
            userSelect: 'none',
          }}
        />
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

      {!mapUnavailable && customPinScreenPositions.map((pin) => (
        <button
          key={pin.id}
          type="button"
          className="custom-pin-overlay-marker"
          style={{
            left: pin.x,
            top: pin.y,
          }}
          aria-label="Drag custom pin"
          onPointerDown={(event) => beginCustomPinDrag(pin.id, event)}
        >
          <img
            src={PIN_ICON_URLS[normalizePinIconId(pin.iconId)]}
            alt=""
            aria-hidden="true"
            draggable="false"
          />
          {pin.description && <span>{pin.description}</span>}
        </button>
      ))}

      {/* Mat frame overlay */}
      {frame && (
        <>
          <svg
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          >
            <path
              d={`M0 0H${containerSize.w}V${containerSize.h}H0Z M${frame.fl + 18} ${frame.ft}H${frame.fr - 18}Q${frame.fr} ${frame.ft} ${frame.fr} ${frame.ft + 18}V${frame.fb - 18}Q${frame.fr} ${frame.fb} ${frame.fr - 18} ${frame.fb}H${frame.fl + 18}Q${frame.fl} ${frame.fb} ${frame.fl} ${frame.fb - 18}V${frame.ft + 18}Q${frame.fl} ${frame.ft} ${frame.fl + 18} ${frame.ft}Z`}
              fill={OVERLAY}
              fillRule="evenodd"
            />
          </svg>

          {/* Mat frame border */}
          <div
            style={{
              position: 'absolute',
              top: frame.ft,
              left: frame.fl,
              width: frame.fw,
              height: frame.fh,
              border: '2px solid rgba(255, 255, 255, 0.88)',
              borderRadius: '18px',
              boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.30), inset 0 0 0 1px rgba(0,0,0,0.12)',
              pointerEvents: 'none',
              zIndex: 6,
            }}
          />

          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: containerSize.w - frame.fr + Math.max(12, frame.fw * 0.035),
              bottom: containerSize.h - frame.fb + Math.max(12, frame.fw * 0.035),
              maxWidth: frame.fw - Math.max(24, frame.fw * 0.07),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: Math.max(3, frame.fw * 0.012),
              pointerEvents: 'none',
              zIndex: 7,
            }}
          >
            <img
              src={grandparentsPinIconUrl}
              alt=""
              style={{
                width: Math.max(14, Math.min(24, frame.fw / 22)),
                height: 'auto',
                flexShrink: 0,
                display: 'block',
              }}
            />
            <span
              style={{
                color: '#ffffff',
                fontFamily: "'Nunito', 'Quicksand', 'Poppins', 'DM Sans', sans-serif",
                fontSize: Math.max(12, Math.min(20, frame.fw / 27)),
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              hometown play mats
            </span>
          </div>

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
