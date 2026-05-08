import { useEffect, useRef } from 'react';

/**
 * Custom hook to perform periodic polling.
 * @param {Function} callback - The function to call every interval.
 * @param {number} delay - Delay in milliseconds. Pass null to stop polling.
 * @param {Array} deps - Dependency array to reset the timer.
 */
export const usePolling = (callback, delay, deps = []) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const tick = () => savedCallback.current();
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay, ...deps]);
};
