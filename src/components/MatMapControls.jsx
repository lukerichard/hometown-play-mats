import { useEffect, useRef, useState } from 'react';
import ControlsPopover from './tour/ControlsPopover';

const CONTROL_HEIGHT = 56;     // px, shared outer height for help, zoom, and rotate controls
const COMPACT_CONTROL_HEIGHT = 85;
const COMPACT_TOGGLE_HEIGHT = 38;
const END_BUTTON_SIZE = 40;    // px, buttons grouped inside a control card
const GAP = 8;                 // px, gap between elements inside a card
const EDGE_MARGIN = 10;        // px, min clearance from the container/safe-area bounds
const COMPACT_BREAKPOINT = 760;

const ZOOM_TRACK_LENGTH = 150;
const ZOOM_TRACK_THICKNESS = 14;
const COMPACT_ZOOM_TRACK_LENGTH = 86;
const COMPACT_ZOOM_TRACK_THICKNESS = 10;
const ROTATE_DIAL_SIZE = 40;
const ROTATE_INPUT_WIDTH = 58;

const ROTATE_STEP_DEGREES = 15;
const ROTATE_ANIMATION_MS = 300; // matches MatMapView's own rotation-sync effect
const ROTATE_MIN = -180;
const ROTATE_MAX = 180;

// Practical zoom range for a neighbourhood-scale mat design (avoids the whole-world/globe
// view at very low zoom and the pointless block-of-pixels extreme at the very top).
const PRACTICAL_MIN_ZOOM = 10;
const PRACTICAL_MAX_ZOOM = 20;

const ZoomInIcon = () => <span aria-hidden="true">+</span>;
const ZoomOutIcon = () => <span aria-hidden="true">&minus;</span>;

const ResetNorthIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="7.4" stroke="currentColor" strokeWidth="1.3" />
    <path d="M10 5.3 12.6 12 10 10.3 7.4 12Z" fill="currentColor" />
  </svg>
);

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const normalizeBearing = (value) => {
  const normalized = ((((value + 180) % 360) + 360) % 360) - 180;
  return normalized === -180 ? 180 : normalized;
};

const ControlButton = ({ onClick, disabled, ariaLabel, className = '', children }) => (
  <button
    type="button"
    className={`map-frame-control-button ${className}`}
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
  >
    {children}
  </button>
);

const RotateDial = ({ value, onChange }) => {
  const dialRef = useRef(null);

  const setValueFromPointer = (event) => {
    const dial = dialRef.current;
    if (!dial) return;

    const rect = dial.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    onChange(normalizeBearing(Math.atan2(x, -y) * (180 / Math.PI)));
  };

  const handlePointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setValueFromPointer(event);
  };

  const handlePointerMove = (event) => {
    if (event.buttons !== 1) return;
    setValueFromPointer(event);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onChange(normalizeBearing(value - 1));
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      onChange(normalizeBearing(value + 1));
    }
  };

  return (
    <div
      ref={dialRef}
      className="map-frame-rotate-dial"
      style={{ '--map-bearing': `${normalizeBearing(value)}deg` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onKeyDown={handleKeyDown}
      role="slider"
      aria-label="Map rotation dial"
      aria-valuemin={ROTATE_MIN}
      aria-valuemax={ROTATE_MAX}
      aria-valuenow={Math.round(normalizeBearing(value))}
      tabIndex={0}
    >
      <span className="map-frame-rotate-dial-needle" aria-hidden="true" />
    </div>
  );
};

// Shared drag-to-set slider. `value`/`min`/`max` describe the model value; `onChange` fires
// continuously while dragging (or on a single click along the track), `orientation` picks the axis.
const MapSlider = ({ orientation, value, min, max, onChange, length, thickness, ariaLabel }) => {
  const trackRef = useRef(null);

  const fraction = Math.min(1, Math.max(0, (value - min) / (max - min)));
  // Vertical: bottom = min (matches the "-" button at the bottom), top = max ("+" at the top).
  const thumbFraction = orientation === 'vertical' ? 1 - fraction : fraction;

  const setValueFromPointer = (event) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const rawFraction = orientation === 'vertical'
      ? 1 - (event.clientY - rect.top) / rect.height
      : (event.clientX - rect.left) / rect.width;
    const clampedFraction = Math.min(1, Math.max(0, rawFraction));
    onChange(min + clampedFraction * (max - min));
  };

  const handlePointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setValueFromPointer(event);
  };

  const handlePointerMove = (event) => {
    if (event.buttons !== 1) return;
    setValueFromPointer(event);
  };

  const trackStyle = orientation === 'vertical'
    ? { width: thickness, height: length }
    : { width: length, height: thickness };

  const thumbStyle = orientation === 'vertical'
    ? { top: `${thumbFraction * 100}%` }
    : { left: `${thumbFraction * 100}%` };

  return (
    <div
      ref={trackRef}
      className={`map-frame-slider-track map-frame-slider-track-${orientation}`}
      style={trackStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      tabIndex={0}
    >
      <div className="map-frame-slider-thumb" style={thumbStyle} />
    </div>
  );
};

