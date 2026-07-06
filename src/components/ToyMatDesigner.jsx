import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { saveMat, updateMat } from '../utils/matStorage';
import { addToCart, updateCartQuantity, removeFromCart } from '../utils/cartUtils';
import { isVerifiedAccount } from '../utils/authStatus';
import { getShopifyVariantId } from '../config/shopify';
import { MAT_SIZES } from '../utils/pricing';
import { joinLaunchWaitlistIfContactAvailable } from '../utils/waitlist';
import { useAppDialog } from '../hooks/useAppDialog';
import { getPrintPreviewPixelSize } from '../utils/matDimensions';
import MatSidebar from './MatSidebar';
import MatMapView from './MatMapView';
import MatPreview from './MatPreview';
import CartConfirmationModal from './cart/CartConfirmationModal';
import TourOverlay from './tour/TourOverlay';
import { TOUR_STEPS, TOUR_SEEN_STORAGE_KEY } from './tour/tourSteps';
import schoolPinIconUrl from '../../icons/school.png';
import parkPinIconUrl from '../../icons/park.png';
import playgroundPinIconUrl from '../../icons/playground.png';
import grandparentsPinIconUrl from '../../icons/grandparents.png';
import homePinIconUrl from '../../icons/home.png';
import customPinIconUrl from '../../icons/custom.png';

const DEFAULT_MAP_CENTER = [-79.7990, 43.3255];
const DEFAULT_MAT_SIZE = 'medium';
const CUSTOM_PIN_SOURCE_ID = 'pastel-custom-pin';
const CUSTOM_PIN_LAYER_ID = 'pastel-custom-pin-symbol';
const DEFAULT_CUSTOM_PIN_ICON_ID = 'custom';
const PIN_ICON_IMAGE_HEIGHT = 512;
const MAX_EXPORT_PIXEL_RATIO = 8;
const PIN_ICON_URLS = {
  school: schoolPinIconUrl,
  park: parkPinIconUrl,
  playground: playgroundPinIconUrl,
  grandparents: grandparentsPinIconUrl,
  home: homePinIconUrl,
  custom: customPinIconUrl,
};
const thumbnailPinImageCache = new Map();

const withTemporaryDevicePixelRatio = async (pixelRatio, callback) => {
  const descriptor = Object.getOwnPropertyDescriptor(window, 'devicePixelRatio');

  try {
    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      get: () => pixelRatio,
    });
  } catch (error) {
    console.warn('Unable to increase map export pixel ratio; using current screen pixel ratio.', error);
    return callback(false);
  }

  try {
    return await callback(true);
  } finally {
    if (descriptor) {
      Object.defineProperty(window, 'devicePixelRatio', descriptor);
    } else {
      delete window.devicePixelRatio;
    }
  }
};

const normalizeMapCenter = (value) => {
  if (!Array.isArray(value) || value.length < 2) {
    return DEFAULT_MAP_CENTER;
  }

  const lng = Number(value[0]);
  const lat = Number(value[1]);
  return Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : DEFAULT_MAP_CENTER;
};

