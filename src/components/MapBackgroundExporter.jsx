import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './MapBackgroundExporter.css';

const EXPORT_WIDTH = 5120;
const EXPORT_HEIGHT = 2880;
const PREVIEW_WIDTH = 1180;
const PREVIEW_HEIGHT = Math.round((PREVIEW_WIDTH * EXPORT_HEIGHT) / EXPORT_WIDTH);
const EXPORT_ZOOM_DELTA = Math.log2(EXPORT_WIDTH / PREVIEW_WIDTH);
const DEFAULT_CENTER = [-79.7990, 43.3255];
const DEFAULT_ZOOM = 15.25;
const DEFAULT_BEARING = -18;
const DEFAULT_PITCH = 0;
const DEFAULT_STYLE = import.meta.env.VITE_MAPBOX_BACKGROUND_STYLE || 'mapbox://styles/mapbox/streets-v12';
const HAS_MAPBOX_TOKEN = Boolean(import.meta.env.VITE_MAPBOX_TOKEN);
const INITIAL_STATUS = HAS_MAPBOX_TOKEN
  ? 'Preparing export map...'
  : 'Missing VITE_MAPBOX_TOKEN. Add your Mapbox token to .env, then reload this page.';
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
const EXPORT_ROAD_WIDTH = 26;

const waitForIdle = (map) => new Promise((resolve) => {
  let settled = false;
  const finish = () => {
    if (settled) return;
    settled = true;
    window.requestAnimationFrame(() => window.requestAnimationFrame(resolve));
  };

  map.once('idle', finish);
  window.setTimeout(finish, 3000);
});

const createHiddenExportContainer = () => {
  const container = document.createElement('div');
  container.setAttribute('aria-hidden', 'true');
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';
  container.style.width = `${EXPORT_WIDTH}px`;
  container.style.height = `${EXPORT_HEIGHT}px`;
  container.style.pointerEvents = 'none';
  document.body.appendChild(container);
  return container;
};

const getInitialSettings = () => {
  const defaults = {
    style: DEFAULT_STYLE,
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    bearing: DEFAULT_BEARING,
    pitch: DEFAULT_PITCH,
  };

  if (typeof window === 'undefined') return defaults;

  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('style') || params.get('url');
  const fromStorage = window.localStorage.getItem('hpm-map-background-url');
  const parsed = parseMapboxCreatorUrl(fromQuery || fromStorage || DEFAULT_STYLE);
  return { ...defaults, ...parsed };
};

const parseMapboxCreatorUrl = (rawValue) => {
  const raw = `${rawValue || ''}`.trim();
  if (!raw) return { style: DEFAULT_STYLE };

  if (raw.startsWith('mapbox://styles/')) {
    return { style: raw };
  }

  try {
    const url = new URL(raw);
    const staticMatch = url.pathname.match(/\/styles\/v1\/([^/]+)\/([^/]+)\/static\/([^/]+)\/(\d+)x(\d+)/);
    const styleMatch = url.pathname.match(/\/styles\/v1\/([^/]+)\/([^/?]+)/);

    if (staticMatch) {
      const [, username, styleId, camera] = staticMatch;
      const parsed = {
        style: `mapbox://styles/${username}/${styleId}`,
      };

      if (camera !== 'auto') {
        const cameraParts = camera.split(',').map(Number);
        const [lng, lat, zoom, bearing = DEFAULT_BEARING, pitch = DEFAULT_PITCH] = cameraParts;

        if ([lng, lat, zoom].every(Number.isFinite)) {
          parsed.center = [lng, lat];
          parsed.zoom = zoom;
          parsed.bearing = Number.isFinite(bearing) ? bearing : DEFAULT_BEARING;
          parsed.pitch = Number.isFinite(pitch) ? pitch : DEFAULT_PITCH;
        }
      }

      return parsed;
    }

    if (styleMatch) {
      const [, username, styleId] = styleMatch;
      return { style: `mapbox://styles/${username}/${styleId}` };
    }
  } catch {
    return { style: raw };
  }

  return { style: raw };
};

const normalizeNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const classIn = (...classes) => ['in', ['get', 'class'], ['literal', classes]];
const typeIn = (...types) => ['in', ['get', 'type'], ['literal', types]];

