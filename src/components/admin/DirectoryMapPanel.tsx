import { Loader2, MapPin, Search } from 'lucide-react';
import type { DirectoryItem, PlaceOrphanage } from '../../types/orphanage';
import AdminGoogleMap from '../maps/AdminGoogleMap';
import MapSearchSuggestions from '../ui/MapSearchSuggestions';

interface DirectoryMapPanelProps {
  mapSearchTerm: string;
  onMapSearchChange: (term: string) => void;
  mapSearchSuggestions: DirectoryItem[];
  selectedMapItemId: string | null;
  onSelectItem: (item: DirectoryItem) => void;
  filteredMapItems: DirectoryItem[];
  loading: boolean;
  /** OpenStreetMap hits for the current search — listed below the map while typing. */
  osmSearchResults: PlaceOrphanage[];
  loadingOsmPlaces: boolean;
  selectedOsmPlaceId: string | null;
  onSelectOsmPlace: (place: PlaceOrphanage) => void;
  /** Map marker selection (string id or null when a directory pin is chosen). */
  onOsmPlaceIdFromMap: (id: string | null) => void;
  mergedOsmPlaces: PlaceOrphanage[];
}

export default function DirectoryMapPanel({
  mapSearchTerm,
  onMapSearchChange,
  mapSearchSuggestions,
  selectedMapItemId,
  onSelectItem,
  filteredMapItems,
  loading,
  osmSearchResults,
  loadingOsmPlaces,
  selectedOsmPlaceId,
  onSelectOsmPlace,
  onOsmPlaceIdFromMap,
  mergedOsmPlaces,
}: DirectoryMapPanelProps) {
  const trimmed = mapSearchTerm.trim();

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-2 mb-2">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center gap-3">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search map & directory..."
            value={mapSearchTerm}
            onChange={(e) => onMapSearchChange(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder-slate-400"
          />
          {loadingOsmPlaces && <Loader2 className="h-4 w-4 animate-spin text-slate-400 shrink-0" aria-hidden />}
        </div>
        <p className="text-[10px] text-slate-400 px-1">
          Results update as you type. Matching directory rows appear above the map; nearby matches are listed below.
        </p>
        <MapSearchSuggestions
          suggestions={mapSearchSuggestions}
          onSelect={onSelectItem}
          getSubtitle={(item) => `${item.city}, ${item.region}`}
          className="bg-white border border-slate-200 rounded-xl shadow-sm max-h-60 overflow-auto"
        />
      </div>

      <div className="w-full h-[600px] bg-slate-50 rounded-2xl overflow-hidden shadow-sm">
        <AdminGoogleMap
          items={filteredMapItems}
          loading={loading}
          selectedItemId={selectedMapItemId}
          mapPlaces={mergedOsmPlaces}
          osmTypingResults={trimmed ? osmSearchResults : []}
          loadingPlaces={loadingOsmPlaces}
          selectedOsmPlaceId={selectedOsmPlaceId}
          onOsmPlaceIdChange={(id) => {
            onOsmPlaceIdFromMap(id);
          }}
        />
      </div>

      {trimmed !== '' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-slate-100 bg-slate-50/80">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 shrink-0">
              Map results ({osmSearchResults.length}
              {loadingOsmPlaces ? '…' : ''})
            </p>
            <span className="text-[10px] text-slate-400 truncate max-w-[55%]" title={mapSearchTerm}>
              “{trimmed}”
            </span>
          </div>

          {!loadingOsmPlaces && osmSearchResults.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              No matching places — try another word or city.
            </div>
          ) : (
            <ul className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {loadingOsmPlaces && osmSearchResults.length === 0 && (
                <li className="px-4 py-8 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                  Searching…
                </li>
              )}
              {osmSearchResults.slice(0, 25).map((place) => {
                const selected = selectedOsmPlaceId === place.id;
                return (
                  <li key={place.id}>
                    <button
                      type="button"
                      onClick={() => onSelectOsmPlace(place)}
                      className={`w-full text-left px-4 py-3 flex gap-3 items-start transition-colors ${
                        selected ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="mt-0.5 rounded-lg bg-blue-100 p-2 shrink-0">
                        <MapPin className="h-3.5 w-3.5 text-blue-600" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-slate-900 truncate">{place.name}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-2">{place.address}</div>
                      </div>
                      {selected && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 shrink-0">
                          On map
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {osmSearchResults.length > 25 && (
            <div className="px-4 py-2 text-[10px] text-slate-400 border-t border-slate-100 bg-slate-50/80">
              Showing first 25 results. Refine your search to narrow further.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
