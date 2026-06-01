import { useMemo } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import type { Orphanage } from '../../types/orphanage';
import { CAMEROON_BOUNDS, defaultCenter, isWithinCameroon } from '../../constants/maps';

interface OrphanagesGoogleMapProps {
  orphanages: Orphanage[];
  loading?: boolean;
  selectedOrphanageId?: string | null;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

function markerHoverHtml(
  name: string,
  subtitle: string,
  photo?: string,
  extra?: string
): string {
  return `
    <div class="w-[210px]">
      ${
        photo
          ? `<img src="${esc(photo)}" alt="${esc(name)}" class="w-full h-24 object-cover rounded-md border border-slate-200 mb-2" />`
          : ''
      }
      <div class="text-[12px] font-bold text-slate-900 truncate">${esc(name)}</div>
      <div class="text-[10px] text-slate-500 truncate">${esc(subtitle)}</div>
      ${extra ? `<div class="text-[10px] text-slate-600 mt-1 truncate">${esc(extra)}</div>` : ''}
    </div>
  `;
}

export default function OrphanagesGoogleMap({
  orphanages,
  loading = false,
  selectedOrphanageId = null,
}: OrphanagesGoogleMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const cameroonOrphanages = useMemo(
    () => orphanages.filter((o) => isWithinCameroon(o.latitude, o.longitude)),
    [orphanages]
  );

  const selectedOrphanage = cameroonOrphanages.find((o) => o.id === selectedOrphanageId) ?? null;

  const center = useMemo(() => {
    if (selectedOrphanage) return { lat: selectedOrphanage.latitude, lng: selectedOrphanage.longitude };
    if (cameroonOrphanages.length > 0) {
      const lat = cameroonOrphanages.reduce((s, o) => s + o.latitude, 0) / cameroonOrphanages.length;
      const lng = cameroonOrphanages.reduce((s, o) => s + o.longitude, 0) / cameroonOrphanages.length;
      return { lat, lng };
    }
    return defaultCenter;
  }, [selectedOrphanage, cameroonOrphanages]);

  const zoom = selectedOrphanage ? 11 : 7;

  const markers = useMemo(
    () =>
      cameroonOrphanages.map((o) => ({
        id: o.id,
        position: { lat: o.latitude, lng: o.longitude },
        title: o.name,
        color: o.verified ? '#10B981' : '#F97316',
        hoverHtml: markerHoverHtml(o.name, `${o.city}, ${o.region}`, o.photo, `Capacity: ${o.capacity}`),
        popupHtml: selectedOrphanageId === o.id
          ? `<div class="text-[13px] text-slate-800"><strong>${esc(o.name)}</strong><div class="text-slate-600 text-xs mt-1">${esc(o.city)}, ${esc(o.region)}</div><p class="text-xs text-slate-500 mt-2 line-clamp-3">${esc(o.description || 'No description.')}</p><div class="text-[11px] text-slate-500">Capacity: <b>${o.capacity}</b></div></div>`
          : undefined,
      })),
    [cameroonOrphanages, selectedOrphanageId]
  );

  if (loading || !isLoaded) {
    return (
      <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
        <p className="text-sm text-slate-500">Syncing with live directory...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 text-red-500">
        <p>Error loading Google Maps.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-200">
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
          maxZoom: 18,
        }}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            title={marker.title}
            icon={{
              path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z',
              fillColor: marker.color,
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 1.1,
            }}
          />
        ))}

        {selectedOrphanage && (
          <InfoWindow
            position={{ lat: selectedOrphanage.latitude, lng: selectedOrphanage.longitude }}
            onCloseClick={() => undefined}
          >
            <div className="max-w-xs text-[13px] leading-snug text-slate-800 font-sans">
              <strong className="block text-sm font-semibold mb-1">{selectedOrphanage.name}</strong>
              <div className="text-slate-600 text-[11px]">{selectedOrphanage.city}, {selectedOrphanage.region}</div>
              <div className="text-[11px] text-slate-500 mt-2">Capacity: {selectedOrphanage.capacity}</div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      {cameroonOrphanages.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 pointer-events-none z-[400]">
          <p className="text-sm text-slate-500">No Cameroon listings to display</p>
        </div>
      )}
    </div>
  );
}
