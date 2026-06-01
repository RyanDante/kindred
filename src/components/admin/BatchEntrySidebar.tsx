import { Plus, Search, Info, CheckCircle, Loader2, MapPin, RefreshCw, Database } from 'lucide-react';
import type { BatchPin, Orphanage, PlaceOrphanage } from '../../types/orphanage';
import StagedPinCard from './StagedPinCard';
import CustomCoordinatesForm from './CustomCoordinatesForm';

interface BatchEntrySidebarProps {
  mapSearchQuery: string;
  onMapSearchChange: (query: string) => void;
  osmSearchResults: PlaceOrphanage[];
  databaseSearchResults: Orphanage[];
  stagedPins: BatchPin[];
  selectedPinId: string | null;
  selectedPlaceId: string | null;
  statusMessage: { type: 'success' | 'error'; text: string } | null;
  submittingBatch: boolean;
  loadingPlaces: boolean;
  loadingPlaceDetails: boolean;
  osmPlacesCount: number;
  customName: string;
  customLat: string;
  customLng: string;
  onCustomNameChange: (value: string) => void;
  onCustomLatChange: (value: string) => void;
  onCustomLngChange: (value: string) => void;
  onStageCustomCoordinates: (e: React.FormEvent) => void;
  onStagePlace: (place: PlaceOrphanage) => void;
  onSelectPlace: (place: PlaceOrphanage) => void;
  onSelectExisting: (orphanage: Orphanage) => void;
  onSelectPin: (id: string) => void;
  onRemoveStage: (id: string) => void;
  onStageUpdate: (id: string, field: keyof BatchPin, value: string | number | boolean) => void;
  onSubmitBatch: () => void;
  onReloadOsmPlaces: () => void;
}

