import { useEffect, useRef, useState } from 'react';
import GestureLegend from './GestureLegend';

const ControlsPopover = ({ onReplayTour, buttonPosition = null, embedded = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    const handleClickOutside = (event) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleReplay = () => {
    setIsOpen(false);
    onReplayTour();
  };

  const isFrameAnchored = Boolean(buttonPosition) || embedded;
  const anchoredButtonHeight = embedded ? 56 : buttonPosition?.height || 40;

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        className={isFrameAnchored ? 'map-frame-control-button map-frame-help-button' : 'tour-controls-button'}
        style={buttonPosition ? { position: 'absolute', top: buttonPosition.top, left: buttonPosition.left } : undefined}
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Map help"
      >
        ?
      </button>

      {isOpen && (
        <section
          ref={panelRef}
          className={isFrameAnchored ? 'tour-controls-popover is-frame-anchored' : 'tour-controls-popover'}
          style={
            embedded
              ? { top: anchoredButtonHeight + 8, left: 0 }
              : buttonPosition
                ? { top: buttonPosition.top + anchoredButtonHeight + 8, left: Math.max(10, buttonPosition.left - 240) }
                : undefined
          }
          role="dialog"
          aria-label="Map controls"
        >
          <h4 className="tour-controls-popover-title">Map Controls</h4>
          <GestureLegend />
          <button type="button" className="secondary-action tour-controls-replay" onClick={handleReplay}>
            Replay Walkthrough
          </button>
        </section>
      )}
    </>
  );
};

export default ControlsPopover;
