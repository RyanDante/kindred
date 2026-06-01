import { useMemo } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { CAMEROON_BOUNDS, defaultCenter } from '../../constants/maps';

interface GoogleMapPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  disabled?: boolean;
}

export default function GoogleMapPicker({
  latitude,
  longitude,
  onLocationChange,
  disabled = false,
}: GoogleMapPickerProps) {
  const lat = latitude || defaultCenter.lat;
  const lng = longitude || defaultCenter.lng;
  const center = useMemo(() => ({ lat, lng }), [lat, lng]);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    const newLat = event.latLng?.lat();
    const newLng = event.latLng?.lng();
    if (newLat === undefined || newLng === undefined) return;
    onLocationChange(newLat, newLng);
  };

  const handleMarkerDragEnd = (event: google.maps.MapMouseEvent) => {
    const newLat = event.latLng?.lat();
    const newLng = event.latLng?.lng();
    if (newLat === undefined || newLng === undefined) return;
    onLocationChange(newLat, newLng);
  };

  return (
    <div className={`relative rounded-lg overflow-hidden border border-slate-200 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      {!isLoaded ? (
        <div className="w-full h-[350px] flex items-center justify-center bg-slate-50 text-slate-500">Loading Google Maps…</div>
      ) : loadError ? (
        <div className="w-full h-[350px] flex items-center justify-center bg-slate-50 text-red-500">Error loading Google Maps.</div>
      ) : (
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '350px' }}
          center={center}
          zoom={13}
          onClick={disabled ? undefined : handleMapClick}
          options={{
            clickableIcons: false,
            fullscreenControl: true,
            zoomControl: true,
            mapTypeControl: false,
            minZoom: 5,
            maxZoom: 18,
            restriction: {
              latLngBounds: CAMEROON_BOUNDS,
              strictBounds: false,
            },
          }}
        >
          <Marker
            position={center}
            draggable={!disabled}
            onDragEnd={disabled ? undefined : handleMarkerDragEnd}
          />
        </GoogleMap>
      )}
      {!disabled && (
        <div className="absolute bottom-3 left-3 z-[500] bg-white px-3 py-2 rounded-lg shadow-md text-xs text-slate-600 border border-slate-200 pointer-events-none">
          Click map to set location (Google Maps)
        </div>
      )}
    </div>
  );
}
