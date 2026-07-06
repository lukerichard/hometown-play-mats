import { useCallback, useEffect, useState } from 'react';

export function getVisibleTourTarget(name) {
  const candidates = document.querySelectorAll(`[data-tour="${name}"]`);
  for (const el of candidates) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return el;
    }
  }
  return null;
}

const MAX_RETRY_FRAMES = 20;

export function useTourTargetRect(targetName, active) {
  const [rect, setRect] = useState(null);

  const measure = useCallback(() => {
    const el = getVisibleTourTarget(targetName);
    if (!el) {
      setRect(null);
      return null;
    }
    const bounds = el.getBoundingClientRect();
    setRect({ top: bounds.top, left: bounds.left, width: bounds.width, height: bounds.height });
    return el;
  }, [targetName]);

  useEffect(() => {
    if (!active) return undefined;

    let resizeObserver = null;
    let mutationObserver = null;
    let retryFrame = null;
    let retryCount = 0;
    let cancelled = false;

    const attachToElement = (el) => {
      resizeObserver = new ResizeObserver(() => measure());
      resizeObserver.observe(el);
    };

    const tryMeasure = () => {
      if (cancelled) return;
      const el = measure();
      if (el) {
        attachToElement(el);
      } else if (retryCount < MAX_RETRY_FRAMES) {
        retryCount += 1;
        retryFrame = window.requestAnimationFrame(tryMeasure);
      }
    };

    retryFrame = window.requestAnimationFrame(tryMeasure);

    mutationObserver = new MutationObserver(() => {
      if (!resizeObserver) {
        tryMeasure();
      }
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    const handleReflow = () => measure();
    window.addEventListener('resize', handleReflow);
    window.addEventListener('scroll', handleReflow, true);

    return () => {
      cancelled = true;
      if (retryFrame) window.cancelAnimationFrame(retryFrame);
      if (resizeObserver) resizeObserver.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
      window.removeEventListener('resize', handleReflow);
      window.removeEventListener('scroll', handleReflow, true);
      setRect(null);
    };
  }, [active, targetName, measure]);

  return rect;
}
