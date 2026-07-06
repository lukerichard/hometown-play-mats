const GESTURES = [
  {
    id: 'zoom',
    label: 'Scroll to Zoom',
    hint: 'Use your mouse wheel or trackpad to zoom in and out',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M7 3 10 0.5 13 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="7" y="4" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.4" />
        <line x1="10" y1="6.5" x2="10" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M7 19.5 10 17 13 19.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    id: 'rotate',
    label: 'Right-Click + Drag to Rotate',
    hint: 'Hold the right mouse button and drag to spin the map',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M15.5 6.5A6 6 0 1 0 16 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M15.5 3v4h-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    id: 'pan',
    label: 'Left-Click + Drag to Pan',
    hint: 'Hold the left mouse button and drag to move around',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 2v16M2 10h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path
          d="M7 5 10 2 13 5M7 15 10 18 13 15M5 7 2 10 5 13M15 7 18 10 15 13"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
];

const GestureLegend = ({ compact = false }) => (
  <div className={`tour-gesture-legend ${compact ? 'is-compact' : ''}`}>
    {GESTURES.map((gesture) => (
      <div className="tour-gesture-row" key={gesture.id}>
        <span className="tour-gesture-icon" data-gesture={gesture.id}>
          {gesture.icon}
        </span>
        <span className="tour-gesture-label">
          <strong>{gesture.label}</strong>
          <small>{gesture.hint}</small>
        </span>
      </div>
    ))}
  </div>
);

export default GestureLegend;
