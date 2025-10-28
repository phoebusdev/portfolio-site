import { useEffect, useState } from 'react';
import { logError } from '../utils/errorLogger.js';

/**
 * Custom hook to load section data from sections.json
 * Eliminates duplication across all section components
 *
 * @param {string} sectionType - The sectionType to find in sections.json
 * @returns {Object} { sectionData, loading, error }
 */
export function useSectionData(sectionType) {
  const [sectionData, setSectionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    import('@content/sections.json')
      .then((module) => {
        const section = module.default.sections.find(
          (s) => s.sectionType === sectionType
        );

        if (!section) {
          throw new Error(`Section "${sectionType}" not found in sections.json`);
        }

        setSectionData(section);
        setLoading(false);
      })
      .catch((err) => {
        // Log with context for debugging
        logError('SECTION_DATA_LOAD_FAILED', {
          sectionType,
          error: err.message,
          stack: err.stack
        });

        // Set user-friendly error
        setError({
          message: 'Unable to load this section',
          canRetry: true
        });
        setLoading(false);
      });
  }, [sectionType]);

  return { sectionData, loading, error };
}
