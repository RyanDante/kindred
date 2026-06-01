/**
 * ---------------------------------------------------------------------------
 * GOOGLE MAPS / PLACES — DISABLED (requires billing & API keys).
 * All map + place search now uses OpenStreetMap tiles + Nominatim.
 * See: `src/utils/nominatim.ts`
 * ---------------------------------------------------------------------------
 */

export {
  mergePlacesById,
  loadDefaultCameroonPlaces,
  textSearchPlaces,
  nearbySearchPlaces,
  fetchPlaceDetails,
  placesStatusMessage,
} from './nominatim';
