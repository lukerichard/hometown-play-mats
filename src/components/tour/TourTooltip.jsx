import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import GestureLegend from './GestureLegend';

const MOBILE_BREAKPOINT = 720;
const VIEWPORT_MARGIN = 16;

function computeDesktopPosition(rect, placement, tooltipSize) {
  if (!rect) {
    return {
      top: window.innerHeight / 2 - tooltipSize.height / 2,
      left: window.innerWidth / 2 - tooltipSize.width / 2
    };
  }

  let top;
  let left;

  switch (placement) {
    case 'left':
      top = rect.top + rect.height / 2 - tooltipSize.height / 2;
      left = rect.left - tooltipSize.width - 16;
      break;
    case 'bottom':
      top = rect.top + rect.height + 16;
      left = rect.left + rect.width / 2 - tooltipSize.width / 2;
      break;
    case 'center':
    default:
      top = window.innerHeight / 2 - tooltipSize.height / 2;
      left = window.innerWidth / 2 - tooltipSize.width / 2;
      break;
  }

  const maxLeft = Math.max(window.innerWidth - tooltipSize.width - VIEWPORT_MARGIN, VIEWPORT_MARGIN);
  const maxTop = Math.max(window.innerHeight - tooltipSize.height - VIEWPORT_MARGIN, VIEWPORT_MARGIN);
  left = Math.min(Math.max(left, VIEWPORT_MARGIN), maxLeft);
  top = Math.min(Math.max(top, VIEWPORT_MARGIN), maxTop);

  return { top, left };
}

const TourTooltip = ({ step, stepIndex, stepCount, rect, onNext, onBack, onSkip, onFinish }) => {
  const tooltipRef = useRef(null);
  const nextButtonRef = useRef(null);
  const [position, setPosition] = useState(null);
  const isLastStep = stepIndex === stepCount - 1;
  const isFirstStep = stepIndex === 0;
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT;

  useLayoutEffect(() => {
    if (isMobile || !tooltipRef.current) return;
    const size = tooltipRef.current.getBoundingClientRect();
    setPosition(computeDesktopPosition(rect, step.placement, { width: size.width, height: size.height }));
  }, [rect, step.placement, isMobile]);

  useEffect(() => {
    nextButtonRef.current?.focus();
  }, [stepIndex]);

  const style = isMobile ? undefined : position ? { top: position.top, left: position.left } : { opacity: 0 };

  return (
    <section
      ref={tooltipRef}
      className={`tour-tooltip ${isMobile ? 'is-mobile' : ''}`}
      style={style}
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      aria-labelledby="tour-step-title"
      aria-describedby="tour-step-body"
    >
      <button type="button" className="tour-tooltip-close" onClick={onFinish} aria-label="Close walkthrough">
        &times;
      </button>

      <span className="tour-tooltip-eyebrow">
        Step {stepIndex + 1} of {stepCount}
      </span>
      <h3 className="tour-tooltip-title" id="tour-step-title">{step.title}</h3>
      <p className="tour-tooltip-body" id="tour-step-body">{step.body}</p>

      {step.gestureLegend && <GestureLegend compact />}

      <div className="tour-tooltip-dots" aria-hidden="true">
        {Array.from({ length: stepCount }).map((_, index) => (
          <span key={index} className={`tour-tooltip-dot ${index === stepIndex ? 'is-active' : ''}`} />
        ))}
      </div>

      <div className="tour-tooltip-actions">
        <button type="button" className="tour-tooltip-skip" onClick={onSkip}>
          Skip
        </button>
        <div className="tour-tooltip-buttons">
          {!isFirstStep && (
            <button type="button" className="secondary-action" onClick={onBack}>
              Back
            </button>
          )}
          <button type="button" className="primary-action" ref={nextButtonRef} onClick={isLastStep ? onFinish : onNext}>
            {isLastStep ? 'Got it' : 'Next'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default TourTooltip;