const createCustomPinId = () => `pin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeCustomPin = (value, index = 0) => {
  if (!value?.coordinates) return null;
  const coordinates = normalizeMapCenter(value.coordinates);
  return {
    id: value.id || `saved-pin-${index}`,
    coordinates,
    address: value.address || '',
    description: value.description || value.label || '',
    iconId: value.iconId || DEFAULT_CUSTOM_PIN_ICON_ID,
  };
};

const normalizeCustomPins = (mat) => {
  const pins = Array.isArray(mat?.customPins)
    ? mat.customPins
    : mat?.customPin
      ? [mat.customPin]
      : [];

  return pins.map(normalizeCustomPin).filter(Boolean);
};

const normalizeMatSize = (value) => (value === 'large' || value === 'medium' ? value : DEFAULT_MAT_SIZE);

const ToyMatDesigner = () => {
  const { currentUser, ensureGuestSession } = useAuth();
  const dialog = useAppDialog();
  const location = useLocation();
  const navigate = useNavigate();

  const [matSize, setMatSize] = useState(DEFAULT_MAT_SIZE);
  const [rotation, setRotation] = useState(0);
  const [colorScheme, setColorScheme] = useState('pastel');
  const [mapCenter, setMapCenter] = useState([-79.7990, 43.3255]);
  const [mapZoom, setMapZoom] = useState(15);
  const [homePinCoordinates, setHomePinCoordinates] = useState(DEFAULT_MAP_CENTER);
  const [address, setAddress] = useState('123 Maple Avenue, Lincoln Park, Chicago');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [matName, setMatName] = useState('My Hometown Playmat');
  const [savedMatId, setSavedMatId] = useState(null);
  const [savedMatName, setSavedMatName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showStreetNames, setShowStreetNames] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [showLandmarkNames, setShowLandmarkNames] = useState(true);
  const [landmarkDensity, setLandmarkDensity] = useState('balanced');
  const [customPins, setCustomPins] = useState([]);
  const [customPinDraft, setCustomPinDraft] = useState(null);
  const [customPinAddress, setCustomPinAddress] = useState('');
  const [customPinDescription, setCustomPinDescription] = useState('');
  const [customPinIconId, setCustomPinIconId] = useState(DEFAULT_CUSTOM_PIN_ICON_ID);
  const [customPinSuggestions, setCustomPinSuggestions] = useState([]);
  const [showCustomPinSuggestions, setShowCustomPinSuggestions] = useState(false);
  const [customPinSearchTimeout, setCustomPinSearchTimeout] = useState(null);
  const [isPlacingCustomPin, setIsPlacingCustomPin] = useState(false);
  const [framePixels, setFramePixels] = useState(null);
  const [isMobileCustomizeOpen, setIsMobileCustomizeOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartConfirmation, setCartConfirmation] = useState(null);
  const [safeInsets, setSafeInsets] = useState({ top: 94, right: 310 });
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const tourOpenedMobileSheetRef = useRef(false);
  const isSignedIn = isVerifiedAccount(currentUser);

  const markTourSeen = () => {
    try {
      window.localStorage.setItem(TOUR_SEEN_STORAGE_KEY, '1');
    } catch {
      // localStorage unavailable (e.g. private browsing) — safe to ignore
    }
  };

  const closeTour = () => {
    markTourSeen();
    setIsTourActive(false);
    setTourStepIndex(0);
  };

  const handleReplayTour = () => {
    setTourStepIndex(0);
    setIsTourActive(true);
  };

  useEffect(() => {
    let hasSeenTour = true;
    try {
      hasSeenTour = window.localStorage.getItem(TOUR_SEEN_STORAGE_KEY) === '1';
    } catch {
      // localStorage unavailable — skip auto-tour rather than risk crashing
    }
    if (hasSeenTour) return undefined;
    const timeoutId = window.setTimeout(() => setIsTourActive(true), 600);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!isTourActive) return;
    const isMobileViewport = window.matchMedia('(max-width: 720px)').matches;
    if (!isMobileViewport) return;
    const stepNeedsSheet = Boolean(TOUR_STEPS[tourStepIndex]?.requiresMobileSheet);
    if (stepNeedsSheet && !isMobileCustomizeOpen) {
      setIsMobileCustomizeOpen(true);
      tourOpenedMobileSheetRef.current = true;
    } else if (!stepNeedsSheet && tourOpenedMobileSheetRef.current) {
      setIsMobileCustomizeOpen(false);
      tourOpenedMobileSheetRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTourActive, tourStepIndex]);

  useEffect(() => {
    if (!isTourActive && tourOpenedMobileSheetRef.current) {
      setIsMobileCustomizeOpen(false);
      tourOpenedMobileSheetRef.current = false;
    }
  }, [isTourActive]);

  useEffect(() => {
    const update = () => setSafeInsets(
      window.innerWidth <= 720
        ? { top: 94, right: 0 }
        : { top: 94, right: 310 }
    );
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const matSizes = Object.fromEntries(
    Object.entries(MAT_SIZES).map(([key, size]) => [
      key,
      { ...size, shopifyVariantId: getShopifyVariantId(key) }
    ])
  );

  const colorSchemes = {
    pastel: { color: '#2f7a36', name: 'Pastel Park', preview: '#b8ef9f' },
    modern: { color: '#6f8fcf', name: 'Modern Mini', preview: '#a9c0ee' },
    classic: { color: '#111827', name: 'Classic City', preview: '#3d4048' }
  };

  const canReadCart = Boolean(currentUser?.uid && (isSignedIn || currentUser.isAnonymous));

  const { data: cartItems } = useFirestore(
    canReadCart ? `users/${currentUser.uid}/cart` : null
  );

  const currentCartItem = savedMatId ? cartItems.find((item) => item.designId === savedMatId || item.matId === savedMatId) : null;
  const selectedSize = matSizes[matSize];
  const selectedTheme = colorSchemes[colorScheme];

  const normalizeCustomPinForSave = (pin) => {
    if (!pin?.coordinates) return null;

    return {
      id: pin.id || createCustomPinId(),
      coordinates: normalizeMapCenter(pin.coordinates),
      address: pin.address || '',
      description: pin.description || '',
      iconId: pin.iconId || DEFAULT_CUSTOM_PIN_ICON_ID,
    };
  };

  const getCustomPinDraftForSave = () => {
    if (!customPinDraft?.coordinates) return null;

    return normalizeCustomPinForSave({
      ...customPinDraft,
      description: customPinDescription.trim(),
      iconId: customPinDraft.iconId || customPinIconId || DEFAULT_CUSTOM_PIN_ICON_ID,
    });
  };

  const getCustomPinsForSave = () => {
    const savedPins = customPins.map(normalizeCustomPinForSave).filter(Boolean);
    const draftPin = getCustomPinDraftForSave();
    return draftPin ? [...savedPins, draftPin] : savedPins;
  };

  const commitCustomPinDraft = () => {
    const draftPin = getCustomPinDraftForSave();
    if (!draftPin) return;

    setCustomPins((pins) => [
      ...pins.map(normalizeCustomPinForSave).filter(Boolean),
      draftPin,
    ]);
    setCustomPinDraft(null);
    setCustomPinAddress('');
    setCustomPinDescription('');
    setCustomPinIconId(DEFAULT_CUSTOM_PIN_ICON_ID);
    setCustomPinSuggestions([]);
    setShowCustomPinSuggestions(false);
  };

  const withTimeout = (promise, message, timeoutMs = 15000) => {
    let timeoutId;
    const timeout = new Promise((_, reject) => {
      timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs);
    });

    return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timeoutId));
  };

  const getCurrentMapCamera = () => {
    if (!mapInstance) {
      return { mapCenter, mapZoom, rotation };
    }

    const center = mapInstance.getCenter();
    return {
      mapCenter: [center.lng, center.lat],
      mapZoom: mapInstance.getZoom(),
      rotation: mapInstance.getBearing(),
    };
  };

  const handleMapCameraChange = ({ center, zoom, rotation: nextRotation }) => {
    setMapCenter(center);
    setMapZoom(zoom);
    setRotation(nextRotation);
  };

  const fetchSuggestions = async (query) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      if (!token) return;
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&autocomplete=true&limit=5`);
      const data = await response.json();
      setSuggestions(data.features || []);
      setShowSuggestions((data.features || []).length > 0);
    } catch (error) {
      console.error('Autocomplete error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const fetchCustomPinSuggestions = async (query) => {
    if (!query.trim() || query.length < 3) {
      setCustomPinSuggestions([]);
      setShowCustomPinSuggestions(false);
      return;
    }

    try {
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      if (!token) return;
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&autocomplete=true&limit=5`);
      const data = await response.json();
      setCustomPinSuggestions(data.features || []);
      setShowCustomPinSuggestions((data.features || []).length > 0);
    } catch (error) {
      console.error('Custom pin autocomplete error:', error);
      setCustomPinSuggestions([]);
      setShowCustomPinSuggestions(false);
    }
  };

  const geocodeAddress = async (query, showErrors = true) => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) {
      if (showErrors) {
        dialog.alert('Mapbox token is missing. Add VITE_MAPBOX_TOKEN to .env to enable address search.', { title: 'Address search unavailable' });
      }
      return false;
    }

    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}`);
    const data = await response.json();

    if (data.features?.length > 0) {
      const [lng, lat] = data.features[0].center;
      setMapCenter([lng, lat]);
      setHomePinCoordinates([lng, lat]);
      setMapZoom(17);
      return true;
    }

    if (showErrors) {
      dialog.alert('Address not found. Please try a different address.', { title: 'Address not found' });
    }
    return false;
  };

  const geocodeToFeature = async (query) => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) {
      throw new Error('Mapbox token is missing. Add VITE_MAPBOX_TOKEN to .env to enable address search.');
    }

    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1`);
    const data = await response.json();
    const feature = data.features?.[0];
    if (!feature?.center) {
      throw new Error('Pin address not found. Please try a different address.');
    }
    return feature;
  };

  const handleAddressChange = (event) => {
    const value = event.target.value;
    setAddress(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => fetchSuggestions(value), 300));
  };

  const handleCustomPinAddressChange = (event) => {
    const value = event.target.value;
    setCustomPinAddress(value);
    if (customPinSearchTimeout) clearTimeout(customPinSearchTimeout);
    setCustomPinSearchTimeout(setTimeout(() => fetchCustomPinSuggestions(value), 300));
  };

  const handleCustomPinDescriptionChange = (value) => {
    setCustomPinDescription(value);
    setCustomPinDraft((draft) => (
      draft ? { ...draft, description: value.trim() } : draft
    ));
  };

  const handleCustomPinIconChange = (iconId) => {
    setCustomPinIconId(iconId);
    setCustomPinDraft((draft) => (
      draft ? { ...draft, iconId } : draft
    ));
  };

  const handleSelectSuggestion = (suggestion) => {
    const [lng, lat] = suggestion.center;
    setAddress(suggestion.place_name);
    setMapCenter([lng, lat]);
    setHomePinCoordinates([lng, lat]);
    setMapZoom(17);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSelectCustomPinSuggestion = (suggestion) => {
    setCustomPinAddress(suggestion.place_name);
    setCustomPinSuggestions([]);
    setShowCustomPinSuggestions(false);
  };

  const handleSearchAddress = async () => {
    if (!address.trim()) {
      dialog.alert('Please enter an address.', { title: 'Address required' });
      return;
    }
    setIsSearching(true);
    setShowSuggestions(false);
    try {
      await geocodeAddress(address);
    } catch (error) {
      console.error('Geocoding error:', error);
      dialog.alert('Error searching for address. Please try again.', { title: 'Search failed' });
    } finally {
      setIsSearching(false);
    }
  };

  const waitForMapRender = () => new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.requestAnimationFrame(() => window.requestAnimationFrame(resolve));
    };

    mapInstance.once?.('render', finish);
    mapInstance.once?.('idle', finish);
    mapInstance.triggerRepaint?.();
    window.setTimeout(finish, 350);
  });

  const waitForMapIdle = (map, timeoutMs = 2500) => new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.requestAnimationFrame(() => window.requestAnimationFrame(resolve));
    };

    map.once?.('idle', finish);
    map.once?.('render', () => window.setTimeout(finish, 120));
    window.setTimeout(finish, timeoutMs);
  });

  const ensureExportPinImages = async (map) => {
    await Promise.all(Object.entries(PIN_ICON_URLS).map(([iconId, iconUrl]) => (
      new Promise((resolve) => {
        const imageId = `pin-${iconId}`;
        if (map.hasImage?.(imageId)) {
          resolve();
          return;
        }

        map.loadImage(iconUrl, (error, image) => {
          if (!error && image && !map.hasImage(imageId)) {
            map.addImage(imageId, image);
          }
          resolve();
        });
      })
    )));
  };

  const drawWatermark = async (ctx, outputWidth, outputHeight) => {
    const watermarkText = 'hometown play mats';
    const fontSize = Math.round(Math.max(34, Math.min(120, outputWidth / 70)));
    const padding = Math.round(Math.max(16, outputWidth * 0.03));
    const iconSize = fontSize * 1.15;
    const iconTextGap = fontSize * 0.28;

    ctx.save();
    ctx.font = `800 ${fontSize}px "Nunito", "Quicksand", "Poppins", "DM Sans", sans-serif`;
    ctx.letterSpacing = `${(-0.02 * fontSize).toFixed(2)}px`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(watermarkText, outputWidth - padding, outputHeight - padding);

    try {
      const textWidth = ctx.measureText(watermarkText).width;
      const icon = await loadThumbnailPinImage('grandparents');
      const iconWidth = iconSize * (icon.width / icon.height);
      const iconX = outputWidth - padding - textWidth - iconTextGap - iconWidth;
      const iconY = outputHeight - padding - iconSize;
      ctx.drawImage(icon, iconX, iconY, iconWidth, iconSize);
    } catch (error) {
      console.warn('Watermark logo icon failed to draw.', error);
    }

    ctx.restore();
  };

  const syncCustomPinsForCanvasCapture = (pins) => {
    const source = mapInstance?.getSource?.(CUSTOM_PIN_SOURCE_ID);
    if (!source?.setData || !pins) return;

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
            iconId: pin.iconId || DEFAULT_CUSTOM_PIN_ICON_ID,
          },
        })),
    });
  };

  const loadThumbnailPinImage = (iconId) => {
    const normalizedIconId = PIN_ICON_URLS[iconId] ? iconId : DEFAULT_CUSTOM_PIN_ICON_ID;
    const cachedImage = thumbnailPinImageCache.get(normalizedIconId);
    if (cachedImage) return cachedImage;

    const imagePromise = new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = PIN_ICON_URLS[normalizedIconId];
    });

    thumbnailPinImageCache.set(normalizedIconId, imagePromise);
    return imagePromise;
  };

  const getThumbnailPinHeight = () => {
    if (!framePixels) return 38;
    const pixelsPerInch = framePixels.width / selectedSize.width / 12;
    return Math.min(Math.max(pixelsPerInch * 2.2, 34), 58);
  };

  const wrapCanvasText = (ctx, text, maxWidth) => {
    const words = text.trim().split(/\s+/);
    const lines = [];
    let line = '';

    words.forEach((word) => {
      const nextLine = line ? `${line} ${word}` : word;
      if (ctx.measureText(nextLine).width <= maxWidth || !line) {
        line = nextLine;
      } else {
        lines.push(line);
        line = word;
      }
    });

    if (line) lines.push(line);
    return lines.slice(0, 3);
  };

  const drawThumbnailCustomPins = async ({
    ctx,
    pins,
    cropX,
    cropY,
    pixelRatio,
    outputScale = 1
  }) => {
    if (!Array.isArray(pins) || pins.length === 0) return;

    const iconHeight = getThumbnailPinHeight() * pixelRatio * outputScale;
    const labelFontSize = 11 * pixelRatio * outputScale;
    const labelLineHeight = 13 * pixelRatio * outputScale;
    const labelMaxWidth = 154 * pixelRatio * outputScale;
    const outputPadding = 100 * pixelRatio * outputScale;

    for (const pin of pins) {
      if (!Array.isArray(pin.coordinates)) continue;

      const point = mapInstance.project(pin.coordinates);
      const x = (point.x * pixelRatio - cropX) * outputScale;
      const y = (point.y * pixelRatio - cropY) * outputScale;
      if (
        x < -outputPadding
        || y < -outputPadding
        || x > ctx.canvas.width + outputPadding
        || y > ctx.canvas.height + outputPadding
      ) continue;

      try {
        const image = await loadThumbnailPinImage(pin.iconId);
        const iconWidth = iconHeight * (image.width / image.height);
        ctx.drawImage(image, x - iconWidth / 2, y - iconHeight, iconWidth, iconHeight);
      } catch (error) {
        console.warn('Custom pin thumbnail icon failed to draw.', error);
      }

      const label = (pin.description || '').trim();
      if (!label) continue;

      ctx.save();
      ctx.font = `900 ${labelFontSize}px "Quicksand", "DM Sans", "Poppins", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4 * pixelRatio * outputScale;
      ctx.fillStyle = '#212b3a';

      const lines = wrapCanvasText(ctx, label, labelMaxWidth);
      lines.forEach((line, index) => {
        const textY = y + (5 * pixelRatio * outputScale) + index * labelLineHeight;
        ctx.strokeText(line, x, textY);
        ctx.fillText(line, x, textY);
      });

      ctx.restore();
    }
  };

  const captureHighDpiMapPreview = async ({ customPinsForCapture, targetPixelSize, dims }) => {
    syncCustomPinsForCanvasCapture(customPinsForCapture);

    const currentStyle = mapInstance.getStyle?.();
    if (!currentStyle) throw new Error('Map style is not ready for export.');

    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (token) mapboxgl.accessToken = token;

    const frameCenter = mapInstance.unproject([
      dims.x + dims.width / 2,
      dims.y + dims.height / 2,
    ]);
    const currentZoom = mapInstance.getZoom();
    const currentBearing = mapInstance.getBearing();
    const currentPitch = mapInstance.getPitch?.() || 0;
    const sourcePixelRatio = window.devicePixelRatio || 1;
    const exportPixelRatio = Math.min(
      MAX_EXPORT_PIXEL_RATIO,
      Math.max(sourcePixelRatio, targetPixelSize.width / dims.width)
    );
    const exportStyle = JSON.parse(JSON.stringify(currentStyle));
    const exportContainer = document.createElement('div');
    exportContainer.setAttribute('aria-hidden', 'true');
    exportContainer.style.position = 'fixed';
    exportContainer.style.left = '-10000px';
    exportContainer.style.top = '0';
    exportContainer.style.width = `${Math.round(dims.width)}px`;
    exportContainer.style.height = `${Math.round(dims.height)}px`;
    exportContainer.style.pointerEvents = 'none';
    exportContainer.style.opacity = '0';
    document.body.appendChild(exportContainer);

    let exportMap = null;

    try {
      const previewDataUrl = await withTemporaryDevicePixelRatio(exportPixelRatio, async () => {
        exportMap = new mapboxgl.Map({
          container: exportContainer,
          style: exportStyle,
          center: [frameCenter.lng, frameCenter.lat],
          zoom: currentZoom,
          bearing: currentBearing,
          pitch: currentPitch,
          interactive: false,
          attributionControl: false,
          preserveDrawingBuffer: true,
          fadeDuration: 0,
        });

        await new Promise((resolve, reject) => {
          exportMap.once('load', resolve);
          exportMap.once('error', reject);
        });

        await ensureExportPinImages(exportMap);

        if (exportMap.getLayer?.(CUSTOM_PIN_LAYER_ID)) {
          exportMap.setLayoutProperty(CUSTOM_PIN_LAYER_ID, 'visibility', 'visible');
        }

        exportMap.resize();
        await waitForMapIdle(exportMap);

        const sourceCanvas = exportMap.getCanvas();
        const outputWidth = sourceCanvas.width;
        const outputHeight = sourceCanvas.height;
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = outputWidth;
        outputCanvas.height = outputHeight;
        const ctx = outputCanvas.getContext('2d');

        if (!ctx) {
          throw new Error('Error creating high quality preview. Please try again.');
        }

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(sourceCanvas, 0, 0);
        await drawWatermark(ctx, outputWidth, outputHeight);

        return outputCanvas.toDataURL('image/jpeg', 0.95);
      });

      return previewDataUrl;
    } finally {
      exportMap?.remove();
      exportContainer.remove();
    }
  };

  const captureMatPreview = async (customPinsForCapture = null) => {
    if (!mapInstance) {
      throw new Error('Map is still loading. Please wait a moment and try again.');
    }

    const hasCustomPinLayer = Boolean(mapInstance.getLayer?.(CUSTOM_PIN_LAYER_ID));
    const previousCustomPinVisibility = hasCustomPinLayer
      ? mapInstance.getLayoutProperty(CUSTOM_PIN_LAYER_ID, 'visibility')
      : null;

    syncCustomPinsForCanvasCapture(customPinsForCapture);

    if (hasCustomPinLayer) {
      mapInstance.setLayoutProperty(CUSTOM_PIN_LAYER_ID, 'visibility', 'visible');
      await waitForMapRender();
    }

    let didOverrideExportPixelRatio = false;

    try {
      const dims = framePixels || { width: 384, height: 512, x: null, y: null };
      const targetPixelSize = getPrintPreviewPixelSize(matSize);

      try {
        return await captureHighDpiMapPreview({
          customPinsForCapture,
          targetPixelSize,
          dims,
        });
      } catch (exportError) {
        console.warn('High-DPI map export failed; falling back to screen canvas capture.', exportError);
      }

      const currentPixelRatio = window.devicePixelRatio || 1;
      const exportPixelRatio = Math.min(
        MAX_EXPORT_PIXEL_RATIO,
        Math.max(currentPixelRatio, targetPixelSize.width / dims.width)
      );

      const previewDataUrl = await withTemporaryDevicePixelRatio(exportPixelRatio, async (didOverride) => {
        didOverrideExportPixelRatio = didOverride;
        if (didOverride) {
          mapInstance.resize();
          await waitForMapRender();
        }

      const canvas = mapInstance.getCanvas();
      const mapContainer = mapInstance.getContainer();
      const pixelRatio = canvas.width / Math.max(mapContainer.clientWidth, 1);
      const scaledWidth = dims.width * pixelRatio;
      const scaledHeight = dims.height * pixelRatio;
      // Use the frame's actual pixel position if available, otherwise fall back to center
      const cropX = dims.x != null ? dims.x * pixelRatio : (canvas.width - scaledWidth) / 2;
      const cropY = dims.y != null ? dims.y * pixelRatio : (canvas.height - scaledHeight) / 2;
      const outputWidth = Math.min(targetPixelSize.width, Math.round(scaledWidth));
      const outputHeight = Math.min(targetPixelSize.height, Math.round(scaledHeight));
      const outputScale = outputWidth / scaledWidth;
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = outputWidth;
      croppedCanvas.height = outputHeight;
      const ctx = croppedCanvas.getContext('2d');

      if (!ctx) {
        throw new Error('Error creating preview. Please try again.');
      }

      // Preserve the map canvas' backing-pixel resolution for saved previews.
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(canvas, cropX, cropY, scaledWidth, scaledHeight, 0, 0, outputWidth, outputHeight);
      await drawThumbnailCustomPins({
        ctx,
        pins: customPinsForCapture,
        cropX,
        cropY,
        pixelRatio,
        outputScale,
      });

      await drawWatermark(ctx, outputWidth, outputHeight);

      return croppedCanvas.toDataURL('image/jpeg', 0.95);
      });

      return previewDataUrl;
    } finally {
      if (didOverrideExportPixelRatio) {
        mapInstance.resize();
        await waitForMapRender().catch((error) => {
          console.warn('Map resize restore render failed after export.', error);
        });
      }

      if (hasCustomPinLayer) {
        mapInstance.setLayoutProperty(CUSTOM_PIN_LAYER_ID, 'visibility', previousCustomPinVisibility || 'none');
      }
    }
  };

  const handlePlaceCustomPin = async () => {
    if (!customPinAddress.trim()) {
      dialog.alert('Please enter an address for the custom pin.', { title: 'Pin address required' });
      return;
    }

    setIsPlacingCustomPin(true);
    try {
      const feature = await geocodeToFeature(customPinAddress);
      const [lng, lat] = feature.center;
      const pinAddress = feature.place_name || customPinAddress.trim();
      setCustomPinDraft((draft) => ({
        id: draft?.id || createCustomPinId(),
        coordinates: [lng, lat],
        address: pinAddress,
        description: customPinDescription.trim(),
        iconId: customPinIconId,
      }));
      setMapCenter([lng, lat]);
      setMapZoom((currentZoom) => Math.max(currentZoom, 17));
      if (mapInstance) {
        mapInstance.flyTo({ center: [lng, lat], zoom: Math.max(mapInstance.getZoom(), 17), essential: true });
        mapInstance.once('idle', () => mapInstance.resize());
      }
    } catch (error) {
      console.error('Custom pin geocoding error:', error);
      dialog.alert(error.message || 'Error placing custom pin. Please try again.', { title: 'Pin placement failed' });
    } finally {
      setIsPlacingCustomPin(false);
    }
  };

  const handleDropCustomPinAtCenter = () => {
    const frameCenter = framePixels && mapInstance
      ? mapInstance.unproject([
          framePixels.x + framePixels.width / 2,
          framePixels.y + framePixels.height / 2,
        ])
      : null;
    const coordinates = frameCenter
      ? [frameCenter.lng, frameCenter.lat]
      : getCurrentMapCamera().mapCenter;

    setCustomPinDraft((draft) => ({
      id: draft?.id || createCustomPinId(),
      coordinates,
      address: '',
      description: customPinDescription.trim(),
      iconId: customPinIconId,
    }));
  };

  const handleSaveCustomPin = () => {
    if (!customPinDraft?.coordinates) {
      dialog.alert('Place or drop a pin before saving.', { title: 'Pin not placed' });
      return;
    }

    commitCustomPinDraft();
  };

  const handleUpdateCustomPin = (pinId, updates) => {
    setCustomPinDraft((draft) => (
      draft?.id === pinId ? { ...draft, ...updates } : draft
    ));
    setCustomPins((pins) => pins.map((pin) => (
      pin.id === pinId ? { ...pin, ...updates } : pin
    )));
  };

  const handleClearCustomPin = (pinId) => {
    setCustomPins((pins) => pins.filter((pin) => pin.id !== pinId));
  };

  const _handleGenerateMat = async () => {
    try {
      const capturedPreview = await captureMatPreview(getCustomPinsForSave());
      setPreviewImage(capturedPreview);
      setShowPreview(true);
    } catch (error) {
      console.error('Error capturing map:', error);
      dialog.alert(error.message || 'Error capturing map. Please try again.', { title: 'Preview failed' });
    }
  };

  useEffect(() => {
    if (location.state?.loadMat) {
      const mat = location.state.loadMat;
      setMatSize(normalizeMatSize(mat.matSize));
      setRotation(Number(mat.rotation) || 0);
      setColorScheme(mat.colorScheme || 'pastel');
      setMapCenter(normalizeMapCenter(mat.mapCenter));
      setHomePinCoordinates(normalizeMapCenter(mat.homePinCoordinates || mat.mapCenter));
      setMapZoom(Number(mat.mapZoom) || 15);
      setAddress(mat.address || '');
      setShowStreetNames(mat.showStreetNames ?? true);
      setShowLandmarks(mat.showLandmarks ?? true);
      setShowLandmarkNames(mat.showLandmarkNames ?? true);
      setLandmarkDensity(mat.landmarkDensity || 'balanced');
      setCustomPins(normalizeCustomPins(mat));
      setCustomPinDraft(null);
      setCustomPinAddress('');
      setCustomPinDescription('');
      setCustomPinIconId(DEFAULT_CUSTOM_PIN_ICON_ID);
      setPreviewImage(mat.previewImageUrl || null);
      setSavedMatId(mat.id || null);
      setMatName(mat.name || '');
      setSavedMatName(mat.name || '');
      window.history.replaceState({}, document.title);
      return;
    }

    const prefillAddress = location.state?.prefillAddress?.trim();
    if (prefillAddress) {
      const center = location.state?.prefillCenter;
      const lng = Number(center?.[0]);
      const lat = Number(center?.[1]);

      setAddress(prefillAddress);
      setSavedMatId(null);
      setSavedMatName('');

      if (Number.isFinite(lng) && Number.isFinite(lat)) {
        setMapCenter([lng, lat]);
        setHomePinCoordinates([lng, lat]);
        setMapZoom(17);
      } else {
        geocodeAddress(prefillAddress, false).catch((error) => {
          console.error('Prefill geocoding error:', error);
        });
      }

      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSaveMat = async () => {
    if (!isSignedIn) {
      const shouldSignup = await dialog.confirm('You need a verified account to save mats. Create or verify an account now?', {
        title: 'Account required',
        confirmLabel: 'Create account',
      });
      if (shouldSignup) navigate('/signup');
      return;
    }
    if (!matName.trim()) {
      dialog.alert('Please enter a name for your mat.', { title: 'Mat name required' });
      return;
    }
    setSaving(true);
    try {
      let previewImageUrl = '';
      const currentCamera = getCurrentMapCamera();
      const customPinsForSave = getCustomPinsForSave();

      try {
        previewImageUrl = await captureMatPreview(customPinsForSave);
        setPreviewImage(previewImageUrl);
      } catch (previewError) {
        console.warn('Preview capture failed; saving mat without preview image.', previewError);
      }

      const matData = {
        name: matName.trim(),
        matSize,
        colorScheme,
        rotation: currentCamera.rotation,
        mapCenter: currentCamera.mapCenter,
        homePinCoordinates,
        mapZoom: currentCamera.mapZoom,
        address,
        showStreetNames,
        showLandmarks,
        showLandmarkNames,
        landmarkDensity,
        customPins: customPinsForSave,
        previewImageUrl
      };

      const normalizedName = matName.trim();
      const shouldUpdateExistingMat = savedMatId && normalizedName === savedMatName;
      let successMessage = '';

      if (shouldUpdateExistingMat) {
        await updateMat(currentUser.uid, savedMatId, matData);
        setSavedMatName(normalizedName);
        successMessage = 'Mat updated successfully!';
      } else {
        const newMatId = await saveMat(currentUser.uid, matData, 'saved');
        setSavedMatId(newMatId);
        setSavedMatName(normalizedName);
        successMessage = savedMatId ? 'Saved as a new mat.' : 'Mat saved successfully!';
      }
      commitCustomPinDraft();
      setShowSaveDialog(false);
      dialog.alert(successMessage, { title: 'Mat saved' });
    } catch (error) {
      console.error('Error saving mat:', error);
      dialog.alert('Failed to save mat. Please try again.', { title: 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddToCart = async () => {
    if (isAddingToCart) return;

    try {
      if (currentUser && !isSignedIn && !currentUser.isAnonymous) {
        dialog.alert('Please verify your email before adding this mat to your cart.', { title: 'Verification required' });
        navigate('/login');
        return;
      }

      setIsAddingToCart(true);

      const user = currentUser || await withTimeout(
        ensureGuestSession(),
        'Guest checkout is taking too long. Please check your connection and try again.'
      );
      let matIdToAdd = savedMatId;
      const normalizedName = matName.trim() || 'Custom Play Mat';
      const currentCamera = getCurrentMapCamera();
      const customPinsForSave = getCustomPinsForSave();
      const capturedPreview = await captureMatPreview(customPinsForSave);
      const matData = {
        name: normalizedName,
        matSize,
        colorScheme,
        rotation: currentCamera.rotation,
        mapCenter: currentCamera.mapCenter,
        homePinCoordinates,
        mapZoom: currentCamera.mapZoom,
        address,
        showStreetNames,
        showLandmarks,
        showLandmarkNames,
        landmarkDensity,
        customPins: customPinsForSave,
        previewImageUrl: capturedPreview,
        status: 'in_cart'
      };

      if (!matIdToAdd) {
        matIdToAdd = await withTimeout(
          saveMat(user.uid, matData, 'in_cart'),
          'Saving your mat is taking too long. Please try again.'
        );
        setSavedMatId(matIdToAdd);
      } else {
        await withTimeout(
          updateMat(user.uid, matIdToAdd, matData),
          'Updating your mat is taking too long. Please try again.'
        );
      }

      const existingCartItem = cartItems.find((item) => item.designId === matIdToAdd || item.matId === matIdToAdd);
      await withTimeout(
        addToCart(user.uid, matIdToAdd, 1, selectedSize.price, {
          matSize,
          theme: colorScheme,
          nameSnapshot: normalizedName,
          previewImageUrlSnapshot: capturedPreview,
          customPinsSnapshot: customPinsForSave,
          shopifyVariantId: selectedSize.shopifyVariantId,
          existingCartItemId: existingCartItem?.id
        }),
        'Adding this mat to your cart is taking too long. Please try again.'
      );

      const confirmationItem = {
        userId: user.uid,
        designId: matIdToAdd,
        name: normalizedName,
        previewImage: capturedPreview,
        sizeName: selectedSize.name,
        matSize,
        dimensions: selectedSize.dimensions,
        themeName: selectedTheme.name,
        address,
        showStreetNames,
        showLandmarks,
        showLandmarkNames,
        landmarkDensity,
        customPins: customPinsForSave,
        price: selectedSize.price,
        quantity: (existingCartItem?.quantity || 0) + 1
      };

      joinLaunchWaitlistIfContactAvailable({
        user,
        source: 'add-to-cart',
        selectedItem: confirmationItem
      }).catch((waitlistError) => {
        console.warn('Automatic launch lead capture failed.', waitlistError);
      });

      setPreviewImage(capturedPreview);
      setCartConfirmation(confirmationItem);
      commitCustomPinDraft();
      setIsMobileCustomizeOpen(false);
    } catch (error) {
      console.error('Error adding to cart:', error);
      dialog.alert(error.message || 'Failed to add to cart. Please try again.', { title: 'Cart update failed' });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleUpdateQuantity = async (newQuantity) => {
    if (!currentUser || !currentCartItem) return;
    try {
      if (newQuantity <= 0) await removeFromCart(currentUser.uid, currentCartItem.id);
      else await updateCartQuantity(currentUser.uid, currentCartItem.id, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      dialog.alert('Failed to update quantity. Please try again.', { title: 'Quantity update failed' });
    }
  };

  return (
    <>
      {/* Full-screen editor — sits below the fixed 72px header */}
      <div className="editor-fullscreen">

        {/* Map fills the area left of the sidebar */}
        <div className="editor-map-area" data-tour="map-frame">
          <MatMapView
            center={mapCenter}
            zoom={mapZoom}
            matSize={selectedSize}
            rotation={rotation}
            colorScheme={selectedTheme.color}
            showStreetNames={showStreetNames}
            showLandmarks={showLandmarks}
            showLandmarkNames={showLandmarkNames}
            homePinCoordinates={homePinCoordinates}
            customPins={customPinDraft ? [...customPins, customPinDraft] : customPins}
            onCustomPinChange={handleUpdateCustomPin}
            onMapReady={setMapInstance}
            onFrameChange={setFramePixels}
            onCameraChange={handleMapCameraChange}
            onReplayTour={handleReplayTour}
            safeInsets={safeInsets}
          />
        </div>

        {/* Floating address bar */}
        <div className="editor-top-bar">
          <div className="address-search" data-tour="address-search">
            <span className="address-icon" aria-hidden="true" />
            <div className="relative flex-1">
              <input
                type="text"
                value={address}
                onChange={handleAddressChange}
                onKeyDown={(event) => event.key === 'Enter' && handleSearchAddress()}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                aria-label="Address"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="address-suggestions">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.id || index}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        handleSelectSuggestion(suggestion);
                      }}
                    >
                      <strong>{suggestion.text}</strong>
                      <small>{suggestion.place_name}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="button" className="ready-pill" onClick={handleSearchAddress} disabled={isSearching}>
              {isSearching ? 'SEARCHING' : 'READY'}
            </button>
          </div>

        </div>

        {/* Floating right sidebar */}
        <div className="editor-sidebar-float">
          <MatSidebar
            matSize={matSize}
            setMatSize={setMatSize}
            matSizes={matSizes}
            selectedSize={selectedSize}
            idPrefix="desktop-mat"
            showStreetNames={showStreetNames}
            setShowStreetNames={setShowStreetNames}
            showLandmarks={showLandmarks}
            setShowLandmarks={setShowLandmarks}
            showLandmarkNames={showLandmarkNames}
            setShowLandmarkNames={setShowLandmarkNames}
            customPins={customPins}
            customPinAddress={customPinAddress}
            onCustomPinAddressChange={handleCustomPinAddressChange}
            customPinSuggestions={customPinSuggestions}
            showCustomPinSuggestions={showCustomPinSuggestions}
            setShowCustomPinSuggestions={setShowCustomPinSuggestions}
            onSelectCustomPinSuggestion={handleSelectCustomPinSuggestion}
            customPinDescription={customPinDescription}
            setCustomPinDescription={handleCustomPinDescriptionChange}
            customPinIconId={customPinIconId}
            setCustomPinIconId={handleCustomPinIconChange}
            customPinDraft={customPinDraft}
            onPlaceCustomPin={handlePlaceCustomPin}
            onDropCustomPinAtCenter={handleDropCustomPinAtCenter}
            onSaveCustomPin={handleSaveCustomPin}
            onUpdateCustomPin={handleUpdateCustomPin}
            onClearCustomPin={handleClearCustomPin}
            isPlacingCustomPin={isPlacingCustomPin}
            onSaveForLater={() => setShowSaveDialog(true)}
            onAddToCart={handleAddToCart}
            isAddingToCart={isAddingToCart}
          />
        </div>
      </div>

      {/* Checkout bar — already position: fixed z-index: 900 */}
      {isMobileCustomizeOpen && (
        <>
          <div className="mobile-customize-scrim" onClick={() => setIsMobileCustomizeOpen(false)} />
          <div className="mobile-customize-sheet">
            <MatSidebar
              matSize={matSize}
              setMatSize={setMatSize}
              matSizes={matSizes}
              selectedSize={selectedSize}
              idPrefix="mobile-mat"
              showStreetNames={showStreetNames}
              setShowStreetNames={setShowStreetNames}
              showLandmarks={showLandmarks}
              setShowLandmarks={setShowLandmarks}
              showLandmarkNames={showLandmarkNames}
              setShowLandmarkNames={setShowLandmarkNames}
              customPins={customPins}
              customPinAddress={customPinAddress}
              onCustomPinAddressChange={handleCustomPinAddressChange}
              customPinSuggestions={customPinSuggestions}
              showCustomPinSuggestions={showCustomPinSuggestions}
              setShowCustomPinSuggestions={setShowCustomPinSuggestions}
              onSelectCustomPinSuggestion={handleSelectCustomPinSuggestion}
              customPinDescription={customPinDescription}
              setCustomPinDescription={handleCustomPinDescriptionChange}
              customPinIconId={customPinIconId}
              setCustomPinIconId={handleCustomPinIconChange}
              customPinDraft={customPinDraft}
              onPlaceCustomPin={handlePlaceCustomPin}
              onDropCustomPinAtCenter={handleDropCustomPinAtCenter}
              onSaveCustomPin={handleSaveCustomPin}
              onUpdateCustomPin={handleUpdateCustomPin}
              onClearCustomPin={handleClearCustomPin}
              isPlacingCustomPin={isPlacingCustomPin}
              onSaveForLater={() => setShowSaveDialog(true)}
              onAddToCart={handleAddToCart}
              isAddingToCart={isAddingToCart}
              onClose={() => setIsMobileCustomizeOpen(false)}
            />
          </div>
        </>
      )}

      <div className={`mobile-cart-bar ${isMobileCustomizeOpen ? 'is-menu-open' : ''}`}>
        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setIsMobileCustomizeOpen((isOpen) => !isOpen)}
          aria-label={isMobileCustomizeOpen ? 'Close customization menu' : 'Open customization menu'}
          aria-expanded={isMobileCustomizeOpen}
        >
          <span />
          <span />
          <span />
        </button>
        <div className="mobile-cart-summary">
          <span>TOTAL PRICE</span>
          <strong>${selectedSize.price.toFixed(2)}</strong>
        </div>
        <div className="mobile-cart-actions">
          <button type="button" className="primary-action" onClick={handleAddToCart} disabled={isAddingToCart}>
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {showPreview && (
        <MatPreview
          previewImage={previewImage}
          matSize={matSize}
          colorScheme={colorScheme}
          matSizes={matSizes}
          colorSchemes={colorSchemes}
          savedMatId={savedMatId}
          matName={matName}
          cartItem={currentCartItem}
          onBackToEdit={() => setShowPreview(false)}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateQuantity}
          onSave={() => setShowSaveDialog(true)}
        />
      )}

      <CartConfirmationModal
        key={cartConfirmation?.designId || 'empty-cart-confirmation'}
        item={cartConfirmation}
        onClose={() => setCartConfirmation(null)}
      />

      {isTourActive && (
        <TourOverlay
          step={TOUR_STEPS[tourStepIndex]}
          stepIndex={tourStepIndex}
          stepCount={TOUR_STEPS.length}
          onNext={() => setTourStepIndex((index) => Math.min(index + 1, TOUR_STEPS.length - 1))}
          onBack={() => setTourStepIndex((index) => Math.max(index - 1, 0))}
          onSkip={closeTour}
          onFinish={closeTour}
        />
      )}

      {showSaveDialog && (
        <>
          <div onClick={() => setShowSaveDialog(false)} className="fixed inset-0 z-[9999] bg-[#191c1e]/50 backdrop-blur-sm" />
          <div
            className="fixed left-1/2 top-1/2 z-[10000] w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#c5c6cc] bg-white p-8 shadow-2xl"
            style={{ fontFamily: "'Quicksand', 'DM Sans', sans-serif" }}
          >
            <h3 className="mb-2 text-2xl font-bold text-[#212b3a]">{savedMatId ? 'Update Mat' : 'Save Your Mat'}</h3>
            <p className="mb-6 text-sm" style={{ color: 'var(--builder-muted)' }}>Give your custom play mat a name so you can find it later.</p>
            <label className="builder-label" htmlFor="save-name">Mat Name</label>
            <input
              id="save-name"
              type="text"
              value={matName}
              onChange={(event) => setMatName(event.target.value)}
              autoFocus
              className="builder-input mb-6"
            />
            <div className="flex gap-3">
              <button type="button" className="secondary-action flex-1" onClick={() => setShowSaveDialog(false)} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="primary-action flex-1" onClick={handleSaveMat} disabled={saving}>
                {saving ? 'Saving...' : savedMatId ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ToyMatDesigner;
