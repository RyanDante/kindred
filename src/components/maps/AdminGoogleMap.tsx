import { useCallback, useMemo, useState } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import type { DirectoryItem, PlaceOrphanage } from '../../types/orphanage';
import { CAMEROON_BOUNDS, defaultCenter, isWithinCameroon } from '../../constants/maps';

interface AdminGoogleMapProps {
  items: DirectoryItem[];
  loading?: boolean;
  selectedItemId?: string | null;
  /** Merged default + search OpenStreetMap places (from parent). */
  mapPlaces: PlaceOrphanage[];
  /** Current debounced search hits (frames map when no pin is selected). */
  osmTypingResults?: PlaceOrphanage[];
  loadingPlaces?: boolean;
  selectedOsmPlaceId?: string | null;
  onOsmPlaceIdChange?: (id: string | null) => void;
}

export default function AdminGoogleMap({
  items,
  loading = false,
  selectedItemId = null,
  mapPlaces,
  osmTypingResults = [],
  loadingPlaces = false,
  selectedOsmPlaceId = null,
  onOsmPlaceIdChange,
}: AdminGoogleMapProps) {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const cameroonItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.latitude !== undefined &&
          item.longitude !== undefined &&
          isWithinCameroon(item.latitude, item.longitude)
      ),
    [items]
  );

  const selectedItem = cameroonItems.find((item) => item.id === (selectedItemId ?? activeItemId)) ?? null;
  const selectedPlace = mapPlaces.find((place) => place.id === selectedOsmPlaceId) ?? null;

  const center = useMemo<google.maps.LatLngLiteral>(() => {
    if (selectedItem) return { lat: selectedItem.latitude!, lng: selectedItem.longitude! };
    if (selectedPlace) return { lat: selectedPlace.latitude, lng: selectedPlace.longitude };
    if (osmTypingResults.length > 0) return { lat: osmTypingResults[0].latitude, lng: osmTypingResults[0].longitude };
    if (mapPlaces.length > 0) {
      const lat = mapPlaces.reduce((s, p) => s + p.latitude, 0) / mapPlaces.length;
      const lng = mapPlaces.reduce((s, p) => s + p.longitude, 0) / mapPlaces.length;
      return { lat, lng };
    }
    return defaultCenter;
  }, [selectedItem, selectedPlace, osmTypingResults, mapPlaces]);

  const zoom = selectedItem || selectedPlace || osmTypingResults.length > 0 ? 11 : 7;

  const onMarkerClick = useCallback(
    (id: string) => {
      if (id.startsWith('db-')) {
        setActiveItemId(id.slice(3));
        onOsmPlaceIdChange?.(null);
      } else if (id.startsWith('osm-')) {
        onOsmPlaceIdChange?.(id.slice(4));
        setActiveItemId(null);
      }
    },
    [onOsmPlaceIdChange]
  );

  if (loading || !isLoaded) {
    return (
      <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
        <p className="text-sm text-slate-500">Loading map data...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 text-red-500">
        <p>Google Maps failed to load.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-slate-200">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={zoom}
        options={{
          clickableIcons: false,
          fullscreenControl: true,
          zoomControl: true,
          mapTypeControl: false,
          restriction: {
            latLngBounds: CAMEROON_BOUNDS,
            strictBounds: false,
          },
          minZoom: 5,
          maxZoom: 12,
        }}
      >
        {cameroonItems.map((item) => (
          <Marker
            key={`db-${item.id}`}
            position={{ lat: item.latitude!, lng: item.longitude! }}
            title={item.name}
            onClick={() => onMarkerClick(`db-${item.id}`)}
            icon={{
              path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z',
              fillColor: item.verified ? '#10B981' : '#F97316',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 1.1,
            }}
          />
        ))}

        {mapPlaces.map((place) => (
          <Marker
            key={`osm-${place.id}`}
            position={{ lat: place.latitude, lng: place.longitude }}
            title={place.name}
            onClick={() => onMarkerClick(`osm-${place.id}`)}
            icon={{
              path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z',
              fillColor: selectedOsmPlaceId === place.id ? '#1D4ED8' : '#2563EB',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 1.1,
            }}
          />
        ))}

        {selectedItem && (
          <InfoWindow
            position={{ lat: selectedItem.latitude!, lng: selectedItem.longitude! }}
            onCloseClick={() => setActiveItemId(null)}
          >
            <div className="max-w-xs text-[13px] leading-snug text-slate-800 font-sans">
              <strong className="block text-sm font-semibold mb-1">{selectedItem.name}</strong>
              <div className="text-slate-600 text-[11px]">{selectedItem.city}, {selectedItem.region}</div>
              <div className="text-[11px] text-slate-500 mt-2">Verified: {selectedItem.verified ? 'Yes' : 'No'}</div>
            </div>
          </InfoWindow>
        )}

        {selectedPlace && (
          <InfoWindow
            position={{ lat: selectedPlace.latitude, lng: selectedPlace.longitude }}
            onCloseClick={() => onOsmPlaceIdChange?.(null)}
          >
            <div className="max-w-xs text-[13px] leading-snug text-slate-800 font-sans">
              <strong className="block text-sm font-semibold mb-1">{selectedPlace.name}</strong>
              <div className="text-slate-600 text-[11px]">{selectedPlace.address}</div>
              <div className="text-[11px] text-slate-500 mt-2">Click the place to stage it to the batch.</div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {cameroonItems.length === 0 && mapPlaces.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/95 z-[400] pointer-events-none">
          <p className="text-sm text-slate-500">No locations — try another search term.</p>
        </div>
      )}

      {loadingPlaces && (
        <div className="absolute bottom-4 left-4 z-[500] bg-white/95 border border-slate-200 rounded-xl px-4 py-2 shadow-lg text-xs text-slate-600 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Loading map search...
        </div>
      )}

      {mapPlaces.length > 0 && (
        <div className="absolute top-4 right-4 z-[500] bg-blue-50/95 border border-blue-200 rounded-xl px-4 py-2 shadow-lg text-[10px] font-bold uppercase tracking-wider text-blue-800">
          {mapPlaces.length} results
        </div>
      )}
    </div>
  );
}
