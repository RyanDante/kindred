import { useCallback, useRef, useState } from 'react';
import { loadDefaultCameroonPlaces, textSearchPlaces } from '../utils/nominatim';

/**
 * OpenStreetMap / Nominatim — no Google billing.
 * Replaces useGooglePlacesService for batch entry & admin search.
 */
export function useOsmPlacesService() {
  const dummyRef = useRef<HTMLDivElement>(null);
  const [placesError, setPlacesError] = useState<string | null>(null);

  const loadDefaults = useCallback(async () => {
    try {
      const places = await loadDefaultCameroonPlaces(null);
      if (places.length === 0) {
        setPlacesError('No places found. Try searching (e.g. "orphanage Douala").');
      } else {
        setPlacesError(null);
      }
      return places;
    } catch (err) {
      console.error(err);
      setPlacesError('OpenStreetMap search failed. Check your network.');
      return [];
    }
  }, []);

  const search = useCallback(async (query: string) => {
    try {
      const results = await textSearchPlaces(null, query);
      if (results.length === 0 && query.trim()) {
        setPlacesError(`No results for "${query}". Try another keyword or city.`);
      } else {
        setPlacesError(null);
      }
      return results;
    } catch (err) {
      console.error(err);
      setPlacesError('Search failed.');
      return [];
    }
  }, []);

  return {
    isLoaded: true,
    loadError: null as string | null,
    serviceReady: true,
    placesError,
    setPlacesError,
    placesDivRef: dummyRef,
    getService: () => null as null,
    loadDefaults,
    search,
  };
}