const MatMapControls = ({ mapRef, frame, containerSize, safeInsets, onReplayTour }) => {
  const [zoomValue, setZoomValue] = useState(0);
  const [zoomLimits, setZoomLimits] = useState({ min: 0, max: 22 });
  const [bearingValue, setBearingValue] = useState(0);
  const [isCompactControlsOpen, setIsCompactControlsOpen] = useState(false);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;

    const updateZoom = () => setZoomValue(map.getZoom());
    const updateBearing = () => setBearingValue(map.getBearing());

    setZoomLimits({
      min: Math.max(map.getMinZoom(), PRACTICAL_MIN_ZOOM),
      max: Math.min(map.getMaxZoom(), PRACTICAL_MAX_ZOOM),
    });
    updateZoom();
    updateBearing();
    map.on('zoom', updateZoom);
    map.on('rotate', updateBearing);
    return () => {
      map.off('zoom', updateZoom);
      map.off('rotate', updateBearing);
    };
  }, [mapRef]);

  if (!frame || !containerSize.w || !containerSize.h) return null;

  const isCompactControls = containerSize.w <= COMPACT_BREAKPOINT;
  const controlHeight = isCompactControls ? COMPACT_CONTROL_HEIGHT : CONTROL_HEIGHT;
  const zoomTrackLength = isCompactControls ? COMPACT_ZOOM_TRACK_LENGTH : ZOOM_TRACK_LENGTH;
  const zoomTrackThickness = isCompactControls ? COMPACT_ZOOM_TRACK_THICKNESS : ZOOM_TRACK_THICKNESS;

  const safeW = containerSize.w - safeInsets.right;
  const controlsSectionCenter = clamp(frame.fl + frame.fw / 2, EDGE_MARGIN, safeW - EDGE_MARGIN);
  const mobileBarTop = Math.max(safeInsets.top + EDGE_MARGIN, frame.ft - COMPACT_TOGGLE_HEIGHT - GAP);
  const controlsSectionTop = isCompactControls
    ? Math.max(safeInsets.top + EDGE_MARGIN, mobileBarTop - controlHeight - GAP)
    : Math.max(safeInsets.top + EDGE_MARGIN, frame.ft - controlHeight - GAP);
  const controlsMaxWidth = Math.max(0, safeW - EDGE_MARGIN * 2);

  // Right-hand column: Help button, Zoom card, Pan card — all centered on one vertical axis.
  const zoomIn = () => mapRef.current?.zoomIn();
  const zoomOut = () => mapRef.current?.zoomOut();
  const setZoom = (value) => mapRef.current?.setZoom(value);

  const rotateBy = (direction) => {
    const map = mapRef.current;
    if (!map) return;
    const nextBearing = (map.getBearing() + direction * ROTATE_STEP_DEGREES + 360) % 360;
    map.rotateTo(nextBearing, { duration: ROTATE_ANIMATION_MS });
  };
  const setBearing = (value) => mapRef.current?.setBearing(normalizeBearing(value));
  const resetNorth = () => mapRef.current?.resetNorth();
  const displayBearing = Math.round(normalizeBearing(bearingValue));

  const handleBearingInputChange = (event) => {
    const nextBearing = Number(event.target.value);
    if (Number.isNaN(nextBearing)) return;
    setBearing(clamp(nextBearing, ROTATE_MIN, ROTATE_MAX));
  };

  const controlsPositionStyle = {
    top: controlsSectionTop,
    left: controlsSectionCenter,
    maxWidth: controlsMaxWidth,
  };

  const mobileBar = isCompactControls ? (
    <div
      className="map-frame-mobile-controls-bar"
      style={{
        top: mobileBarTop,
        left: controlsSectionCenter,
        maxWidth: controlsMaxWidth,
      }}
    >
      {!isCompactControlsOpen && (
        <button
          type="button"
          className="map-frame-controls-toggle"
          onClick={() => setIsCompactControlsOpen(true)}
          aria-expanded="false"
          aria-controls="map-frame-controls-panel"
        >
          Controls
        </button>
      )}
      <ControlsPopover onReplayTour={onReplayTour} embedded />
    </div>
  ) : null;

  if (isCompactControls && !isCompactControlsOpen) {
    return (
      mobileBar
    );
  }

  return (
    <>
      {mobileBar}

      <div
        id="map-frame-controls-panel"
        className={`map-frame-controls-section${isCompactControls ? ' is-compact-open' : ''}`}
        style={controlsPositionStyle}
      >
        {!isCompactControls && (
          <ControlsPopover onReplayTour={onReplayTour} embedded />
        )}

        {!isCompactControls && (
          <span className="map-frame-control-divider" aria-hidden="true" />
        )}

        {isCompactControls && (
          <button
            type="button"
            className="map-frame-controls-toggle is-panel-hide"
            onClick={() => setIsCompactControlsOpen(false)}
            aria-expanded="true"
            aria-controls="map-frame-controls-panel"
          >
            Hide
          </button>
        )}

        <div className="map-frame-control-group map-frame-zoom-group">
          <ControlButton onClick={zoomOut} ariaLabel="Zoom out" className="is-end-button">
            <ZoomOutIcon />
          </ControlButton>
          <div className="map-frame-slider-wrap">
            <MapSlider
              orientation="horizontal"
              value={zoomValue}
              min={zoomLimits.min}
              max={zoomLimits.max}
              onChange={setZoom}
              length={zoomTrackLength}
              thickness={zoomTrackThickness}
              ariaLabel="Map zoom"
            />
          </div>
          <ControlButton onClick={zoomIn} ariaLabel="Zoom in" className="is-end-button">
            <ZoomInIcon />
          </ControlButton>
        </div>

        <span className="map-frame-control-divider" aria-hidden="true" />

        <div className="map-frame-control-group map-frame-rotate-group">
          <RotateDial value={bearingValue} onChange={setBearing} />
          <ControlButton onClick={() => rotateBy(-1)} ariaLabel="Rotate map left 15 degrees" className="is-end-button">
            <span aria-hidden="true">&minus;</span>
          </ControlButton>
          <label className="map-frame-degree-input-wrap">
            <span className="sr-only">Map rotation degrees</span>
            <input
              type="number"
              className="map-frame-degree-input"
              min={ROTATE_MIN}
              max={ROTATE_MAX}
              step="1"
              value={displayBearing}
              onChange={handleBearingInputChange}
              aria-label="Map rotation degrees"
            />
            <span aria-hidden="true">deg</span>
          </label>
          <ControlButton onClick={() => rotateBy(1)} ariaLabel="Rotate map right 15 degrees" className="is-end-button">
            <span aria-hidden="true">+</span>
          </ControlButton>
          <ControlButton onClick={resetNorth} ariaLabel="Reset map rotation to north" className="is-end-button is-reset-north">
            <ResetNorthIcon />
          </ControlButton>
        </div>
      </div>
    </>
  );
};

export default MatMapControls;