const hideBaseLayers = (map) => {
  const style = map.getStyle();
  style?.layers?.forEach((layer) => {
    if (map.getLayer(layer.id)) {
      map.setLayoutProperty(layer.id, 'visibility', 'none');
    }
  });
};

const addLayerIfPossible = (map, layer) => {
  if (map.getLayer(layer.id)) map.removeLayer(layer.id);
  map.addLayer(layer);
};

const applyPastelMatStyle = (map, roadWidth = EXPORT_ROAD_WIDTH) => {
  if (!map?.isStyleLoaded() || !map.getSource('composite')) return false;

  hideBaseLayers(map);

  addLayerIfPossible(map, {
    id: 'export-pastel-background',
    type: 'background',
    paint: { 'background-color': MAP_PALETTE.parks },
  });

  addLayerIfPossible(map, {
    id: 'export-pastel-park',
    type: 'fill',
    source: 'composite',
    'source-layer': 'landuse',
    filter: classIn('park', 'grass', 'pitch', 'cemetery', 'recreation_ground'),
    paint: { 'fill-color': MAP_PALETTE.parks, 'fill-opacity': 1 },
  });

  addLayerIfPossible(map, {
    id: 'export-pastel-forest',
    type: 'fill',
    source: 'composite',
    'source-layer': 'landuse',
    filter: classIn('wood', 'forest', 'scrub'),
    paint: { 'fill-color': MAP_PALETTE.forests, 'fill-opacity': 0.95 },
  });

  addLayerIfPossible(map, {
    id: 'export-pastel-forest-outline',
    type: 'line',
    source: 'composite',
    'source-layer': 'landuse',
    filter: classIn('wood', 'forest', 'scrub'),
    paint: { 'line-color': MAP_PALETTE.forestOutline, 'line-width': 1, 'line-opacity': 0.45 },
  });

  addLayerIfPossible(map, {
    id: 'export-pastel-water',
    type: 'fill',
    source: 'composite',
    'source-layer': 'water',
    paint: { 'fill-color': MAP_PALETTE.water, 'fill-opacity': 1 },
  });

  addLayerIfPossible(map, {
    id: 'export-pastel-water-outline',
    type: 'line',
    source: 'composite',
    'source-layer': 'water',
    paint: { 'line-color': MAP_PALETTE.waterOutline, 'line-width': 1, 'line-opacity': 0.4 },
  });

  addLayerIfPossible(map, {
    id: 'export-pastel-buildings',
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

  const roadGroups = [
    { id: 'major', filter: majorRoadFilter, minzoom: ROAD_ZOOM_SCALE.major, width: roadWidth },
    { id: 'medium', filter: mediumRoadFilter, minzoom: ROAD_ZOOM_SCALE.medium, width: roadWidth },
    { id: 'local', filter: localRoadFilter, minzoom: ROAD_ZOOM_SCALE.local, width: roadWidth },
    { id: 'service', filter: serviceRoadFilter, minzoom: ROAD_ZOOM_SCALE.service, width: roadWidth },
  ];

  roadGroups.forEach(({ id, filter, minzoom, width }) => {
    addLayerIfPossible(map, {
      id: `export-pastel-road-${id}-casing`,
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
  });

  roadGroups.forEach(({ id, filter, minzoom, width }) => {
    addLayerIfPossible(map, {
      id: `export-pastel-road-${id}-base`,
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      filter,
      minzoom,
      paint: { 'line-color': MAP_PALETTE.roads, 'line-width': width, 'line-opacity': 1 },
      layout: { 'line-join': 'round', 'line-cap': 'round' },
    });
  });

  roadGroups.forEach(({ id, filter, minzoom, width }) => {
    addLayerIfPossible(map, {
      id: `export-pastel-road-${id}-centerline`,
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
  });

  const addRoadLabels = ({ id, filter, minzoom, width, spacing = 160 }) => {
    const roadScale = width / EXPORT_ROAD_WIDTH;
    const textSize = Math.min(Math.max(width * ROAD_CASING_SCALE * 0.42, 5), 22 * roadScale);
    const textMaskWidth = Math.max(textSize * 0.18, 0.8);

    addLayerIfPossible(map, {
      id: `export-pastel-road-${id}-labels`,
      type: 'symbol',
      source: 'composite',
      'source-layer': 'road',
      filter: ['all', filter, ['has', 'name']],
      minzoom,
      layout: {
        'symbol-placement': 'line',
        'symbol-spacing': spacing * roadScale,
        'text-field': ['get', 'name'],
        'text-font': ['DIN Pro Regular', 'Arial Unicode MS Regular'],
        'text-size': textSize,
        'text-letter-spacing': 0.02,
        'text-rotation-alignment': 'map',
        'text-pitch-alignment': 'viewport',
        'text-keep-upright': true,
        'text-max-angle': 35,
        'text-padding': Math.max(1, roadScale),
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

  addRoadLabels({ id: 'major', filter: majorRoadFilter, minzoom: ROAD_ZOOM_SCALE.majorLabels, width: roadWidth });
  addRoadLabels({ id: 'medium', filter: mediumRoadFilter, minzoom: ROAD_ZOOM_SCALE.mediumLabels, width: roadWidth });
  addRoadLabels({ id: 'local', filter: localRoadFilter, minzoom: ROAD_ZOOM_SCALE.localLabels, width: roadWidth, spacing: 130 });
  addRoadLabels({ id: 'service', filter: serviceRoadFilter, minzoom: ROAD_ZOOM_SCALE.serviceLabels, width: roadWidth, spacing: 120 });

  return true;
};

const MapBackgroundExporter = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [settings, setSettings] = useState(getInitialSettings);
  const [styleInput, setStyleInput] = useState(() => settings.style);
  const [status, setStatus] = useState(INITIAL_STATUS);
  const [canDownload, setCanDownload] = useState(false);
  const [cameraValues, setCameraValues] = useState({
    center: settings.center,
    zoom: settings.zoom,
    bearing: settings.bearing,
    pitch: settings.pitch,
  });

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;

    if (!token || !mapContainerRef.current) {
      return undefined;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: settings.style,
      center: settings.center,
      zoom: settings.zoom,
      bearing: settings.bearing,
      pitch: settings.pitch,
      interactive: true,
      preserveDrawingBuffer: true,
      attributionControl: false,
      fadeDuration: 0,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');

    map.on('load', async () => {
      setStatus('Applying Hometown Play Mats styling to the selected map...');
      const styled = applyPastelMatStyle(map);
      await waitForIdle(map);
      setCanDownload(true);
      setStatus(styled
        ? 'Ready. The selected map crop is using the Hometown pastel mat styling.'
        : 'Ready, but the selected Mapbox style does not expose the vector sources needed for Hometown styling.'
      );
    });

    const syncCamera = () => {
      const center = map.getCenter();
      setCameraValues({
        center: [center.lng, center.lat],
        zoom: map.getZoom(),
        bearing: map.getBearing(),
        pitch: map.getPitch(),
      });
    };

    map.on('moveend', syncCamera);
    map.on('zoomend', syncCamera);
    map.on('rotateend', syncCamera);

    map.on('error', (event) => {
      console.error('Map background export error:', event.error || event);
      setStatus('Mapbox could not load that style. Check the URL, token permissions, and network connection.');
      setCanDownload(false);
    });

    return () => {
      map.remove();
      if (mapRef.current === map) mapRef.current = null;
    };
  }, [settings]);

  const applyCreatorUrl = () => {
    const nextSettings = {
      ...settings,
      ...parseMapboxCreatorUrl(styleInput),
    };

    window.localStorage.setItem('hpm-map-background-url', styleInput);
    setCanDownload(false);
    setStatus('Loading the selected Mapbox background...');
    setSettings(nextSettings);
  };

  const downloadPng = async () => {
    const previewMap = mapRef.current;
    if (!previewMap) return;

    const center = previewMap.getCenter();
    const exportCamera = {
      center: [center.lng, center.lat],
      zoom: previewMap.getZoom(),
      bearing: previewMap.getBearing(),
      pitch: previewMap.getPitch(),
    };
    let exportMap = null;
    const exportContainer = createHiddenExportContainer();

    try {
      setStatus('Rendering high-res PNG from the exact preview crop...');

      exportMap = new mapboxgl.Map({
        container: exportContainer,
        style: settings.style,
        center: exportCamera.center,
        zoom: exportCamera.zoom + EXPORT_ZOOM_DELTA,
        bearing: exportCamera.bearing,
        pitch: exportCamera.pitch,
        interactive: false,
        preserveDrawingBuffer: true,
        attributionControl: false,
        fadeDuration: 0,
      });

      await new Promise((resolve, reject) => {
        exportMap.once('load', resolve);
        exportMap.once('error', reject);
      });

      applyPastelMatStyle(exportMap);
      exportMap.resize();
      await waitForIdle(exportMap);

      const canvas = exportMap.getCanvas();
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));

      if (!blob) {
        setStatus('Could not create PNG. Try again after the map finishes loading.');
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'landing-map-background.png';
      link.click();
      URL.revokeObjectURL(url);
      setStatus('Downloaded landing-map-background.png from the exact preview crop.');
    } catch (error) {
      console.error('High-res map export failed:', error);
      setStatus('The high-res export failed. Try a slightly lower zoom or reload the exporter.');
    } finally {
      exportMap?.remove();
      exportContainer.remove();
    }
  };

  const updateCamera = (partialCamera) => {
    const nextSettings = { ...settings, ...partialCamera };
    setCanDownload(false);
    setStatus('Updating export crop...');
    setSettings(nextSettings);
    setCameraValues({
      center: nextSettings.center,
      zoom: nextSettings.zoom,
      bearing: nextSettings.bearing,
      pitch: nextSettings.pitch,
    });
  };

  return (
    <main className="map-export-page">
      <section className="map-export-panel">
        <div>
          <span>Map Background Export</span>
          <h1>Landing map background</h1>
          <p>
            Paste the Mapbox style URL or Static Images URL from the background creator.
            The preview frame is the exact crop that downloads, rendered high-res at
            {` ${EXPORT_WIDTH} x ${EXPORT_HEIGHT}`}.
          </p>
        </div>
        <button type="button" onClick={downloadPng} disabled={!canDownload}>
          Download PNG
        </button>
      </section>

      <section className="map-export-controls" aria-label="Map export settings">
        <label className="map-export-url-field">
          <span>Mapbox style or static image URL</span>
          <input
            type="text"
            value={styleInput}
            onChange={(event) => setStyleInput(event.target.value)}
            placeholder="mapbox://styles/username/style-id or a Mapbox Static Images URL"
          />
        </label>
        <button type="button" onClick={applyCreatorUrl}>
          Use This Background
        </button>
        <div className="map-export-camera">
          <label>
            <span>Longitude</span>
            <input
              type="number"
              value={Number(cameraValues.center[0].toFixed(6))}
              step="0.0001"
              onChange={(event) => updateCamera({
                center: [normalizeNumber(event.target.value, settings.center[0]), settings.center[1]],
              })}
            />
          </label>
          <label>
            <span>Latitude</span>
            <input
              type="number"
              value={Number(cameraValues.center[1].toFixed(6))}
              step="0.0001"
              onChange={(event) => updateCamera({
                center: [settings.center[0], normalizeNumber(event.target.value, settings.center[1])],
              })}
            />
          </label>
          <label>
            <span>Zoom</span>
            <input
              type="number"
              value={Number(cameraValues.zoom.toFixed(2))}
              step="0.05"
              onChange={(event) => updateCamera({ zoom: normalizeNumber(event.target.value, settings.zoom) })}
            />
          </label>
          <label>
            <span>Bearing</span>
            <input
              type="number"
              value={Number(cameraValues.bearing.toFixed(1))}
              step="1"
              onChange={(event) => updateCamera({ bearing: normalizeNumber(event.target.value, settings.bearing) })}
            />
          </label>
        </div>
      </section>

      <p className="map-export-status">{status}</p>

      <section className="map-export-preview-shell">
        <div className="map-export-preview">
          <div
            ref={mapContainerRef}
            className="map-export-canvas"
            style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
          />
        </div>
      </section>
    </main>
  );
};

export default MapBackgroundExporter;
