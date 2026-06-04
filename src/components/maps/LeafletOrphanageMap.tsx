import { useMemo } from 'react';
import type { Orphanage } from '../../types/orphanage';
import LeafletMapView, { type LeafletMarkerSpec } from './LeafletMapView';
import { CAMEROON_MAX_BOUNDS_LEAFLET, defaultCenter, isWithinCameroon } from '../../constants/maps';

interface LeafletOrphanageMapProps {
  orphanages: Orphanage[];
  loading?: boolean;
  selectedOrphanageId?: string | null;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

function markerPopupHtml(orphanage: Orphanage) {
  return `
    <div class="text-[13px] leading-tight">
      <div class="font-bold text-slate-900 mb-1">${esc(orphanage.name)}</div>
      <div class="text-[11px] text-slate-500 mb-1">${esc(orphanage.city)}, ${esc(orphanage.region)}</div>
      <div class="text-[11px] text-slate-500 mb-1">Capacity: ${orphanage.capacity}</div>
      ${orphanage.description ? `<div class="text-[10px] text-slate-600 line-clamp-3">${esc(orphanage.description)}</div>` : ''}
    </div>
  `;
}

export default function LeafletOrphanageMap({ orphanages, loading = false, selectedOrphanageId = null }: LeafletOrphanageMapProps) {
  const cameroonOrphanages = useMemo(
    () => orphanages.filter((o) => isWithinCameroon(o.latitude, o.longitude)),
    [orphanages]
  );

  const selectedOrphanage = cameroonOrphanages.find((o) => o.id === selectedOrphanageId) ?? null;

  const { center, zoom } = useMemo(() => {
    if (selectedOrphanage) {
      return { center: { lat: selectedOrphanage.latitude, lng: selectedOrphanage.longitude }, zoom: 13 };
    }

    if (cameroonOrphanages.length > 0) {
      const avgLat = cameroonOrphanages.reduce((sum, o) => sum + o.latitude, 0) / cameroonOrphanages.length;
      const avgLng = cameroonOrphanages.reduce((sum, o) => sum + o.longitude, 0) / cameroonOrphanages.length;
      return { center: { lat: avgLat, lng: avgLng }, zoom: 7 };
    }

    return { center: { lat: defaultCenter.lat, lng: defaultCenter.lng }, zoom: 7 };
  }, [selectedOrphanage, cameroonOrphanages]);

  const markers: LeafletMarkerSpec[] = useMemo(
    () =>
      cameroonOrphanages.map((orphanage) => ({
        id: orphanage.id,
        lat: orphanage.latitude,
        lng: orphanage.longitude,
        style: 'circle',
        color: orphanage.verified ? '#10B981' : '#F97316',
        title: orphanage.name,
        popupHtml: markerPopupHtml(orphanage),
      })),
    [cameroonOrphanages]
  );

  if (loading) {
    return (
      <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
        <p className="text-sm text-slate-500">Syncing with live directory...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-200 bg-white">
      <LeafletMapView
        className="min-h-[420px]"
        height="100%"
        centerLat={center.lat}
        centerLng={center.lng}
        zoom={zoom}
        maxBounds={CAMEROON_MAX_BOUNDS_LEAFLET}
        markers={markers}
        minZoom={5}
        maxZoom={18}
      />
      {cameroonOrphanages.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
          <p className="text-sm text-slate-500">No Cameroon listings to display.</p>
        </div>
      )}
    </div>
  );
}
