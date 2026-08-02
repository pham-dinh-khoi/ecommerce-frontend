import { useState, useEffect } from 'react';

/**
 * A custom hook that delays updating a value until a specified period of inactivity.
 *
 * This is primarily used to prevent expensive operations (like API calls
 * or heavy re-renders) from firing too frequently while a user is typing.
 *
 * @template T - The type of the value being debounced.
 * @param value - The value to debounce (e.g., a search query string).
 * @param delay - The delay in milliseconds before the value is updated (default 400ms).
 * @returns The debounced value, which only updates after the delay has passed.
 */
export function useDebounce<T>(value: T, delay = 400): T {
  // We initialize the state with the current value.
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // 1. Set a timer to update the 'debounced' state after the delay.
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delay);

    // 2. Cleanup: If 'value' or 'delay' changes BEFORE the timer finishes,
    //    clearTimeout removes the pending timer. This effectively resets
    //    the "clock," ensuring the update only happens after the user
    //    stops changing the input for the specified duration.
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
