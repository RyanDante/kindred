import { useMemo, useState, useEffect } from 'react';
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
  const [activeOrphanageId, setActiveOrphanageId] = useState<string | null>(selectedOrphanageId);
  const [hoveredOrphanageId, setHoveredOrphanageId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>(defaultCenter);
  const [mapZoom, setMapZoom] = useState<number>(7);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const cameroonOrphanages = useMemo(
    () => orphanages.filter((o) => isWithinCameroon(o.latitude, o.longitude)),
    [orphanages]
  );

  useEffect(() => {
    setActiveOrphanageId(selectedOrphanageId);
  }, [selectedOrphanageId]);

  const selectedOrphanage = cameroonOrphanages.find((o) => o.id === activeOrphanageId) ?? null;
  const hoveredOrphanage = cameroonOrphanages.find((o) => o.id === hoveredOrphanageId) ?? null;
  const focusedOrphanage = selectedOrphanage || hoveredOrphanage;

  useEffect(() => {
    if (selectedOrphanage) {
      const target = { lat: selectedOrphanage.latitude, lng: selectedOrphanage.longitude };
      setMapCenter(target);
      setMapZoom(13);
      if (mapInstance) {
        mapInstance.panTo(target);
        mapInstance.setZoom(13);
      }
    } else if (cameroonOrphanages.length > 0) {
      const lat = cameroonOrphanages.reduce((s, o) => s + o.latitude, 0) / cameroonOrphanages.length;
      const lng = cameroonOrphanages.reduce((s, o) => s + o.longitude, 0) / cameroonOrphanages.length;
      setMapCenter({ lat, lng });
      setMapZoom(7);
      if (mapInstance) {
        mapInstance.panTo({ lat, lng });
        mapInstance.setZoom(7);
      }
    } else {
      setMapCenter(defaultCenter);
      setMapZoom(7);
    }
  }, [selectedOrphanage, cameroonOrphanages, mapInstance]);

  const markers = useMemo(
    () =>
      cameroonOrphanages.map((o) => ({
        id: o.id,
        position: { lat: o.latitude, lng: o.longitude },
        title: o.name,
        color: activeOrphanageId === o.id ? '#1D4ED8' : o.verified ? '#10B981' : '#F97316',
        hoverHtml: markerHoverHtml(o.name, `${o.city}, ${o.region}`, o.photo, `Capacity: ${o.capacity}`),
      })),
    [cameroonOrphanages, activeOrphanageId]
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
    <div className="relative w-full min-h-[420px] h-full rounded-xl overflow-hidden border border-slate-200">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={mapCenter}
        zoom={mapZoom}
        onLoad={(map) => setMapInstance(map)}
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
            onClick={() => {
              setActiveOrphanageId(marker.id);
              setMapCenter(marker.position);
              setMapZoom(13);
              if (mapInstance) {
                mapInstance.panTo(marker.position);
                mapInstance.setZoom(13);
              }
            }}
            onMouseOver={() => setHoveredOrphanageId(marker.id)}
            onMouseOut={() => setHoveredOrphanageId(null)}
            icon={{
              path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z',
              fillColor: marker.color,
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: activeOrphanageId === marker.id ? 1.4 : 1.1,
            }}
          />
        ))}

        {focusedOrphanage && (
          <InfoWindow
            position={{ lat: focusedOrphanage.latitude, lng: focusedOrphanage.longitude }}
            onCloseClick={() => setActiveOrphanageId(null)}
          >
            <div className="max-w-xs text-[13px] leading-snug text-slate-800 font-sans">
              <strong className="block text-sm font-semibold mb-1">{focusedOrphanage.name}</strong>
              <div className="text-slate-600 text-[11px]">{focusedOrphanage.city}, {focusedOrphanage.region}</div>
              <div className="text-[11px] text-slate-500 mt-2">Capacity: {focusedOrphanage.capacity}</div>
              {focusedOrphanage.description && (
                <div className="text-[11px] text-slate-500 mt-1 line-clamp-3">{focusedOrphanage.description}</div>
              )}
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
