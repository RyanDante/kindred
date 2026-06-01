import { useMemo } from 'react';
import type { BatchPin, Orphanage, PlaceOrphanage } from '../../types/orphanage';
import { CAMEROON_MAX_BOUNDS_LEAFLET, defaultCenter } from '../../constants/maps';
import LeafletMapView, { type LeafletMarkerSpec } from '../maps/LeafletMapView';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

interface BatchEntryMapProps {
  mapsReady: boolean;
  orphanages: Orphanage[];
  mapPlaces: PlaceOrphanage[];
  stagedPins: BatchPin[];
  selectedPin: BatchPin | null;
  selectedExisting: Orphanage | null;
  selectedPlaceId: string | null;
  loadingOrphanages: boolean;
  loadingPlaces: boolean;
  onMapClick: (lat: number, lng: number) => void;
  onSelectExisting: (id: string) => void;
  onSelectPlace: (id: string) => void;
  onSelectStagedPin: (id: string) => void;
}

export default function BatchEntryMap({
  mapsReady,
  orphanages,
  mapPlaces,
  stagedPins,
  selectedPin,
  selectedExisting,
  selectedPlaceId,
  loadingOrphanages,
  loadingPlaces,
  onMapClick,
  onSelectExisting,
  onSelectPlace,
  onSelectStagedPin,
}: BatchEntryMapProps) {
  const selectedPlaceMarker = mapPlaces.find((place) => place.id === selectedPlaceId) ?? null;

  const center = useMemo(() => {
    if (selectedPlaceMarker) return { lat: selectedPlaceMarker.latitude, lng: selectedPlaceMarker.longitude };
    if (selectedExisting) return { lat: selectedExisting.latitude, lng: selectedExisting.longitude };
    if (selectedPin) return { lat: selectedPin.latitude, lng: selectedPin.longitude };
    if (mapPlaces.length > 0) return { lat: mapPlaces[0].latitude, lng: mapPlaces[0].longitude };
    return defaultCenter;
  }, [selectedPlaceMarker, selectedExisting, selectedPin, mapPlaces]);

  const zoom = selectedPlaceMarker || selectedExisting || selectedPin ? 12 : mapPlaces.length > 0 ? 8 : 7;

  const markers: LeafletMarkerSpec[] = useMemo(() => {
    const list: LeafletMarkerSpec[] = [];

    for (const o of orphanages) {
      const sel = selectedExisting?.id === o.id;
      const baseColor = o.verified ? '#10B981' : '#F97316';
      list.push({
        id: `db-${o.id}`,
        lat: o.latitude,
        lng: o.longitude,
        style: 'circle',
        color: sel ? '#047857' : baseColor,
        title: o.name,
        popupHtml: `<div class="text-[13px]"><strong>${esc(o.name)}</strong><div class="text-xs text-slate-600">${esc(o.city)}, ${esc(o.region)}</div>${sel ? `<div class="text-[10px] font-bold mt-2 text-emerald-700">Selected</div>` : ''}<div class="text-[10px] text-slate-400 mt-1">In database</div></div>`,
      });
    }

    for (const p of mapPlaces) {
      const sel = p.id === selectedPlaceId;
      list.push({
        id: `osm-${p.id}`,
        lat: p.latitude,
        lng: p.longitude,
        style: 'circle',
        color: sel ? '#1D4ED8' : '#2563EB',
        title: p.name,
        popupHtml: `<div class="text-[13px]"><strong>${esc(p.name)}</strong><div class="text-xs text-slate-600">${esc(p.address)}</div><p class="text-[10px] text-slate-500 mt-2">Use <b>Import</b> in the sidebar to choose fields.</p></div>`,
      });
    }

    for (const pin of stagedPins) {
      const sel = selectedPin?.id === pin.id;
      list.push({
        id: `staged-${pin.id}`,
        lat: pin.latitude,
        lng: pin.longitude,
        style: 'circle',
        color: sel ? '#6D28D9' : '#8B5CF6',
        title: `Staged: ${pin.name}`,
        popupHtml: `<div class="text-[13px]"><strong>${esc(pin.name)}</strong><div class="text-xs text-slate-500">${esc(pin.city)}, ${esc(pin.region)}</div>${sel ? `<div class="text-[10px] font-bold mt-2 text-violet-800">Selected</div>` : ''}<div class="text-[10px] text-violet-600 mt-2 font-bold uppercase">Staged — not saved</div></div>`,
      });
    }

    return list;
  }, [orphanages, mapPlaces, stagedPins, selectedExisting, selectedPlaceId, selectedPin]);

  const onMarkerClick = (id: string) => {
    if (id.startsWith('db-')) onSelectExisting(id.slice(3));
    else if (id.startsWith('osm-')) onSelectPlace(id.slice(4));
    else if (id.startsWith('staged-')) onSelectStagedPin(id.slice(7));
  };

  return (
    <div className="flex-1 bg-[#E2E8F0]/40 rounded-3xl border border-slate-200 relative overflow-hidden min-h-[560px]">
      <div className="absolute top-6 right-6 z-[500] flex flex-col gap-2 pointer-events-none">
        <div className="bg-white/95 backdrop-blur border border-slate-200/80 rounded-2xl px-5 py-3 shadow-lg text-left min-w-[120px]">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Staged</span>
          <span className="text-xs font-black text-slate-800 uppercase tracking-wide">{stagedPins.length} entries</span>
        </div>
        <div className="bg-blue-50/95 backdrop-blur border border-blue-200/80 rounded-2xl px-5 py-3 text-left">
          <span className="text-[9px] font-bold uppercase tracking-wider text-blue-500 block mb-0.5">OpenStreetMap</span>
          <span className="text-xs font-black text-blue-800 uppercase tracking-wide">{mapPlaces.length} on map</span>
        </div>
      </div>

      {!mapsReady || loadingOrphanages ? (
        <div className="flex items-center justify-center h-full min-h-[560px] text-slate-400">
          <p className="text-sm">Loading map...</p>
        </div>
      ) : (
        <LeafletMapView
          className="min-h-[560px]"
          height="560px"
          centerLat={center.lat}
          centerLng={center.lng}
          zoom={zoom}
          maxBounds={CAMEROON_MAX_BOUNDS_LEAFLET}
          markers={markers}
          onMapClick={onMapClick}
          onMarkerClick={onMarkerClick}
        />
      )}

      {loadingPlaces && mapsReady && (
        <div className="absolute bottom-6 left-6 z-[500] bg-white/95 backdrop-blur border border-slate-200 rounded-xl px-4 py-2 shadow-lg flex items-center gap-2 text-xs text-slate-600">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Loading places…
        </div>
      )}

      {mapsReady && mapPlaces.length === 0 && !loadingPlaces && (
        <div className="absolute bottom-6 left-6 z-[500] bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 shadow-lg text-xs text-amber-800 max-w-xs">
          No OSM results yet — use Reload or search in the sidebar.
        </div>
      )}
    </div>
  );
}
