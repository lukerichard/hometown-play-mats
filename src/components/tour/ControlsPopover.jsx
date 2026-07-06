import { useEffect, useRef, useState } from 'react';
import GestureLegend from './GestureLegend';

const ControlsPopover = ({ onReplayTour }) => {
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

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        className="tour-controls-button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Map controls"
      >
        ?
      </button>

      {isOpen && (
        <section ref={panelRef} className="tour-controls-popover" role="dialog" aria-label="Map controls">
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
