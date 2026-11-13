import { useEffect, useRef } from 'react';

/**
 * Calls `onIntersect` whenever the returned ref's element scrolls into view.
 * Used for infinite scrolling: put the ref on an element at the end of a list.
 *
 * The observer is recreated whenever `enabled` changes, so if the element is
 * still visible after more items load, it fires again straight away.
 */
export default function useIntersection(onIntersect, { enabled = true, rootMargin = '600px' } = {}) {
  const targetRef = useRef(null);
  const callbackRef = useRef(onIntersect);

  useEffect(() => {
    callbackRef.current = onIntersect;
  });

  useEffect(() => {
    const target = targetRef.current;
    if (!enabled || !target) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) callbackRef.current();
      },
      { rootMargin }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return targetRef;
}
