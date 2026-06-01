export const CAMEROON_BOUNDS = {
  north: 13.075,
  south: 1.2,
  west: 8.5,
  east: 16.25,
};

export const defaultCenter = {
  lat: 6.613,
  lng: 12.125,
};

/** Leaflet maxBounds: south-west corner, then north-east [[lat,lng],[lat,lng]] */
export const CAMEROON_MAX_BOUNDS_LEAFLET: [[number, number], [number, number]] = [
  [CAMEROON_BOUNDS.south, CAMEROON_BOUNDS.west],
  [CAMEROON_BOUNDS.north, CAMEROON_BOUNDS.east],
];

export function isWithinCameroon(lat: number, lng: number): boolean {
  return (
    lat >= CAMEROON_BOUNDS.south &&
    lat <= CAMEROON_BOUNDS.north &&
    lng >= CAMEROON_BOUNDS.west &&
    lng <= CAMEROON_BOUNDS.east
  );
}
