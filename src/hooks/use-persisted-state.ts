import { useCallback, useEffect, useState } from 'react';

export function usePersistedState<T>(
  key: string,
  initialValue: T,
  options?: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
  }
): [T, (value: T | ((prevState: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    const savedValue = localStorage.getItem(key);

    if (savedValue !== null) {
      try {
        return options?.deserialize
          ? options.deserialize(savedValue)
          : JSON.parse(savedValue);
      } catch (error) {
        console.warn(`Error reading ${key} from localStorage:`, error);
        return initialValue;
      }
    }

    return initialValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        key,
        options?.serialize ? options.serialize(state) : JSON.stringify(state)
      );
    } catch (error) {
      console.warn(`Error saving ${key} to localStorage:`, error);
    }
  }, [key, state, options]);

  const setPersistedState = useCallback((value: T | ((prevState: T) => T)) => {
    setState(value);
  }, []);

  return [state, setPersistedState];
}
