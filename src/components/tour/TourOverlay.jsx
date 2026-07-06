import { useEffect, useRef } from 'react';
import { useTourTargetRect } from './tourDom';
import TourTooltip from './TourTooltip';
import TourPointerCue from './TourPointerCue';

const SPOTLIGHT_PADDING = 8;

const TourOverlay = ({ step, stepIndex, stepCount, onNext, onBack, onSkip, onFinish }) => {
  const rect = useTourTargetRect(step.target, true);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    return () => {
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSkip]);

  const spotlightStyle = rect
    ? {
        top: rect.top - SPOTLIGHT_PADDING,
        left: rect.left - SPOTLIGHT_PADDING,
        width: rect.width + SPOTLIGHT_PADDING * 2,
        height: rect.height + SPOTLIGHT_PADDING * 2
      }
    : {
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
        width: 0,
        height: 0
      };

  return (
    <>
      <div className="tour-click-catcher" onClick={onSkip} />
      <div className="tour-spotlight" style={spotlightStyle} />
      {step.pointerCue && <TourPointerCue rect={rect} />}
      <TourTooltip
        step={step}
        stepIndex={stepIndex}
        stepCount={stepCount}
        rect={rect}
        onNext={onNext}
        onBack={onBack}
        onSkip={onSkip}
        onFinish={onFinish}
      />
    </>
  );
};

export default TourOverlay;
