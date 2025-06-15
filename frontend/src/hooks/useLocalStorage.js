import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for localStorage with JSON serialization
 * @param {string} key - localStorage key
 * @param {any} initialValue - Initial value if key doesn't exist
 * @returns {Array} [value, setValue, removeValue]
 */
export const useLocalStorage = (key, initialValue) => {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  /**
   * Set value in state and localStorage
   * @param {any} value - Value to store
   */
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  /**
   * Remove value from localStorage
   */
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes to this localStorage key from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue, removeValue];
};

/**
 * Hook for storing user preferences
 * @returns {Object} Preferences state and methods
 */
export const useUserPreferences = () => {
  const [preferences, setPreferences, removePreferences] = useLocalStorage('userPreferences', {
    theme: 'light',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    notifications: {
      email: true,
      push: true,
      desktop: false
    },
    dashboard: {
      layout: 'grid',
      widgets: ['attendance', 'leave', 'performance', 'notifications']
    }
  });

  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  }, [setPreferences]);

  const updateNestedPreference = useCallback((parentKey, childKey, value) => {
    setPreferences(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: value
      }
    }));
  }, [setPreferences]);

  const resetPreferences = useCallback(() => {
    removePreferences();
  }, [removePreferences]);

  return {
    preferences,
    updatePreference,
    updateNestedPreference,
    resetPreferences,
    
    // Convenience getters
    theme: preferences.theme,
    language: preferences.language,
    dateFormat: preferences.dateFormat,
    timeFormat: preferences.timeFormat,
    notifications: preferences.notifications,
    dashboard: preferences.dashboard
  };
};

/**
 * Hook for storing form data temporarily
 * @param {string} formKey - Unique key for the form
 * @param {Object} initialData - Initial form data
 * @returns {Object} Form state and methods
 */
export const useFormStorage = (formKey, initialData = {}) => {
  const storageKey = `form_${formKey}`;
  const [formData, setFormData, removeFormData] = useLocalStorage(storageKey, initialData);

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, [setFormData]);

  const updateFields = useCallback((fields) => {
    setFormData(prev => ({
      ...prev,
      ...fields
    }));
  }, [setFormData]);

  const clearForm = useCallback(() => {
    removeFormData();
  }, [removeFormData]);

  const resetForm = useCallback(() => {
    setFormData(initialData);
  }, [setFormData, initialData]);

  return {
    formData,
    updateField,
    updateFields,
    clearForm,
    resetForm,
    hasData: Object.keys(formData).length > 0
  };
};

/**
 * Hook for storing recently viewed items
 * @param {string} category - Category of items (e.g., 'employees', 'reports')
 * @param {number} maxItems - Maximum number of items to store
 * @returns {Object} Recent items state and methods
 */
export const useRecentItems = (category, maxItems = 10) => {
  const storageKey = `recent_${category}`;
  const [recentItems, setRecentItems] = useLocalStorage(storageKey, []);

  const addItem = useCallback((item) => {
    setRecentItems(prev => {
      // Remove item if it already exists
      const filtered = prev.filter(existing => existing.id !== item.id);
      
      // Add item to beginning and limit to maxItems
      return [item, ...filtered].slice(0, maxItems);
    });
  }, [setRecentItems, maxItems]);

  const removeItem = useCallback((itemId) => {
    setRecentItems(prev => prev.filter(item => item.id !== itemId));
  }, [setRecentItems]);

  const clearItems = useCallback(() => {
    setRecentItems([]);
  }, [setRecentItems]);

  return {
    recentItems,
    addItem,
    removeItem,
    clearItems,
    hasItems: recentItems.length > 0
  };
};

export default useLocalStorage;
