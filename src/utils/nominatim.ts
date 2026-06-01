/**
 * OpenStreetMap Nominatim (free geocoder / POI search).
 * https://operations.osmfoundation.org/policies/nominatim/
 * Use a low request rate; we debounce searches in the UI.
 */
import type { PlaceOrphanage } from '../types/orphanage';
import { deriveAddressParts } from './search';

const NOMINATIM =
  import.meta.env.VITE_NOMINATIM_BASE_URL?.trim() || '/api/nominatim';

/** Identify your app per Nominatim policy (no billing required). */
function nominatimHeaders(): HeadersInit {
  return {
    Accept: 'application/json',
    'Accept-Language': 'en',
  };
}

interface NominatimResult {
  place_id: number;
  osm_type?: string;
  osm_id?: number;
  lat: string;
  lon: string;
  display_name: string;
  class?: string;
  type?: string;
  importance?: number;
}

function buildOsmLink(r: NominatimResult): string | undefined {
  if (!r.osm_type || r.osm_id == null) return undefined;
  const t = r.osm_type.toLowerCase();
  if (t === 'node' || t === 'way' || t === 'relation') {
    return `https://www.openstreetmap.org/${t}/${r.osm_id}`;
  }
  return undefined;
}

function nominatimId(r: NominatimResult): string {
  if (r.osm_type && r.osm_id != null) {
    const prefix = r.osm_type[0].toUpperCase();
    return `osm:${prefix}:${r.osm_id}`;
  }
  return `nominatim:place:${r.place_id}`;
}

export function parseNominatimResult(r: NominatimResult): PlaceOrphanage | null {
  const lat = parseFloat(r.lat);
  const lon = parseFloat(r.lon);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

  const address = r.display_name || 'Cameroon';
  const { city, region } = deriveAddressParts(address);

  return {
    id: nominatimId(r),
    placeId: nominatimId(r),
    name: r.display_name.split(',')[0]?.trim() || 'Place',
    address,
    city,
    region,
    latitude: lat,
    longitude: lon,
    description: r.display_name,
    googleMapsUrl: buildOsmLink(r) ?? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`,
  };
}

async function nominatimSearch(params: Record<string, string>): Promise<PlaceOrphanage[]> {
  const qs = new URLSearchParams({ format: 'json', addressdetails: '1', ...params });
  const url = `${NOMINATIM}/search?${qs.toString()}`;

  const res = await fetch(url, { headers: nominatimHeaders(), mode: 'cors' });
  if (!res.ok) {
    console.warn('Nominatim search failed', res.status);
    return [];
  }

  const data = (await res.json()) as NominatimResult[];
  if (!Array.isArray(data)) return [];

  return data.map(parseNominatimResult).filter((p): p is PlaceOrphanage => p !== null);
}

export async function textSearchPlaces(_serviceUnused: null, query: string): Promise<PlaceOrphanage[]> {
  const q = query.toLowerCase().includes('cameroon') ? query : `${query} Cameroon`;
  return nominatimSearch({ q, limit: '25' });
}

const CAMEROON_CITY_SEEDS = [
  'Yaounde',
  'Douala',
  'Bafoussam',
  'Bamenda',
  'Garoua',
  'Maroua',
  'Ngaoundere',
  'Buea',
  'Limbe',
  'Ebolowa',
  'Bertoua',
  'Kribi',
];

const DEFAULT_QUERIES = [
  'orphanage Cameroon',
  'children home Cameroon',
  'centre accueil enfants Cameroon',
  ...CAMEROON_CITY_SEEDS.flatMap((city) => [
    `orphanage ${city} Cameroon`,
    `children home ${city} Cameroon`,
    `charity ${city} Cameroon`,
  ]),
];

export async function loadDefaultCameroonPlaces(_serviceUnused: null): Promise<PlaceOrphanage[]> {
  const lists = await Promise.all(DEFAULT_QUERIES.map((q) => nominatimSearch({ q, limit: '18' })));
  return mergePlacesById(...lists);
}

export function mergePlacesById(...lists: PlaceOrphanage[][]): PlaceOrphanage[] {
  const map = new Map<string, PlaceOrphanage>();
  for (const list of lists) {
    for (const place of list) {
      if (place.id && place.latitude != null && place.longitude != null) {
        map.set(place.id, place);
      }
    }
  }
  return Array.from(map.values());
}

/** Search near a point (map click) — bounded box around lat/lng. */
export async function nearbySearchPlaces(
  _serviceUnused: null,
  lat: number,
  lng: number,
  keyword = 'orphanage'
): Promise<PlaceOrphanage[]> {
  const delta = 0.06;
  const left = lng - delta;
  const right = lng + delta;
  const bottom = lat - delta;
  const top = lat + delta;
  const viewbox = `${left},${top},${right},${bottom}`;
  return nominatimSearch({
    q: keyword,
    bounded: '1',
    viewbox,
    limit: '10',
  });
}

/** Extra details for a place (same shape as search result, richer address). */
export async function fetchPlaceDetails(_serviceUnused: null, placeId: string): Promise<PlaceOrphanage> {
  const osmMatch = /^osm:([NWR]):(\d+)$/i.exec(placeId);
  if (osmMatch) {
    const osm_ids = `${osmMatch[1].toUpperCase()}${osmMatch[2]}`;
    const url = `${NOMINATIM}/lookup?osm_ids=${osm_ids}&format=json&addressdetails=1`;
    const res = await fetch(url, { headers: nominatimHeaders(), mode: 'cors' });
    if (!res.ok) throw new Error(`Nominatim lookup failed: ${res.status}`);
    const data = (await res.json()) as NominatimResult | NominatimResult[];
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new Error('No lookup result');
    const parsed = parseNominatimResult(row);
    if (!parsed) throw new Error('Invalid lookup result');
    return parsed;
  }

  const placeMatch = /^nominatim:place:(\d+)$/.exec(placeId);
  if (placeMatch) {
    const url = `${NOMINATIM}/details?place_id=${placeMatch[1]}&format=json&addressdetails=1`;
    const res = await fetch(url, { headers: nominatimHeaders(), mode: 'cors' });
    if (!res.ok) throw new Error(`Nominatim details failed: ${res.status}`);
    const row = (await res.json()) as NominatimResult & { centroid?: { coordinates?: [number, number] } };
    if (row.lat && row.lon) {
      const parsed = parseNominatimResult(row as NominatimResult);
      if (parsed) return parsed;
    }
  }

  throw new Error('Unsupported place id for lookup');
}

export function placesStatusMessage(status: string): string {
  return `Nominatim: ${status}`;
}