function OsmResultRow({
  place,
  isSelected,
  loadingPlaceDetails,
  onSelect,
  onStage,
}: {
  place: PlaceOrphanage;
  isSelected: boolean;
  loadingPlaceDetails: boolean;
  onSelect: () => void;
  onStage: () => void;
}) {
  return (
    <div className={`flex items-center gap-2 px-4 py-3 border-b last:border-b-0 transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
      {place.photo ? (
        <img src={place.photo} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200" />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-blue-100 shrink-0 flex items-center justify-center">
          <MapPin size={14} className="text-blue-600" />
        </div>
      )}
      <button type="button" onClick={onSelect} className="flex-1 text-left min-w-0">
        <div className="font-semibold text-slate-900 truncate">{place.name}</div>
        <div className="text-[11px] text-slate-500 truncate">{place.address}</div>
        {place.rating != null && (
          <div className="text-[10px] text-amber-600 font-bold">{place.rating}/5 (listed rating)</div>
        )}
      </button>
      <button
        type="button"
        onClick={onStage}
        disabled={loadingPlaceDetails}
        className="shrink-0 rounded-xl bg-[#1E3A8A] hover:bg-[#152960] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 disabled:opacity-50"
      >
        Import
      </button>
    </div>
  );
}

export default function BatchEntrySidebar({
  mapSearchQuery,
  onMapSearchChange,
  osmSearchResults,
  databaseSearchResults,
  stagedPins,
  selectedPinId,
  selectedPlaceId,
  statusMessage,
  submittingBatch,
  loadingPlaces,
  loadingPlaceDetails,
  osmPlacesCount,
  customName,
  customLat,
  customLng,
  onCustomNameChange,
  onCustomLatChange,
  onCustomLngChange,
  onStageCustomCoordinates,
  onStagePlace,
  onSelectPlace,
  onSelectExisting,
  onSelectPin,
  onRemoveStage,
  onStageUpdate,
  onSubmitBatch,
  onReloadOsmPlaces,
}: BatchEntrySidebarProps) {
  const isSearching = mapSearchQuery.trim().length > 0;

  return (
    <div className="w-full xl:w-[360px] flex flex-col gap-4 shrink-0">
      <div className="bg-[#EFF6FF] border border-blue-100 rounded-xl p-4 flex gap-3">
        <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
        <p className="text-[10px] font-black text-blue-800 uppercase tracking-wide leading-relaxed">
          Search uses OpenStreetMap data (Nominatim). Blue map pins are live places — click Import to choose name, coordinates, and other fields before saving.
        </p>
      </div>

      <div className="relative bg-white rounded-xl border border-slate-200 shadow-sm flex items-center pr-1.5 pl-4 overflow-hidden focus-within:border-blue-300">
        <Search className="text-slate-400 mr-2.5 shrink-0" size={16} />
        <input
          type="text"
          placeholder="Search places (e.g. orphanage Douala)..."
          value={mapSearchQuery}
          onChange={(e) => onMapSearchChange(e.target.value)}
          className="w-full text-xs font-medium text-slate-700 bg-transparent outline-none py-3 placeholder-slate-400"
        />
        {loadingPlaces && <Loader2 className="animate-spin text-slate-400 mr-2 shrink-0" size={14} />}
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-blue-600">
          <MapPin size={12} />
          <span>{osmPlacesCount} OSM results on map</span>
        </div>
        <button
          type="button"
          onClick={onReloadOsmPlaces}
          disabled={loadingPlaces}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-[#1E3A8A] disabled:opacity-50"
        >
          <RefreshCw size={11} className={loadingPlaces ? 'animate-spin' : ''} />
          Reload
        </button>
      </div>

      {isSearching && (
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2 px-1">
              OpenStreetMap ({osmSearchResults.length})
            </p>
            <div className="bg-white border border-blue-100 rounded-3xl shadow-sm overflow-hidden max-h-52 overflow-y-auto">
              {osmSearchResults.length > 0 ? (
                osmSearchResults.map((place) => (
                  <OsmResultRow
                    key={place.id}
                    place={place}
                    isSelected={place.id === selectedPlaceId}
                    loadingPlaceDetails={loadingPlaceDetails}
                    onSelect={() => onSelectPlace(place)}
                    onStage={() => onStagePlace(place)}
                  />
                ))
              ) : (
                <div className="px-4 py-6 text-center text-[11px] text-slate-400">
                  {loadingPlaces ? 'Searching OpenStreetMap...' : 'No OSM results — try another search term'}
                </div>
              )}
            </div>
          </div>

          {databaseSearchResults.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-1 flex items-center gap-1">
                <Database size={11} />
                Already in database ({databaseSearchResults.length})
              </p>
              <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                {databaseSearchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectExisting(item)}
                    className="w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-slate-50 transition-colors"
                  >
                    <div className="font-semibold text-slate-900 truncate">{item.name}</div>
                    <div className="text-[11px] text-slate-500">{item.city}, {item.region}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!isSearching && osmPlacesCount > 0 && (
        <p className="text-[11px] text-slate-500 px-1 leading-relaxed">
          {osmPlacesCount} places loaded from OpenStreetMap. Search to filter, or click blue pins on the map to import.
        </p>
      )}

      <CustomCoordinatesForm
        customName={customName}
        customLat={customLat}
        customLng={customLng}
        onNameChange={onCustomNameChange}
        onLatChange={onCustomLatChange}
        onLngChange={onCustomLngChange}
        onSubmit={onStageCustomCoordinates}
      />

      <div className="bg-white border border-slate-200/60 rounded-3xl p-6 min-h-[280px] flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">Staged Locations</p>
            <p className="text-sm font-semibold text-slate-700">{stagedPins.length} item(s)</p>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`rounded-3xl p-4 text-sm ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                : 'bg-rose-50 text-rose-800 border border-rose-100'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="space-y-3 overflow-y-auto max-h-[300px]">
          {stagedPins.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-3xl p-6 text-center text-slate-400">
              <Plus size={18} className="mx-auto mb-2" />
              <p className="text-[11px] font-bold uppercase tracking-[0.24em]">No staged orphanages yet</p>
            </div>
          ) : (
            stagedPins.map((pin) => (
              <StagedPinCard
                key={pin.id}
                pin={pin}
                isSelected={selectedPinId === pin.id}
                onSelect={onSelectPin}
                onRemove={onRemoveStage}
                onUpdate={onStageUpdate}
              />
            ))
          )}
        </div>

        <button
          type="button"
          onClick={onSubmitBatch}
          disabled={submittingBatch || stagedPins.length === 0}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1E3A8A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#152960] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submittingBatch ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
          {submittingBatch ? 'Saving...' : 'Save all staged entries'}
        </button>
      </div>
    </div>
  );
}
