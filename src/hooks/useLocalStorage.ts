import { useState, useEffect, useCallback } from "react";

/**
 * A type-safe React hook that synchronizes state variables with localStorage.
 * Prevents hydration mismatches by returning the default value during SSR
 * and updating the state on the client side after mounting.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Initialize state with standard initialValue.
  // We read from localStorage inside a useEffect hook to avoid server/client hydration mismatch errors.
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Sync state with localStorage once components are mounted
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Warning: Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  // Return a wrapped setter function that updates state and persists to localStorage.
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Update local React state
        setStoredValue(valueToStore);
        
        // Save to browser localStorage
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Warning: Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}
